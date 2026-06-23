from fastapi import Header, HTTPException
from dotenv import load_dotenv
import os

load_dotenv()

_API_KEY = os.getenv("API_SECRET_KEY")


def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    if not _API_KEY:
        raise HTTPException(status_code=500, detail="Server API key not configured")
    if x_api_key != _API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key
