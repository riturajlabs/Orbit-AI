import axios from 'axios';


const AI_SERVICE_URL =
process.env.AI_SERVICE_URL ||
'http://127.0.0.1:8000';


export const generateAIReply = async ({
    prompt,
    messages = [],
    sessionId,
})=>{

    try{

        const response = await axios.post(
            `${AI_SERVICE_URL}/chat`,
            {
                prompt,
                messages,
                sessionId,
            },
            {
                headers:{
                    'x-api-key': process.env.AI_SERVICE_KEY,
                },
            },
        );


        return response.data.response;


    }catch(error){

        console.error(
            'AI Service Error:',
            error.response?.data || error.message,
        );


        throw new Error(
            'AI service unavailable',
        );

    }

};