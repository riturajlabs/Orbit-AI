import logging

from langchain_mongodb import MongoDBChatMessageHistory

from config.settings import settings



logger = logging.getLogger(__name__)





def get_mongodb_history(
    session_id: str
):

    try:


        history = MongoDBChatMessageHistory(

            connection_string=settings.MONGODB_URI,

            session_id=session_id,

            database_name=getattr(
                settings,
                "MONGODB_DATABASE",
                "orbit_ai"
            ),

            collection_name="chat_history"

        )


        return history



    except Exception as e:


        logger.error(

            f"MongoDB chat history error "
            f"for session {session_id}: {e}"

        )


        # fallback empty history

        class EmptyHistory:


            messages = []


            def add_user_message(
                self,
                message
            ):
                pass



            def add_ai_message(
                self,
                message
            ):
                pass



        return EmptyHistory()