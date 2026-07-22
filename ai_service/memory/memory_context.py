import logging

from memory.vector_memory import search_memory
from memory.user_memory import get_user_memories


logger = logging.getLogger(__name__)



CATEGORY_ORDER = {

    "personal": 1,

    "education": 2,

    "goal": 3,

    "experience": 4,

    "skill": 5,

    "technology": 6,

    "project": 7,

    "preference": 8,

    "interest": 9,

    "general": 10

}





def get_memory_context(
    user_id: str,
    query: str,
    top_k: int = 5
):


    try:


        memory_store = {}



        # ==================================
        # 1. MongoDB Permanent Memory
        # ==================================


        mongo_memories = get_user_memories(
            user_id
        )



        for memory in mongo_memories:


            if not isinstance(memory, dict):
                continue



            text = memory.get(
                "text"
            )


            if not text:
                continue



            memory_store[text] = {

                "text": text,

                "importance": memory.get(
                    "importance",
                    5
                ),

                "category": memory.get(
                    "category",
                    "general"
                )

            }




        # ==================================
        # 2. Vector Semantic Memory
        # ==================================


        vector_results = search_memory(

            user_id,

            query,

            limit=top_k

        )



        for memory in vector_results:


            if not isinstance(memory, dict):
                continue



            text = memory.get(
                "text"
            )


            if not text:
                continue



            score = memory.get(
                "score",
                0
            )



            # Ignore weak similarity results

            if score < 0.25:
                continue



            if text not in memory_store:


                memory_store[text] = {

                    "text": text,

                    "importance": memory.get(
                        "importance",
                        5
                    ),

                    "category": memory.get(
                        "category",
                        "general"
                    )

                }





        if not memory_store:

            return ""





        # ==================================
        # 3. Ranking
        # ==================================


        ranked_memories = sorted(

            memory_store.values(),

            key=lambda x:(

                CATEGORY_ORDER.get(
                    x["category"],
                    10
                ),

                -x["importance"]

            )

        )



        ranked_memories = ranked_memories[:15]





        # ==================================
        # 4. Group By Category
        # ==================================


        grouped = {}



        for memory in ranked_memories:


            category = memory.get(
                "category",
                "general"
            )


            grouped.setdefault(

                category,

                []

            ).append(

                memory["text"]

            )






        # ==================================
        # 5. Format For LLM
        # ==================================


        sections = []



        display_names = {

            "personal": "Personal Information",

            "education": "Education",

            "skill": "Skills",

            "technology": "Technologies",

            "goal": "Goals",

            "project": "Projects",

            "experience": "Experience",

            "preference": "Preferences",

            "interest": "Interests",

            "general": "General"

        }




        for category, items in grouped.items():


            title = display_names.get(

                category,

                category.title()

            )



            sections.append(

                f"{title}:\n"
                +
                "\n".join(

                    [

                        f"- {item}"

                        for item in items

                    ]

                )

            )




        context = "\n\n".join(
            sections
        )



        return f"""

Verified User Facts:

{context}

"""





    except Exception as e:


        logger.error(

            f"Memory context creation failed for {user_id}: {e}"

        )


        return ""