import os
import sqlite3
import uuid
from typing import List, Dict, Any, Tuple

from app.utils.config import DB_PATH, UPLOADS_DIR, CHROMA_DIR


def ensure_storage_dirs() -> None:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(CHROMA_DIR, exist_ok=True)


def init_db() -> None:
    ensure_storage_dirs()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chunks (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                page INTEGER NOT NULL,
                text TEXT NOT NULL,
                FOREIGN KEY(document_id) REFERENCES documents(id)
            )
            """
        )
        conn.commit()


def insert_document_and_chunks(
    doc_name: str, file_path: str, chunks: List[Dict[str, Any]]
) -> Tuple[str, List[Tuple[str, Dict[str, Any]]]]:
    doc_id = str(uuid.uuid4())
    inserted: List[Tuple[str, Dict[str, Any]]] = []
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO documents (id, name, path) VALUES (?, ?, ?)",
            (doc_id, doc_name, file_path),
        )
        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO chunks (id, document_id, page, text) VALUES (?, ?, ?, ?)",
                (chunk_id, doc_id, chunk["page"], chunk["text"]),
            )
            inserted.append((chunk_id, chunk))
        conn.commit()
    return doc_id, inserted


def fetch_chunk_rows():
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute(
            """
            SELECT chunks.id, chunks.text, documents.name, chunks.page
            FROM chunks
            JOIN documents ON chunks.document_id = documents.id
            """
        ).fetchall()
    return rows
