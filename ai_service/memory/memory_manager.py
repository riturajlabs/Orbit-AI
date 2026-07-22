import logging


from memory.memory_extractor import extract_memories

from memory.memory_quality import (
    is_valid_memory,
    calculate_importance,
    categorize_memory
)

from memory.memory_updater import update_or_create_memory



logger = logging.getLogger(__name__)





def process_memory(
    user_id: str,
    message: str
) -> list:


    # Ignore empty or very small messages

    if not message:
        return []


    if len(message.strip()) < 20:
        return []



    logger.info(
        "Memory processing started"
    )



    # =====================================
    # 1. Extract Memories
    # =====================================

    try:


        memories = extract_memories(
            message
        )


        logger.info(
            f"Extracted memories: {memories}"
        )



    except Exception as e:


        logger.error(
            f"Memory extraction failed: {e}"
        )


        return []




    if not memories:

        return []





    processed_memories = []





    # =====================================
    # 2. Process Each Memory
    # =====================================


    for text in memories:


        try:


            # -----------------------------
            # Quality Validation
            # -----------------------------


            if not is_valid_memory(text):


                logger.info(
                    f"Invalid memory skipped: {text}"
                )


                continue






            # -----------------------------
            # Create Memory Object
            # -----------------------------


            memory_obj = {


                "text": text,


                "importance": calculate_importance(
                    text
                ),


                "category": categorize_memory(
                    text
                )

            }






            # -----------------------------
            # Memory Updater
            # MongoDB + ChromaDB
            # -----------------------------


            print(
                "TRYING MEMORY:",
                memory_obj
            )


            saved = update_or_create_memory(

                user_id,

                memory_obj

            )


            print(
                "SAVE RESULT:",
                saved
            )




            if not saved:


                logger.info(
                    f"Duplicate memory skipped: {memory_obj}"
                )


                continue






            processed_memories.append(
                memory_obj
            )



            logger.info(
                f"Memory stored successfully: {memory_obj}"
            )






        except Exception as e:


            logger.error(

                f"Memory processing failed for {text}: {e}"

            )


            continue





    return processed_memories