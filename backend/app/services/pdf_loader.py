from typing import List, Dict, Any

import fitz  # PyMuPDF

from .text_splitter import chunk_text


def pdf_to_chunks(file_path: str) -> List[Dict[str, Any]]:
    doc = fitz.open(file_path)
    all_chunks: List[Dict[str, Any]] = []
    for page_index in range(len(doc)):
        page = doc.load_page(page_index)
        text = page.get_text("text")
        if not text.strip():
            continue
        chunks = chunk_text(text)
        for i, chunk in enumerate(chunks):
            all_chunks.append(
                {
                    "page": page_index + 1,
                    "text": chunk,
                    "chunk_index": i,
                }
            )
    return all_chunks
