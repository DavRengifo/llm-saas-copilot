import pytest
import os
from fastapi.testclient import TestClient

os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.setdefault("API_SECRET_KEY", "test-secret")

from main import app  # noqa: E402 — env must be set before import


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers():
    return {"X-API-Key": "test-secret"}
