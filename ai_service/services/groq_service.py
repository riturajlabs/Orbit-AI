import logging

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

from config.settings import settings


logger = logging.getLogger(__name__)


def _mask(value: str) -> str:
    if not value:
        return "NOT SET"
    return "SET"


models = []
provider_errors = {}


# =====================================
# Primary Groq
# =====================================

if settings.GROQ_API_KEY:
    try:
        groq_primary = ChatGroq(
            model=settings.GROQ_MODEL,
            temperature=0.6,
            max_tokens=1024,
            api_key=settings.GROQ_API_KEY,
            max_retries=0
        )

        models.append(groq_primary)
        provider_errors["groq"] = "configured"

        logger.info(
            f"Groq primary initialized (model={settings.GROQ_MODEL})"
        )

    except Exception as e:
        provider_errors["groq"] = f"failed: {e}"
        logger.error(
            f"Groq primary failed: {e}"
        )
else:
    provider_errors["groq"] = "not_configured"
    logger.warning(
        f"GROQ_API_KEY {_mask(settings.GROQ_API_KEY)}. Groq primary disabled."
    )



# =====================================
# Groq lightweight fallback
# =====================================

if settings.GROQ_API_KEY:
    try:
        groq_backup = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.6,
            max_tokens=1024,
            api_key=settings.GROQ_API_KEY,
            max_retries=0
        )

        models.append(groq_backup)
        logger.info("Groq lightweight fallback initialized")

    except Exception as e:
        logger.error(
            f"Groq backup failed: {e}"
        )



# =====================================
# Gemini fallback
# =====================================

if settings.GEMINI_API_KEY:
    try:
        gemini = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.6,
            max_tokens=1024,
            google_api_key=settings.GEMINI_API_KEY,
            max_retries=0
        )

        models.append(gemini)
        provider_errors["gemini"] = "configured"

        logger.info("Gemini fallback initialized")

    except Exception as e:
        provider_errors["gemini"] = f"failed: {e}"
        logger.error(
            f"Gemini failed: {e}"
        )
else:
    provider_errors["gemini"] = "not_configured"
    logger.warning(
        f"GEMINI_API_KEY {_mask(settings.GEMINI_API_KEY)}. Gemini fallback disabled."
    )



if not models:
    raise RuntimeError(
        "No AI provider is configured. "
        "Set GROQ_API_KEY and/or GEMINI_API_KEY in the environment."
    )


logger.info(
    f"AI providers initialized: "
    f"{[model.__class__.__name__ for model in models]}"
)


if len(models) > 1:
    llm = models[0].with_fallbacks(
        models[1:]
    )
else:
    llm = models[0]



def get_llm():
    return llm



def get_provider_status() -> dict:
    return {
        "groq": {
            "configured": bool(settings.GROQ_API_KEY),
            "status": provider_errors.get("groq", "unknown"),
            "model": settings.GROQ_MODEL,
        },
        "gemini": {
            "configured": bool(settings.GEMINI_API_KEY),
            "status": provider_errors.get("gemini", "unknown"),
        },
        "active_provider": models[0].__class__.__name__ if models else None,
        "fallback_chain": [model.__class__.__name__ for model in models],
        "configured": bool(models),
    }
