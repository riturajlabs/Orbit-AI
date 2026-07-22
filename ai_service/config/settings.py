from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    GEMINI_API_KEY: str

    MONGODB_URI: str

    # Node Backend ↔ FastAPI Security Key
    AI_SERVICE_KEY: str


    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()