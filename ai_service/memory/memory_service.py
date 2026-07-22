from langchain_mongodb import MongoDBChatMessageHistory
from config.settings import settings



def create_memory(session_id: str):

    """
    Short term conversation memory.
    Stores chat messages in MongoDB.
    """

    chat_history = MongoDBChatMessageHistory(

        session_id=session_id,

        connection_string=settings.MONGODB_URI,

        database_name="orbit_ai",

        collection_name="chat_history"

    )


    return chat_history