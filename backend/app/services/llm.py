from typing import List, Dict, Any, Iterable

import google.generativeai as genai
from fastapi import HTTPException


def _get_model() -> genai.GenerativeModel:
    return genai.GenerativeModel("gemini-2.5-flash")


def call_gemini(api_key: str, question: str, contexts: List[Dict[str, Any]]) -> str:
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    genai.configure(api_key=api_key)
    model = _get_model()

    context_text = "\n\n".join(
        [
            f"[{c['document_name']} - p{c['page']}] {c['text']}"
            for c in contexts
        ]
    )
    prompt = (
        "You are a research assistant. Use the context to answer the question. "
        "If the context is insufficient, say so clearly.\n\n"
        f"Context:\n{context_text}\n\nQuestion:\n{question}"
    )
    response = model.generate_content(prompt)
    return response.text or ""


def stream_gemini(
    api_key: str, question: str, contexts: List[Dict[str, Any]]
) -> Iterable[str]:
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    genai.configure(api_key=api_key)
    model = _get_model()

    context_text = "\n\n".join(
        [
            f"[{c['document_name']} - p{c['page']}] {c['text']}"
            for c in contexts
        ]
    )
    prompt = (
        "You are a research assistant. Use the context to answer the question. "
        "If the context is insufficient, say so clearly.\n\n"
        f"Context:\n{context_text}\n\nQuestion:\n{question}"
    )
    for chunk in model.generate_content(prompt, stream=True):
        if chunk.text:
            yield chunk.text


def validate_api_key(api_key: str) -> None:
    if not api_key:
        raise HTTPException(status_code=401, detail="API key is required")

    try:
        genai.configure(api_key=api_key)
        model = _get_model()
        model.generate_content("ping")
    except Exception as exc:
        message = str(exc)
        lowered = message.lower()
        if "api key" in lowered or "unauthorized" in lowered or "permission" in lowered:
            raise HTTPException(status_code=401, detail="Invalid API key")
        if "quota" in lowered or "exhaust" in lowered or "limit" in lowered:
            raise HTTPException(status_code=429, detail="API key quota exceeded")
        raise HTTPException(status_code=400, detail="API key validation failed")
