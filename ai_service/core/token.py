import math
from typing import List, Dict, Optional

# Token Configuration
HISTORY_TOKEN_BUDGET = 2000
MEMORY_TOKEN_BUDGET = 800
MIN_OUTPUT_TOKENS = 512
MAX_OUTPUT_TOKENS = 4096
DEFAULT_OUTPUT_TOKENS = 2048


def clamp(value: int, minimum: int, maximum: int) -> int:
    """Clamps a value strictly within a minimum and maximum range."""
    return max(minimum, min(value, maximum))


def normalize_text(value: str) -> str:
    """Normalizes text by removing carriage returns and stripping whitespace."""
    if isinstance(value, str):
        return value.replace("\r\n", "\n").strip()
    return ""


def estimate_tokens(value: str) -> int:
    """
    Approximate token calculation.
    Average: 1 token ≈ 4 characters.
    """
    text = normalize_text(value)
    return max(1, math.ceil(len(text) / 4)) if text else 0


def estimate_message_tokens(message: dict) -> int:
    """Estimates tokens for a single conversation message."""
    if not isinstance(message, dict):
        return 0
    
    content = f"{message.get('role', '')} {message.get('content', '')}"
    return estimate_tokens(content)


def trim_messages_by_budget(messages: Optional[List[dict]] = None, budget: int = HISTORY_TOKEN_BUDGET) -> List[dict]:
    """Retains only the most recent messages that fit within the token budget."""
    if not messages:
        return []

    selected_messages = []
    token_count = 0

    # Traverse from newest to oldest
    for message in reversed(messages):
        if not isinstance(message, dict):
            continue

        content = normalize_text(message.get("content"))
        if not content:
            continue

        normalized_msg = {
            "role": "assistant" if message.get("role") == "assistant" else "user",
            "content": content
        }

        msg_tokens = estimate_message_tokens(normalized_msg)
        
        # Stop if adding this message exceeds the budget
        if token_count + msg_tokens > budget and selected_messages:
            break

        selected_messages.insert(0, normalized_msg)
        token_count += msg_tokens

    return selected_messages


def trim_memory_by_budget(memory_text: str, budget: int = MEMORY_TOKEN_BUDGET) -> str:
    """Efficiently trims long memory text to fit the budget without splitting words."""
    memory_text = normalize_text(memory_text)
    if not memory_text:
        return ""

    tokens = estimate_tokens(memory_text)
    if tokens <= budget:
        return memory_text

    # Optimization: Instead of looping word-by-word (O(N)), use mathematical slicing (O(1))
    max_chars = budget * 4
    trimmed_text = memory_text[:max_chars]
    
    # Ensure we don't cut a word in half by finding the last space
    last_space_index = trimmed_text.rfind(" ")
    if last_space_index != -1:
        return trimmed_text[:last_space_index]
        
    return trimmed_text


def get_optimized_max_tokens(messages: Optional[List[dict]] = None, prompt: str = "") -> int:
    """Dynamically calculates output token limits based on input size."""
    if not messages:
        messages = []

    history_tokens = sum(estimate_message_tokens(msg) for msg in messages)
    prompt_tokens = estimate_tokens(prompt)
    
    total_input_tokens = history_tokens + prompt_tokens

    # Reduce output tokens proportionally if input is large
    reduction = max(0, math.floor((total_input_tokens - 300) * 0.25))
    output_tokens = DEFAULT_OUTPUT_TOKENS - reduction

    return clamp(output_tokens, MIN_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS)