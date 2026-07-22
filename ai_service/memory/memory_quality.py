import re
from typing import Optional

INVALID_WORDS = {
    "hello", "hi", "thanks", "thank you", "okay", 
    "bye", "yes", "no", "good morning", "good night"
}

# Converted TEMPORARY_WORDS to a compiled regex with word boundaries 
# to prevent partial matches (e.g., matching "today" inside another string accidentally)
TEMPORARY_PATTERN = re.compile(r"\b(today|tomorrow|currently|right now|just now)\b")

SKILL_PATTERNS = [
    re.compile(r"\bpython\b"), re.compile(r"\bjavascript\b"), re.compile(r"\btypescript\b"),
    re.compile(r"\breact\b"), re.compile(r"\bnode\b"), re.compile(r"\bmern\b"),
    re.compile(r"\bmachine learning\b"), re.compile(r"\bdeep learning\b"),
    re.compile(r"\bgenerative ai\b"), re.compile(r"\blanggraph\b"),
    re.compile(r"\bdata structures\b"), re.compile(r"\bsql\b"),
    re.compile(r"\bc\+\+\b"), re.compile(r"\bjava\b")
]

TECHNOLOGY_PATTERNS = [
    re.compile(r"\blangchain\b"), re.compile(r"\blanggraph\b"), re.compile(r"\bpytorch\b"),
    re.compile(r"\btensorflow\b"), re.compile(r"\bmongodb\b"), re.compile(r"\bpostgresql\b"),
    re.compile(r"\bdocker\b"), re.compile(r"\baws\b"), re.compile(r"\bazure\b")
]

EDUCATION_PATTERNS = [
    re.compile(r"\bb\.?sc\b"), re.compile(r"\bmsc\b"), re.compile(r"\bstudent\b"),
    re.compile(r"\bstudying\b"), re.compile(r"\bdegree\b"), re.compile(r"\bcollege\b"),
    re.compile(r"\buniversity\b")
]

GOAL_PATTERNS = [
    re.compile(r"\bwant\b"), re.compile(r"\bwants\b"), re.compile(r"\bgoal\b"),
    re.compile(r"\bbecome\b"), re.compile(r"\blearn\b"), re.compile(r"\bbuild\b"),
    re.compile(r"\binterested in\b")
]

PERSONAL_PATTERNS = [
    re.compile(r"\bmy name\b"), re.compile(r"\buser name\b"), re.compile(r"\bname is\b"),
    re.compile(r"\bi am\b"), re.compile(r"\blive in\b"), re.compile(r"\bmy age\b")
]

PREFERENCE_PATTERNS = [
    re.compile(r"\bprefer\b"), re.compile(r"\blike\b"), re.compile(r"\blove\b"),
    re.compile(r"\bfavorite\b")
]

PROJECT_PATTERNS = [
    re.compile(r"\bproject\b"), re.compile(r"\bbuilding\b"), 
    re.compile(r"\bdeveloping\b"), re.compile(r"\bcreated\b")
]


def normalize_memory(memory: str) -> str:
    """Normalizes the memory string for processing."""
    if not memory:
        return ""
    return memory.lower().strip().replace(".", "")


def is_valid_memory(memory: str) -> bool:
    """Checks if the extracted text qualifies as a valid long-term memory."""
    if not memory:
        return False

    text = normalize_memory(memory)

    # 1. Check exact invalid words first
    if text in INVALID_WORDS:
        return False

    # 2. Check minimum length
    if len(text) < 10:
        return False

    # 3. Prevent saving highly temporary statements
    if TEMPORARY_PATTERN.search(text):
        return False

    return True


def calculate_importance(memory: str) -> int:
    """Calculates an importance score (1 to 10) based on matched patterns."""
    text = normalize_memory(memory)
    score = 2  # Base score

    if any(p.search(text) for p in PERSONAL_PATTERNS):
        score += 5
    if any(p.search(text) for p in EDUCATION_PATTERNS):
        score += 4
    if any(p.search(text) for p in GOAL_PATTERNS):
        score += 4
    if any(p.search(text) for p in PROJECT_PATTERNS):  # Added Project Patterns
        score += 3
    if any(p.search(text) for p in SKILL_PATTERNS):
        score += 3
    if any(p.search(text) for p in TECHNOLOGY_PATTERNS):
        score += 3
    if any(p.search(text) for p in PREFERENCE_PATTERNS):
        score += 2

    return min(score, 10)


def categorize_memory(memory: str) -> str:
    """Categorizes the memory based on keyword patterns."""
    text = normalize_memory(memory)

    # Ordered by priority of categorization
    if any(p.search(text) for p in PERSONAL_PATTERNS):
        return "personal"
    if any(p.search(text) for p in EDUCATION_PATTERNS):
        return "education"
    if any(p.search(text) for p in GOAL_PATTERNS):
        return "goal"
    if any(p.search(text) for p in PROJECT_PATTERNS):
        return "project"
    if any(p.search(text) for p in TECHNOLOGY_PATTERNS): # Grouped tech closer to skills
        return "technology"
    if any(p.search(text) for p in SKILL_PATTERNS):
        return "skill"
    if any(p.search(text) for p in PREFERENCE_PATTERNS):
        return "preference"

    return "general"