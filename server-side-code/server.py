#rag-pipeline

import json
import os
import uuid
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.database.chroma_store import get_chroma_collection
from app.database.sqlite_store import init_db, insert_document_and_chunks
from app.services.embeddings import get_embedder
from app.services.llm import call_gemini, stream_gemini, validate_api_key
from app.services.pdf_loader import pdf_to_chunks
from app.services.retriever import hybrid_search
from app.utils.config import UPLOADS_DIR
from app.utils.auth import create_session, remove_session, require_session



app = FastAPI(title="Hybrid RAG API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    top_k: int = 5
    alpha: float = 0.5


class LoginRequest(BaseModel):
    api_key: str




@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    validate_api_key(req.api_key)
    session_token = create_session(req.api_key)
    return {"session_token": session_token}


@app.post("/api/auth/logout")
def logout(x_api_session: str = Header(None)):
    if x_api_session:
        remove_session(x_api_session)
    return {"status": "ok"}


@app.get("/api/auth/status")
def status(api_key: str = Depends(require_session)):
    return {"status": "ok"}


@app.post("/api/ingest")
async def ingest(files: List[UploadFile] = File(...), api_key: str = Depends(require_session)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    results = []
    for f in files:
        ext = os.path.splitext(f.filename or "")[1].lower()
        if ext != ".pdf":
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type for {f.filename}. PDFs only for now.",
            )
        file_id = str(uuid.uuid4())
        safe_name = f"{file_id}_{f.filename}"
        file_path = os.path.join(UPLOADS_DIR, safe_name)
        with open(file_path, "wb") as out:
            out.write(await f.read())

        chunks = pdf_to_chunks(file_path)
        doc_id, inserted = insert_document_and_chunks(f.filename, file_path, chunks)

        embedder = get_embedder()
        collection = get_chroma_collection()
        for chunk_id, chunk in inserted:
            embedding = embedder.encode(chunk["text"]).tolist()
            collection.add(
                ids=[chunk_id],
                documents=[chunk["text"]],
                embeddings=[embedding],
                metadatas=[
                    {
                        "document_id": doc_id,
                        "document_name": f.filename,
                        "page": chunk["page"],
                        "chunk_index": chunk["chunk_index"],
                    }
                ],
            )

        results.append({"file": f.filename, "document_id": doc_id, "chunks": len(chunks)})

    return {"ingested": results}


@app.post("/api/query")
def query(req: QueryRequest, api_key: str = Depends(require_session)):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    contexts = hybrid_search(question, req.top_k, req.alpha)
    if not contexts:
        return {"answer": "No documents ingested yet.", "sources": []}

    answer = call_gemini(api_key, question, contexts)
    sources = [
        {
            "document_name": c["document_name"],
            "page": c["page"],
            "score": round(c["score"], 4),
            "preview": c["text"][:200],
        }
        for c in contexts
    ]
    return {"answer": answer, "sources": sources}


@app.post("/api/query-stream")
def query_stream(req: QueryRequest, api_key: str = Depends(require_session)):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    contexts = hybrid_search(question, req.top_k, req.alpha)
    if not contexts:
        return StreamingResponse(
            iter(["No documents ingested yet."]),
            media_type="text/plain",
        )

    sources = [
        {
            "document_name": c["document_name"],
            "page": c["page"],
            "score": round(c["score"], 4),
            "preview": c["text"][:200],
        }
        for c in contexts
    ]

    def generator():
        for token in stream_gemini(api_key, question, contexts):
            yield token
        yield "\n[[SOURCES]]" + json.dumps(sources)

    return StreamingResponse(generator(), media_type="text/plain")
