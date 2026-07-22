import logging

from memory.user_memory import save_memory
from memory.vector_memory import add_memory


logger = logging.getLogger(__name__)





def update_or_create_memory(
    user_id: str,
    memory: dict
) -> bool:


    try:



        if not memory:

            return False




        # ==========================
        # Save MongoDB Memory
        # ==========================


        mongo_saved = save_memory(

            user_id,

            memory

        )



        if not mongo_saved:


            logger.error(

                f"MongoDB memory save failed: {memory}"

            )


            return False






        # ==========================
        # Save Vector Memory
        # ==========================


        vector_saved = add_memory(

            user_id,

            memory

        )



        if vector_saved:


            logger.info(

                f"Vector memory created: {memory}"

            )


        else:


            logger.info(

                f"Vector memory already exists: {memory}"

            )







        logger.info(

            f"Memory updated successfully: {memory}"

        )



        return True





    except Exception as e:


        logger.error(

            f"Memory updater failed: {e}"

        )


        return False