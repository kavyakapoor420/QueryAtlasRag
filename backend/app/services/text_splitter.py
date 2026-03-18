from typing import List


def chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks: List[str] = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 1 <= max_chars:
            current = (current + " " + p).strip()
        else:
            if current:
                chunks.append(current)
            current = p
    if current:
        chunks.append(current)

    if overlap <= 0 or len(chunks) <= 1:
        return chunks

    overlapped = []
    for i, chunk in enumerate(chunks):
        if i == 0:
            overlapped.append(chunk)
            continue
        prev = chunks[i - 1]
        tail = prev[-overlap:]
        overlapped.append((tail + " " + chunk).strip())
    return overlapped
