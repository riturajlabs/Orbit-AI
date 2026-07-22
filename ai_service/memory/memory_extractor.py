import json
import logging
import re
from typing import List

from services.groq_service import get_llm

logger = logging.getLogger(__name__)


def clean_json_response(content: str) -> str:
    """Cleans markdown formatting and extracts the JSON array safely."""
    content = content.strip()

    # 1. Remove standard markdown code blocks (```json ... ```)
    content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\s*```$", "", content)
    
    # 2. Fallback: 
    match = re.search(r'\[.*\]', content, re.DOTALL)
    if match:
        return match.group(0).strip()
        
    return content.strip()


def extract_memories(message: str) -> List[str]:
    """Extracts long-term user memories from the chat message."""
    if not message:
        return []

    llm = get_llm()

    prompt = f"""
You are a strict long-term memory extraction engine.
Your job is to extract ONLY permanent facts that the user explicitly said about themselves.
These memories will be stored in a personal AI assistant database.

========================
SAVE INFORMATION ABOUT
========================
Personal: name, location, age (only if explicitly provided)
Education: degree, course, university, student status
Profession: job, role, career status
Skills: programming languages, frameworks, libraries, AI/ML skills, tools
Technologies: software tools, platforms, databases, cloud technologies
Goals: career goals, learning goals, project goals
Projects: projects user is building, products user wants to create
Preferences: favorite tools, preferred languages, learning style

========================
STRICT RULES
========================
1. Extract only facts directly written by the user.
2. Never assume anything.
   Bad: User: "I study AI" -> Wrong: "User is an AI Engineer"
3. Never save AI generated answers.
4. Never save questions.
   Example: "What is Python?" -> Return: []
5. Split different facts.
   Input: "I know MERN Stack, Python and Machine Learning"
   Output: ["User knows MERN Stack", "User knows Python", "User knows Machine Learning"]
6. Convert memories into simple sentences.
   Input: "My name is Ritu Raj"
   Output: ["User name is Ritu Raj"]
   Input: "I want to become an AI Engineer"
   Output: ["User goal is to become an AI Engineer"]

========================
User message:
{message}
========================

Return ONLY JSON array.
No markdown.
No explanation.
No extra text.
"""

    raw_content = ""
    try:
        response = llm.invoke(prompt)
        
        # Safely handle response content
        raw_content = response.content if hasattr(response, 'content') else str(response)
        raw_content = raw_content.strip()

        cleaned = clean_json_response(raw_content)
        memories = json.loads(cleaned)

        if not isinstance(memories, list):
            return []

        cleaned_memories = []
        for memory in memories:
            if isinstance(memory, str):
                memory = memory.strip()
                if len(memory) >= 10:
                    cleaned_memories.append(memory)

        # Remove duplicate memories while preserving order
        return list(dict.fromkeys(cleaned_memories))

    except json.JSONDecodeError as e:
        logger.error(f"Memory JSON parsing failed: {e}")
        logger.error(f"Raw output trying to parse: {raw_content}")
    except Exception as e:
        logger.error(f"Memory extraction failed: {e}")

    return []