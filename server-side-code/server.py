import json 
import os 
import uuid 
from typing import List, Dict, Any

from RAG.backend.app.utils.auth import create_session, remove_session
from fastapi import FastAPI,UploadFile,File,HTTException,Depends,Header
from fastapi.responses import StreamingResponse 
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel 

app=FastAPI() 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True ,
    allow_method=["*"],
    allow_headers=["*"]
)


class QueryRequest(BaseModel):
    question:str
    top_k:int=5
    alpha:float=0.5 

class LoginRequest(BaseModel):
    api_key:str
    username:str
    password:str


@app.on_event("startup")

def on_startup():
    init_db() 

@app.get("/api/health")
def health():
    return {"status":"ok"}

@app.post("/api/auth/login")
def login(req:LoginRequest):
    validate_api_key(req.api_key)
    # Here you would normally validate the username and password against your user database
    # For simplicity, we will just return a success response if the API key is valid
    session_token=create_session(req.api_key)
    return {"session_token":session_token}

@app.post("/api/auth/logout")
def logout(x_api_session:str=Header(None)):
    if x_api_session:
        remove_session(x_api_session)

    return {"status":"ok","message":"Logged out successfully"}


@app.get('/api/auth/status')
def status(api_key:str=Depends(require_session)):
    return {"status":"ok"}


@app.post('')