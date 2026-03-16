from sentence_transformers import SentenceTransformer

from app.utils.config import EMBEDDING_MODEL_NAME

_embedder = None


def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedder
