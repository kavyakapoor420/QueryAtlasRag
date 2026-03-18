 # MuliDocument Rag with hybrid Retrieval research_rag
<img width="1165" height="745" alt="Screenshot 2026-03-17 at 12 08 08 AM" src="https://github.com/user-attachments/assets/05f914fe-f55d-4320-b886-c169edf1afde" />
<img width="1165" height="745" alt="Screenshot 2026-03-17 at 12 16 46 AM" src="https://github.com/user-attachments/assets/ff0e0ad2-06fb-4052-922c-9ee2f53089b1" />



An advanced retrieval-augmented generation (RAG) system that enables users to upload documents and query them using natural language. The platform combines hybrid retrieval algorithms with large language models to deliver precise, context-aware answers with full source attribution and session-based document management.

## Features

- **Multi-PDF Upload**: Upload and process multiple PDF documents simultaneously
- **Hybrid Retrieval Engine**: Combines BM25 (keyword-based) and semantic embeddings for optimal search accuracy
- **Session-Based Querying**: Intelligent document scoping with session isolation and filtering
- **AI-Powered Q&A**: Uses Google Gemini API for intelligent answer generation with context
- **Source Attribution**: Complete citations with document references, page numbers, and relevance scores
- **Real-Time Processing**: Instant document ingestion with chunking and embedding generation
- **Customizable Search**: Adjustable retrieval weights and search parameters (BM25 vs embeddings)
- **Modern UI**: Clean, responsive React interface with professional research-focused design
- **RESTful API**: Complete API for integration and automation
- **Dashboard Analytics**: View uploaded documents, system statistics, and performance metrics

## How It Works

### Document Ingestion Pipeline

1. **Document Upload**: PDF files are uploaded through the web interface or API
2. **Text Extraction**: PyMuPDF extracts text content while preserving structure and metadata
3. **Intelligent Chunking**: Text is split into semantic chunks (500 tokens) with overlap for context preservation
4. **Dual Indexing**: 
   - **BM25 Index**: Traditional keyword-based search for exact matches
   - **Vector Embeddings**: Semantic embeddings using Sentence Transformers
5. **Metadata Storage**: Document metadata, chunks, and relationships stored in SQLite
6. **Vector Database**: Embeddings indexed in ChromaDB for fast similarity search

### Query Processing Engine

1. **Natural Language Input**: Users submit questions through the chat interface
2. **Hybrid Search**: 
   - Query processed through both BM25 and embedding models
   - Results combined using configurable weights (default: 50/50)
   - Advanced filtering by session, document scope, or recency
3. **Context Retrieval**: Top-K most relevant chunks retrieved with metadata
4. **Relevance Scoring**: Multi-factor scoring including semantic similarity and keyword matching

### Answer Generation

1. **Context Synthesis**: Retrieved chunks passed to Google Gemini LLM
2. **Intelligent Response**: LLM generates comprehensive answers using provided context
3. **Source Attribution**: Automatic citation with document names, page numbers, and relevance scores
4. **Response Formatting**: Structured output with answer, sources, and metadata

<br>
   <img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/de660578-3664-4ca3-bc1c-2530e801d589" />



##  Technical Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │  Storage Layer  │
│                 │    │                 │    │                 │
│ • Upload UI     │◄──►│ • PDF Processing│◄──►│ • ChromaDB      │
│ • Chat Interface│    │ • Hybrid Search │    │ • SQLite        │
│ • Dashboard     │    │ • LLM Integration│    │ • File System   │
│ • Session Mgmt  │    │ • Session Logic │    │ • BM25 Index    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

- **Frontend**: React 18 with modern hooks and responsive design
- **Backend**: FastAPI with async support and automatic API documentation
- **Vector Database**: ChromaDB for high-performance similarity search
- **Search Engine**: rank-bm25 for traditional keyword matching
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2) for semantic understanding
- **LLM**: Google Gemini API for answer generation
- **Storage**: SQLite for metadata and session management

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
