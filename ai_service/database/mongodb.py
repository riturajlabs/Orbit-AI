from pymongo import MongoClient

from config.settings import settings


client = MongoClient(
    settings.MONGODB_URI
)


database = client["orbit_ai"]


chat_collection = database["chat_history"]



def get_database():

    return database