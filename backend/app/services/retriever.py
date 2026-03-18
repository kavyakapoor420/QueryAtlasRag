from typing import List, Dict, Any

from app.database.chroma_store import get_chroma_collection
from app.services.bm25_index import build_bm25_index
from app.services.embeddings import get_embedder
from app.utils.preprocessing import tokenize


def hybrid_search(question: str, top_k: int, alpha: float):
    bm25, rows = build_bm25_index()
    if not rows:
        return []

    bm25_scores = []
    if bm25 is not None:
        bm25_raw = bm25.get_scores(tokenize(question))
        for idx, row in enumerate(rows):
            bm25_scores.append((row[0], bm25_raw[idx]))
    bm25_map = {cid: score for cid, score in bm25_scores}
    bm25_max = max(bm25_map.values()) if bm25_map else 0.0

    embedder = get_embedder()
    collection = get_chroma_collection()
    query_emb = embedder.encode(question).tolist()
    vector = collection.query(
        query_embeddings=[query_emb],
        n_results=min(len(rows), max(top_k * 3, top_k)),
        include=["documents", "metadatas", "distances"],
    )
    vec_scores = {}
    if vector["ids"] and vector["ids"][0]:
        for i, cid in enumerate(vector["ids"][0]):
            dist = vector["distances"][0][i]
            vec_scores[cid] = 1.0 - dist
    vec_max = max(vec_scores.values()) if vec_scores else 0.0

    combined: List[Dict[str, Any]] = []
    for row in rows:
        cid, text, doc_name, page = row
        bm25_norm = (bm25_map.get(cid, 0.0) / bm25_max) if bm25_max > 0 else 0.0
        vec_norm = (vec_scores.get(cid, 0.0) / vec_max) if vec_max > 0 else 0.0
        score = (alpha * bm25_norm) + ((1 - alpha) * vec_norm)
        combined.append(
            {
                "id": cid,
                "text": text,
                "document_name": doc_name,
                "page": page,
                "score": score,
            }
        )

    combined.sort(key=lambda x: x["score"], reverse=True)
    return combined[:top_k]
