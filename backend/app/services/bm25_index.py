from rank_bm25 import BM25Okapi

from app.database.sqlite_store import fetch_chunk_rows
from app.utils.preprocessing import tokenize


def build_bm25_index():
    rows = fetch_chunk_rows()
    corpus = [tokenize(r[1]) for r in rows]
    bm25 = BM25Okapi(corpus) if corpus else None
    return bm25, rows
