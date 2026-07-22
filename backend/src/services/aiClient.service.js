import axios from 'axios';


const AI_SERVICE_URL =
process.env.AI_SERVICE_URL ||
'http://127.0.0.1:8000';



export const generateAIReply = async ({
    prompt,
    messages=[],
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
        );


        return response.data.response;



    }catch(error){


        console.error(
            'AI Service Error:',
            error.message,
        );


        throw new Error(
            'AI service unavailable',
        );

    }


};