import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from core.prompts import SYSTEM_PROMPT
from core.errors import get_groq_error_message
from services.formatter import format_groq_response
from core.token import get_optimized_max_tokens


load_dotenv()


DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"


ALLOWED_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]



def get_safe_model(model_name):

    if model_name in ALLOWED_MODELS:
        return model_name

    return DEFAULT_GROQ_MODEL



def get_temperature(prompt):

    text = str(prompt or "").lower()


    coding_keywords = [
        "code",
        "program",
        "debug",
        "error",
        "bug",
        "javascript",
        "python",
        "react",
        "java",
        "c++",
    ]


    creative_keywords = [
        "idea",
        "story",
        "creative",
        "design",
        "name",
    ]


    if any(word in text for word in coding_keywords):
        return 0.2


    if any(word in text for word in creative_keywords):
        return 0.8


    return 0.6




def generate_groq_reply(
    messages=[],
    prompt="",
    model_name=DEFAULT_GROQ_MODEL
):

    try:

        model = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model=get_safe_model(model_name),
            temperature=get_temperature(prompt),
            max_tokens=get_optimized_max_tokens(
                messages=messages,
                prompt=prompt
            )
        )


        groq_messages = [
            (
                "system",
                SYSTEM_PROMPT
            )
        ]


        for message in messages:

            groq_messages.append(
                (
                    message["role"],
                    message["content"]
                )
            )


        groq_messages.append(
            (
                "human",
                prompt
            )
        )


        response = model.invoke(
            groq_messages
        )


        return format_groq_response(
            response.content
        )


    except Exception as error:

        message = get_groq_error_message(error)

        print(
            "Groq Error:",
            message
        )

        raise Exception(message)