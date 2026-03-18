import chromadb

from app.utils.config import CHROMA_DIR

_chroma_client = None
_chroma_collection = None


<<<<<<< HEAD

=======
>>>>>>> c7c17ec09a3cf4e15bc2b6596442dda5644c7f1a
def get_chroma_collection():
    global _chroma_client, _chroma_collection
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
    if _chroma_collection is None:
        _chroma_collection = _chroma_client.get_or_create_collection(
            name="rag_chunks",
            metadata={"hnsw:space": "cosine"},
        )
    return _chroma_collection
