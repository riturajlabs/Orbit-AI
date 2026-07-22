import logging


from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
    AIMessage
)


from fastapi import BackgroundTasks



from core.prompts import SYSTEM_PROMPT


from services.groq_service import get_llm


from core.token import (
    trim_messages_by_budget,
    trim_memory_by_budget,
    get_optimized_max_tokens
)


from memory.memory_context import get_memory_context


from memory.mongodb_memory import get_mongodb_history


from memory.memory_manager import process_memory





logger = logging.getLogger(__name__)








def generate_chat_response(
    user_id: str,
    session_id: str,
    user_message: str,
    background_tasks: BackgroundTasks
) -> str:



    try:



        # ===================================
        # STEP 1: Retrieve User Memory
        # ===================================


        try:


            long_term_context = get_memory_context(

                user_id,

                user_message

            )



            long_term_context = trim_memory_by_budget(

                long_term_context

            )



        except Exception as e:


            logger.error(

                f"Memory retrieval failed: {e}"

            )


            long_term_context = ""





        logger.info(

            f"Memory Context Loaded: {long_term_context}"

        )






        # ===================================
        # STEP 2: Build System Prompt
        # ===================================


        dynamic_system_prompt = f"""

{SYSTEM_PROMPT}


Retrieved User Profile:

{long_term_context if long_term_context else "No user information available."}


Rules:

- Use user profile when relevant.
- Answer personal questions using available profile.
- Never mention memory systems.
"""






        # ===================================
        # STEP 3: Load Chat History
        # ===================================


        history_manager = get_mongodb_history(

            session_id

        )



        raw_history = []



        for msg in history_manager.messages:



            raw_history.append(

                {

                    "role":

                    "assistant"

                    if msg.type == "ai"

                    else "user",


                    "content": msg.content

                }

            )





        raw_history.append(

            {

                "role":"user",

                "content":user_message

            }

        )








        # ===================================
        # STEP 4: Token Optimization
        # ===================================



        trimmed_history = trim_messages_by_budget(

            raw_history

        )





        output_tokens = get_optimized_max_tokens(

            trimmed_history,

            dynamic_system_prompt

        )





        # ===================================
        # STEP 5: Build Messages
        # ===================================



        llm_messages = [

            SystemMessage(

                content=dynamic_system_prompt

            )

        ]





        for msg in trimmed_history:



            if msg["role"] == "assistant":



                llm_messages.append(

                    AIMessage(

                        content=msg["content"]

                    )

                )


            else:



                llm_messages.append(

                    HumanMessage(

                        content=msg["content"]

                    )

                )








        # ===================================
        # STEP 6: LLM Response
        # ===================================



        llm = get_llm()



        response = llm.invoke(

            llm_messages,

            max_tokens=output_tokens

        )



        ai_response_content = response.content







        # ===================================
        # STEP 7: Save Conversation
        # ===================================



        history_manager.add_user_message(

            user_message

        )


        history_manager.add_ai_message(

            ai_response_content

        )








        # ===================================
        # STEP 8: Background Memory
        # ===================================



        background_tasks.add_task(

            process_memory,

            user_id,

            user_message

        )





        return ai_response_content





    except Exception as e:



        logger.exception(

            f"Chat generation failed for {user_id}: {e}"

        )


        return (

            "I'm currently experiencing a temporary issue. "

            "Please try again in a moment."

        )