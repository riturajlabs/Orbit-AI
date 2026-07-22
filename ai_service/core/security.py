from fastapi import Header, HTTPException
from config.settings import settings


def verify_api_key(
    x_api_key: str = Header(...)
):

    if x_api_key != settings.AI_SERVICE_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )

    return True