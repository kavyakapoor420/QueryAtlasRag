import secrets
from typing import Optional

from fastapi import Header, HTTPException

_sessions = {}


def create_session(api_key: str) -> str:
    token = secrets.token_urlsafe(32)
    _sessions[token] = api_key
    return token


def remove_session(token: str) -> None:
    _sessions.pop(token, None)


def get_api_key(token: str) -> Optional[str]:
    return _sessions.get(token)


def require_session(x_api_session: str = Header(None)) -> str:
    if not x_api_session:
        raise HTTPException(status_code=401, detail="Missing session token")
    api_key = get_api_key(x_api_session)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return api_key
