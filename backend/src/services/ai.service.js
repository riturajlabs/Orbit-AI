export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

export const SYSTEM_PROMPT = `

You are Orbit AI, a powerful personal AI assistant.

Your goal:
Help users solve problems, learn concepts, build projects,
write better content, and understand technology.

Personality:
- Friendly and professional.
- Explain complex topics in simple language.
- Think like a senior developer and teacher.
- Give practical examples whenever possible.

Conversation:
- Remember previous messages in the conversation.
- Do not repeat information unnecessarily.
- Continue from previous context.

Programming rules:
When answering programming questions:

1. Explain the concept briefly.
2. Provide clean production-quality code.
3. Add comments only where useful.
4. Explain important parts after the code.
5. Mention common mistakes if relevant.

Code formatting:
- Always use Markdown.
- Always put code inside fenced blocks.

Example:

\`\`\`javascript
console.log("Hello");
\`\`\`

Technical topics:
For AI, ML, Backend, Frontend, Database,
Cloud or System Design:

Use:

## Explanation

## Example

## Best Practices


Learning style:
If user is learning:
- Teach step by step.
- Avoid assuming advanced knowledge.
- Use analogies when helpful.


Response rules:
- Be accurate.
- If unsure, clearly mention uncertainty.
- Never invent APIs, libraries or facts.
- Keep answers structured and readable.


`;


const HISTORY_TOKEN_BUDGET = 2000;
const MIN_OUTPUT_TOKENS = 512;
const MAX_OUTPUT_TOKENS = 4096;
const DEFAULT_OUTPUT_TOKENS = 2048;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const normalizeText = (value) => (typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '');

const estimateTokens = (value) => {
	const text = normalizeText(value);

	if (!text) {
		return 0;
	}

	return Math.max(1, Math.ceil(text.length / 4));
};

const estimateMessageTokens = (message) => {
	if (!message || typeof message !== 'object') {
		return 0;
	}

	return estimateTokens(`${message.role || ''} ${message.content || ''}`);
};

export const normalizeCodeBlocks = (text) => {

    return text.replace(
        '/```(\w*)\n/g',
        (_, language) => {

            if (!language) {
                return '```text\n';
            }

            return `\`\`\`${language}\n`;
        },
    );

};

const trimMessagesByBudget = (messages = [], budget = HISTORY_TOKEN_BUDGET) => {
	const normalizedMessages = Array.isArray(messages)
		? messages
				.map((message) => {
					if (!message || typeof message !== 'object') {
						return null;
					}

					const content = normalizeText(message.content);

					if (!content) {
						return null;
					}

					return {
						role: message.role === 'assistant' ? 'assistant' : 'user',
						content,
					};
				})
				.filter(Boolean)
		: [];



	const selectedMessages = [];
	let accumulatedTokens = 0;

	for (let index = normalizedMessages.length - 1; index >= 0; index -= 1) {
		const message = normalizedMessages[index];
		const messageTokens = estimateMessageTokens(message);

		if (accumulatedTokens + messageTokens > budget && selectedMessages.length > 0) {
			break;
		}

		selectedMessages.unshift(message);
		accumulatedTokens += messageTokens;
	}

	return selectedMessages;
};

export const buildGroqMessages = ({ messages = [], prompt = '' } = {}) => {
	const trimmedPrompt = normalizeText(prompt);
	const trimmedHistory = trimMessagesByBudget(messages);

	return [
		{
			role: 'system',
			content: SYSTEM_PROMPT,
		},
		...trimmedHistory,
		{
			role: 'user',
			content: trimmedPrompt,
		},
	].filter((message) => normalizeText(message.content));
};

export const getOptimizedMaxTokens = ({ messages = [], prompt = '' } = {}) => {
	const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT)
		+ messages.reduce((total, message) => total + estimateMessageTokens(message), 0)
		+ estimateTokens(prompt);

	const adaptiveReduction = Math.max(0, Math.floor((estimatedInputTokens - 300) * 0.25));
	const optimizedTokens = DEFAULT_OUTPUT_TOKENS - adaptiveReduction;

	return clamp(optimizedTokens, MIN_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS);
};

export const formatGroqResponse = (content) => {

    
    const normalized = normalizeText(content);

    if (!normalized) {
        return '';
    }


    return normalizeCodeBlocks(normalized)
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

};

export const getGroqErrorMessage = (error) => {
	if (!error) {
		return 'AI service temporarily unavailable';
	}

	const status = Number(error.status || error.response?.status || error.code);

	if (status === 401 || error.code === 'invalid_api_key') {
		return 'Groq API key is missing or invalid';
	}

	if (status === 429) {
		return 'AI service is busy right now. Please try again in a moment';
	}

	if (status >= 500) {
		return 'AI service temporarily unavailable';
	}

	if (typeof error.message === 'string' && error.message.trim()) {
		return error.message.trim();
	}

	return 'AI service temporarily unavailable';
};