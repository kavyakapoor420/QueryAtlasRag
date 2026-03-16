import os

from dotenv import load_dotenv

load_dotenv()

APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(APP_DIR))

STORAGE_DIR = os.path.join(BACKEND_DIR, "storage")
UPLOADS_DIR = os.path.join(STORAGE_DIR, "uploads")
CHROMA_DIR = os.path.join(STORAGE_DIR, "chroma")
DB_PATH = os.path.join(STORAGE_DIR, "app.db")

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
