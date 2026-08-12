import axios from 'axios';


const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8000';
const DEFAULT_TIMEOUT_MS = 20000;

const normalizeServiceUrl = (url) => String(url || '').replace(/\/+$/, '');

const getAIServiceUrl = () =>
    normalizeServiceUrl(process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL);

const getAIServiceKey = () => process.env.AI_SERVICE_KEY || '';

const getTimeoutMs = () => {
    const parsed = Number(process.env.AI_SERVICE_TIMEOUT_MS);

    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }

    return DEFAULT_TIMEOUT_MS;
};

export const AIProviderErrorCode = {
    AI_SERVICE_UNREACHABLE: 'AI_SERVICE_UNREACHABLE',
    AI_SERVICE_AUTH_FAILED: 'AI_SERVICE_AUTH_FAILED',
    AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
    RATE_LIMITED: 'RATE_LIMITED',
    PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
};

export class AIProviderError extends Error {
    constructor(message, code = AIProviderErrorCode.AI_SERVICE_ERROR) {
        super(message);
        this.name = 'AIProviderError';
        this.code = code;
    }
}

export const getAIServiceConfig = () => ({
    url: getAIServiceUrl(),
    keyConfigured: Boolean(getAIServiceKey()),
    timeoutMs: getTimeoutMs(),
});

const classifyProviderError = (error) => {
    if (!error || !error.response) {
        return AIProviderErrorCode.AI_SERVICE_UNREACHABLE;
    }

    const status = Number(error.response.status);
    const errorType = error.response.data?.error_type;

    if (errorType === 'not_configured') {
        return AIProviderErrorCode.PROVIDER_NOT_CONFIGURED;
    }

    if (status === 401 || status === 403) {
        return AIProviderErrorCode.AI_SERVICE_AUTH_FAILED;
    }

    if (status === 422) {
        const detail = error.response.data?.detail;
        const detailText = typeof detail === 'string'
            ? detail
            : JSON.stringify(detail || '');

        if (detailText.toLowerCase().includes('x-api-key')) {
            return AIProviderErrorCode.AI_SERVICE_AUTH_FAILED;
        }
    }

    if (status === 429) {
        return AIProviderErrorCode.RATE_LIMITED;
    }

    if (status >= 500) {
        return AIProviderErrorCode.AI_SERVICE_ERROR;
    }

    return AIProviderErrorCode.AI_SERVICE_ERROR;
};

const buildProviderError = (error) => {
    const code = classifyProviderError(error);
    const responseDetail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.response ||
        '';

    const baseMessage =
        code === AIProviderErrorCode.AI_SERVICE_UNREACHABLE
            ? `AI service unreachable at ${getAIServiceUrl()}`
            : code === AIProviderErrorCode.AI_SERVICE_AUTH_FAILED
                ? 'AI service rejected the request. AI_SERVICE_KEY mismatch.'
                : code === AIProviderErrorCode.RATE_LIMITED
                    ? 'AI service is busy right now.'
                    : code === AIProviderErrorCode.PROVIDER_NOT_CONFIGURED
                        ? 'AI provider is not configured.'
                        : 'AI service returned an error.';

    const detail = typeof responseDetail === 'string' && responseDetail.trim()
        ? ` (${responseDetail.trim()})`
        : '';

    return new AIProviderError(`${baseMessage}${detail}`, code);
};

export const generateAIReply = async ({
    prompt,
    messages = [],
    sessionId,
    modelName,
})=>{
    const url = getAIServiceUrl();
    const apiKey = getAIServiceKey();

    try{
        const response = await axios.post(
            `${url}/chat`,
            {
                prompt,
                messages,
                sessionId,
                modelName,
            },
            {
                headers: {
                    'x-api-key': apiKey,
                },
                timeout: getTimeoutMs(),
            },
        );

        if (response.data?.error_type === 'not_configured') {
            throw new AIProviderError(
                'AI provider is not configured.',
                AIProviderErrorCode.PROVIDER_NOT_CONFIGURED,
            );
        }

        return response.data.response;
    } catch (error) {
        if (error instanceof AIProviderError) {
            throw error;
        }

        const providerError = buildProviderError(error);

        console.error(
            '[AI Client] Request failed',
            {
                code: providerError.code,
                url,
                keyConfigured: Boolean(apiKey),
                detail: providerError.message,
                status: error?.response?.status || null,
            },
        );

        throw providerError;
    }
};

export const getAIProviderStatus = async () => {
    const url = getAIServiceUrl();
    const apiKey = getAIServiceKey();
    const timeout = Math.min(getTimeoutMs(), 8000);

    const tryRequest = async (path) =>
        axios.get(`${url}${path}`, {
            headers: {
                'x-api-key': apiKey,
            },
            timeout,
        });

    try {
        const response = await tryRequest('/providers/status');

        return {
            reachable: true,
            status: response.data?.status || 'ok',
            providers: response.data?.providers || null,
            message: 'AI service is reachable.',
        };
    } catch (error) {
        if (Number(error?.response?.status) === 404) {
            try {
                await tryRequest('/health');

                return {
                    reachable: true,
                    status: 'ok',
                    providers: null,
                    message:
                        'AI service is reachable, but the deployed build does not expose /providers/status yet. Redeploy the AI service to enable provider-level status.',
                };
            } catch (healthError) {
                return {
                    reachable: false,
                    status: 'error',
                    providers: null,
                    code: classifyProviderError(healthError),
                    message: buildProviderError(healthError).message,
                };
            }
        }

        return {
            reachable: false,
            status: 'error',
            providers: null,
            code: classifyProviderError(error),
            message: buildProviderError(error).message,
        };
    }
};
