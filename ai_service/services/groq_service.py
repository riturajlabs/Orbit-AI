import logging

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

from config.settings import settings


logger = logging.getLogger(__name__)


models = []


# Primary Groq

try:

    groq_primary = ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0.6,
        max_tokens=1024,
        api_key=settings.GROQ_API_KEY,
        max_retries=0
    )

    models.append(groq_primary)


except Exception as e:

    logger.error(
        f"Groq primary failed: {e}"
    )



# Groq lightweight fallback

try:

    groq_backup = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.6,
        max_tokens=1024,
        api_key=settings.GROQ_API_KEY,
        max_retries=0
    )


    models.append(groq_backup)


except Exception as e:

    logger.error(
        f"Groq backup failed: {e}"
    )



# Gemini fallback

try:

    gemini = ChatGoogleGenerativeAI(

        model="gemini-2.0-flash",

        temperature=0.6,

        max_tokens=1024,

        google_api_key=settings.GEMINI_API_KEY,

        max_retries=0
    )


    models.append(gemini)


except Exception as e:

    logger.error(
        f"Gemini failed: {e}"
    )



if not models:

    raise Exception(
        "No AI model available"
    )



llm = models[0].with_fallbacks(
    models[1:]
)



def get_llm():

    return llm