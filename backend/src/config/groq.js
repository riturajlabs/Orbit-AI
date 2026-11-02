import Groq from 'groq-sdk';

import './env.js';

import {
    DEFAULT_GROQ_MODEL,
    buildGroqMessages,
    formatGroqResponse,
    getGroqErrorMessage,
    getOptimizedMaxTokens,
} from '../services/ai.service.js';

const isGroqConfigured = Boolean(process.env.GROQ_API_KEY);

let groq = null;

if (isGroqConfigured) {
    try {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        console.log('[Groq] Client initialized (API key set)');
    } catch (error) {
        console.error('[Groq] Client initialization failed:', error.message);
        groq = null;
    }
} else {
    console.warn('[Groq] GROQ_API_KEY is not set. Direct Groq client is disabled.');
}

export const getGroqProviderStatus = () => ({
    provider: 'groq',
    configured: isGroqConfigured,
    clientReady: Boolean(groq),
    model: DEFAULT_GROQ_MODEL,
    message: isGroqConfigured
        ? 'Groq is configured and ready.'
        : 'GROQ_API_KEY is not set. Groq is unavailable.',
});

const getTemperature = (prompt) => {


    const text = String(prompt || '')
    .toLowerCase();



    const codingKeywords = [

        'code',
        'program',
        'debug',
        'error',
        'bug',
        'javascript',
        'python',
        'react',
        'java',

    ];



    const creativeKeywords = [

        'idea',
        'story',
        'creative',
        'design',
        'name',

    ];



    if(
        codingKeywords.some(
            word=>text.includes(word),
        )
    ){

        return 0.2;

    }



    if(
        creativeKeywords.some(
            word=>text.includes(word),
        )
    ){

        return 0.8;

    }



    return 0.6;

};

const ALLOWED_MODELS = [

    'openai/gpt-oss-20b',

];


const getSafeModel = (modelName)=>{

    return ALLOWED_MODELS.includes(modelName)
        ? modelName
        : DEFAULT_GROQ_MODEL;

};

export const generateGroqReply = async ({
    messages = [],
    prompt,
    modelName = DEFAULT_GROQ_MODEL,
}) => {
    if (!groq) {
        throw new Error('Groq is not configured. GROQ_API_KEY is missing.');
    }

    try {
        const safePrompt = String(prompt || '').trim();
        const groqMessages = buildGroqMessages({
            messages,
            prompt: safePrompt,
        });

        const response = await groq.chat.completions.create({
            model:getSafeModel(modelName),
            messages: groqMessages,
            temperature: getTemperature(safePrompt),
            max_completion_tokens: getOptimizedMaxTokens({
                messages,
                prompt: safePrompt,
            }),
        });

        return formatGroqResponse(
            response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        );
    } catch (error) {
        const selectedModel = getSafeModel(modelName);
        const statusCode = Number(error?.status || error?.response?.status || 0) || null;
        const requestId = error?.headers?.['x-groq-request-id']
            || error?.response?.headers?.['x-groq-request-id']
            || null;
        const errorCategory = statusCode === 401
            ? 'authentication'
            : statusCode === 429
                ? 'rate_limit'
                : statusCode >= 500
                    ? 'provider'
                    : statusCode === 404
                        ? 'model_or_endpoint'
                        : 'request';

        console.error('[Groq] Request failed', {
            provider: 'groq',
            model: selectedModel,
            statusCode,
            errorCategory,
            requestId,
        });

        const groqErrorMessage = getGroqErrorMessage(error);

        console.error('Groq Error:', groqErrorMessage);

        throw new Error(groqErrorMessage);
    }
};
