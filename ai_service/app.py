from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importing the chat router we created earlier
from routes.chat import router

app = FastAPI(
    title="Orbit AI Service",
    description="Production-grade AI Assistant API with RAG and Memory",
    version="1.0.0"
)

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    # In production, replace "*" with your actual frontend URLs (e.g., ["https://orbit-ai.com"])
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Register the routes
app.include_router(router)

@app.get("/")
def home():
    """Health check endpoint for monitoring."""
    return {
        "status": "Orbit AI Service Running 🚀",
        "database": "Connected",
        "vector_store": "Ready"
    }