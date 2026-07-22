import chromadb
import hashlib
import logging

from sentence_transformers import SentenceTransformer


logger = logging.getLogger(__name__)



# =====================================
# ChromaDB Setup
# =====================================

client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="user_memory"
)



# =====================================
# Lazy Model Loading
# =====================================

embedding_model = None



def get_embedding_model():

    global embedding_model


    if embedding_model is None:

        logger.info(
            "Loading embedding model..."
        )


        embedding_model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )


        logger.info(
            "Embedding model loaded"
        )


    return embedding_model





# =====================================
# Memory ID Generator
# =====================================


def generate_memory_id(
    user_id,
    text
):

    unique_text = (
        f"{user_id}_{text.lower()}"
    )


    return hashlib.md5(
        unique_text.encode()
    ).hexdigest()





# =====================================
# Add Memory
# =====================================


def add_memory(
    user_id,
    memory
):

    try:


        text = memory.get(
            "text"
        )


        if not text:

            return False



        memory_id = generate_memory_id(
            user_id,
            text
        )



        existing = collection.get(
            ids=[
                memory_id
            ]
        )



        if existing.get("ids"):

            return False




        model = get_embedding_model()



        embedding = model.encode(

            text,

            normalize_embeddings=True

        ).tolist()




        collection.add(

            ids=[

                memory_id

            ],


            documents=[

                text

            ],


            embeddings=[

                embedding

            ],


            metadatas=[

                {

                    "userId": user_id,

                    "importance": memory.get(
                        "importance",
                        5
                    ),


                    "category": memory.get(
                        "category",
                        "general"
                    )

                }

            ]

        )



        logger.info(
            f"Vector memory saved: {text}"
        )


        return True




    except Exception as e:


        logger.error(
            f"Vector memory save error: {e}"
        )


        return False






# =====================================
# Search Memory
# =====================================


def search_memory(
    user_id,
    query,
    limit=5
):

    try:


        model = get_embedding_model()



        query_embedding = model.encode(

            query,

            normalize_embeddings=True

        ).tolist()



        results = collection.query(

            query_embeddings=[

                query_embedding

            ],


            n_results=20,


            where={

                "userId": user_id

            },


            include=[

                "documents",

                "metadatas",

                "distances"

            ]

        )



        documents = results["documents"][0]

        metadatas = results["metadatas"][0]

        distances = results["distances"][0]



        memories = []



        for doc, metadata, distance in zip(

            documents,

            metadatas,

            distances

        ):



            importance = metadata.get(
                "importance",
                5
            )


            category = metadata.get(
                "category",
                "general"
            )



            similarity = 1 - distance



            if similarity < 0.25:

                continue



            category_weight = {


                "personal":1.0,

                "goal":0.95,

                "skill":0.9,

                "preference":0.85,

                "interest":0.8,

                "general":0.6


            }.get(

                category,

                0.5

            )



            score = (

                similarity * 0.6

                +

                (importance / 10) * 0.25

                +

                category_weight * 0.15

            )



            memories.append(

                {

                    "text":doc,

                    "importance":importance,

                    "category":category,

                    "score":round(
                        score,
                        3
                    )

                }

            )



        memories.sort(

            key=lambda x:x["score"],

            reverse=True

        )


        return memories[:limit]



    except Exception as e:


        logger.error(
            f"Vector search error: {e}"
        )


        return []