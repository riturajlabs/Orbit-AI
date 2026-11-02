from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel, Field
import logging

from core.security import verify_api_key
from chains.chat_chain import generate_chat_response

router = APIRouter()
logger = logging.getLogger(__name__)

# Define the expected request schema
class ChatRequest(BaseModel):
    # Allow both 'prompt' and 'message' to be flexible for the frontend
    prompt: str | None = None
    message: str | None = None
    sessionId: str = Field(default="default_session")

def get_user_id(session_id: str) -> str:
    if "_" in session_id:
        return session_id.split("_")[0]
    return session_id

@router.post(
    "/chat",
    dependencies=[Depends(verify_api_key)]
)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    # Safely extract the prompt
    user_prompt = request.prompt or request.message
    
    if not user_prompt:
        raise HTTPException(status_code=400, detail="A prompt or message is required.")

    session_id = request.sessionId
    user_id = get_user_id(session_id)

    logger.debug(f"Processing chat for User ID: {user_id} | Session: {session_id}")

    try:
        # MAGIC HAPPENS HERE ✨
        # Memory fetch, Token Optimize, LLM Call, aur Background Memory Extraction
        # Sab kuch is ek function ke andar ho raha hai jo humne chat_chain.py me likha tha.
        response_content = generate_chat_response(
            user_id=user_id,
            session_id=session_id,
            user_message=user_prompt,
            background_tasks=background_tasks
        )

        # No provider configured
        if response_content == "AI_PROVIDER_NOT_CONFIGURED":
            raise HTTPException(
                status_code=503,
                detail="AI provider is not configured.",
            )

        return {
            "response": response_content
        }

    except Exception as e:
        error_msg = str(e)
        logger.error(f"LLM Error: {error_msg}")
        
        # Groq Rate Limit (429) Check
        if "429" in error_msg or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="AI provider is rate limited.",
            )

        raise HTTPException(
            status_code=503,
            detail="AI provider request failed.",
        )
