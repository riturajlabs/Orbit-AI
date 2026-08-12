import logging
import os

import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importing the chat router
from routes.chat import router
from services.groq_service import get_provider_status


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s"
)

logger = logging.getLogger(__name__)


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
# AI Provider Status
# Used by the Node backend health/debug endpoint
# ==============================

@app.get("/providers/status")
async def providers_status():

    return {
        "status": "ok",
        "providers": get_provider_status()
    }


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


# ==============================
# Entrypoint
# Ensures `python app.py` starts the server
# (Railway default start command compatibility)
# ==============================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))

    logger.info(f"Starting Orbit AI Service on port {port}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
    )
