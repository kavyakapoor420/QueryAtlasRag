# from sentence_transformers import SentenceTransformer

# from app.utils.config import EMBEDDING_MODEL_NAME

# _embedder = None
 

# def get_embedder() -> SentenceTransformer:
#     global _embedder
#     if _embedder is None:
#         _embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
#     return _embedder


import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

_embedding_model = "models/gemini-embedding-001"

def get_embedder():
    return _embedding_model