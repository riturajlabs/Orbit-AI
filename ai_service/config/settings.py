import logging

from pydantic_settings import BaseSettings


logger = logging.getLogger(__name__)


def _mask(value: str) -> str:
    if not value:
        return "NOT SET"
    return "SET"


class Settings(BaseSettings):
    # Primary LLM provider
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Fallback LLM provider (optional; missing key must not crash the service)
    GEMINI_API_KEY: str = ""

    MONGODB_URI: str

    # Node Backend <-> FastAPI Security Key
    AI_SERVICE_KEY: str

    class Config:
        env_file = ".env"
        extra = "ignore"

    def provider_status(self) -> dict:
        return {
            "groq": bool(self.GROQ_API_KEY),
            "gemini": bool(self.GEMINI_API_KEY),
        }

    def log_configuration(self) -> None:
        logger.info("[Settings] Configuration loaded")
        logger.info(f"[Settings] GROQ_API_KEY: {_mask(self.GROQ_API_KEY)}")
        logger.info(f"[Settings] GROQ_MODEL: {self.GROQ_MODEL}")
        logger.info(f"[Settings] GEMINI_API_KEY: {_mask(self.GEMINI_API_KEY)}")
        logger.info(f"[Settings] MONGODB_URI: {_mask(self.MONGODB_URI)}")
        logger.info(f"[Settings] AI_SERVICE_KEY: {_mask(self.AI_SERVICE_KEY)}")


settings = Settings()
settings.log_configuration()
