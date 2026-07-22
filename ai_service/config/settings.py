from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    MONGODB_URI: str
    
    # FIX: Pydantic ko Gemini API Key ke baare me yahan batana zaroori hai
    GEMINI_API_KEY: str 

    class Config:
        env_file = ".env"
        # Optional safe-guard: Agar aage se `.env` me koi aur naya variable add karein, 
        # toh app crash na ho isliye ye line add kar sakte hain:
        extra = "ignore" 

settings = Settings()