# RAG Project (Hybrid Retrieval)

This repo contains a minimal multi-document RAG pipeline with:

- Frontend: React + Tailwind (Vite)
- Backend: FastAPI + PyMuPDF + BM25 + Sentence Transformers + ChromaDB
- LLM: Gemini 2.5 Flash (via Google Generative AI SDK)

The current version focuses on PDFs only. Support for PPTX, XLSX, DOCX, and other formats can be added later with dedicated parsers.

## Structure

- `frontend/` React UI for uploads and chat
- `backend/` FastAPI service for ingestion and querying

## Quick Start

Backend (use Python 3.11 or 3.12 to avoid PyMuPDF build failures):

1. `cd backend`
2. Create a virtualenv, then install deps: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill `GEMINI_API_KEY`
4. Run: `uvicorn main:app --reload`

Frontend:

1. `cd frontend`
2. Install deps: `npm install`
3. Run: `npm run dev`

The UI expects the API at `http://localhost:8000`. You can change this by creating `frontend/.env` with `VITE_API_BASE=...`.

## API Endpoints

- `POST /api/ingest` multipart file upload (PDFs)
- `POST /api/query` JSON body: `{ "question": "...", "top_k": 5, "alpha": 0.5 }`
- `POST /api/query-stream` same body, returns a streamed response for chat-like UX

## Notes

- Chunks are stored in ChromaDB with metadata and documents.
- BM25 is computed on the full chunk corpus from SQLite.
- Hybrid scoring uses a weighted average of normalized BM25 and vector similarity.
