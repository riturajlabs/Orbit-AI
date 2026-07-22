import Groq from 'groq-sdk';

import './env.js';

import {
    DEFAULT_GROQ_MODEL,
    buildGroqMessages,
    formatGroqResponse,
    getGroqErrorMessage,
    getOptimizedMaxTokens,
} from '../services/ai.service.js';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
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

    'llama-3.3-70b-versatile',

    'llama-3.1-8b-instant',

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
            max_tokens: getOptimizedMaxTokens({
                messages,
                prompt: safePrompt,
            }),
        });

        return formatGroqResponse(
            response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        );
    } catch (error) {
        const groqErrorMessage = getGroqErrorMessage(error);

        console.error('Groq Error:', groqErrorMessage);

        throw new Error(groqErrorMessage);
    }
};