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
