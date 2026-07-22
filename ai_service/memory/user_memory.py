import logging

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from typing import List, Dict, Any

from datetime import datetime

from config.settings import settings



logger = logging.getLogger(__name__)





try:


    client = MongoClient(

        settings.MONGODB_URI,

        serverSelectionTimeoutMS=5000

    )


    db = client["orbit_ai"]


    memory_collection = db["user_memory"]



except Exception as e:


    logger.error(
        f"MongoDB initialization failed: {e}"
    )


    memory_collection = None





def normalize_text(text):

    return (

        text

        .lower()

        .strip()

        .replace(".","")

    )







def save_memory(

    user_id:str,

    memory:Dict[str,Any]

)->bool:



    if memory_collection is None:

        return False




    try:



        text = memory.get(
            "text"
        )



        if not text:

            return False





        normalized = normalize_text(
            text
        )



        existing = memory_collection.find_one(

            {

                "userId":user_id,

                "memories.text_normalized":normalized

            }

        )




        now = datetime.utcnow()





        # ==========================
        # Update Existing Memory
        # ==========================


        if existing:



            old_memory = next(

                (

                    m for m in existing["memories"]

                    if m.get(
                        "text_normalized"
                    ) == normalized

                ),

                None

            )



            old_importance = (

                old_memory.get(
                    "importance",
                    5
                )

                if old_memory

                else 5

            )



            new_importance = max(

                old_importance,

                memory.get(
                    "importance",
                    5
                )

            )



            memory_collection.update_one(

                {

                    "userId":user_id,

                    "memories.text_normalized":normalized

                },


                {


                    "$set":{


                        "memories.$.importance":

                            new_importance,


                        "memories.$.category":

                            memory.get(

                                "category",

                                "general"

                            ),


                        "memories.$.updatedAt":

                            now


                    },


                    "$inc":{


                        "memories.$.frequency":

                            1

                    }


                }

            )



            return True






        # ==========================
        # Create New Memory
        # ==========================



        new_memory = {


            "text":

                text,


            "text_normalized":

                normalized,



            "importance":

                memory.get(

                    "importance",

                    5

                ),



            "category":

                memory.get(

                    "category",

                    "general"

                ),



            "frequency":

                1,



            "createdAt":

                now,



            "updatedAt":

                now

        }





        memory_collection.update_one(

            {

                "userId":user_id

            },


            {


                "$push":{

                    "memories":

                        new_memory

                }


            },


            upsert=True

        )



        return True





    except PyMongoError as e:


        logger.error(

            f"Mongo save error: {e}"

        )


        return False




    except Exception as e:


        logger.error(

            f"Unexpected save error: {e}"

        )


        return False







def get_user_memories(

    user_id:str

)->List[Dict[str,Any]]:



    if memory_collection is None:

        return []




    try:



        user = memory_collection.find_one(

            {

                "userId":user_id

            }

        )



        if user is None:

            return []




        memories = user.get(

            "memories",

            []

        )



        # Important memories first

        memories.sort(

            key=lambda x:(

                -x.get(

                    "importance",

                    5

                ),

                -x.get(

                    "frequency",

                    1

                )

            )

        )



        return memories





    except Exception as e:


        logger.error(

            f"Memory fetch error: {e}"

        )


        return []