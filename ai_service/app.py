from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importing the chat router
from routes.chat import router


app = FastAPI(
    title="Orbit AI Service",
    description="Production-grade AI Assistant API with RAG and Memory",
    version="1.0.0"
)


# ==============================
# CORS Configuration
# ==============================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://orbit-ai-client.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ==============================
# Register API Routes
# ==============================

app.include_router(router)


# ==============================
# Root Endpoint
# Used for basic service check
# ==============================

@app.api_route("/", methods=["GET", "HEAD"])
async def root():

    return {
        "status": "Orbit AI Service Running 🚀",
        "database": "Connected",
        "vector_store": "Ready"
    }



# ==============================
# Health Check Endpoint
# Used by UptimeRobot / Monitoring
# ==============================

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():

    return {
        "status": "healthy",
        "service": "Orbit AI",
        "version": "1.0.0"
    }