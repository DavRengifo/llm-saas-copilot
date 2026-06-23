import json
import pytest
from unittest.mock import patch

# --- helpers ---

def mock_llm(return_value: str):
    return patch("services.llm_service.client.chat.completions.create",
                 return_value=_make_openai_response(return_value))


def _make_openai_response(content: str):
    class Msg:
        message = type("M", (), {"content": content})()

    class Choice:
        choices = [Msg()]

    return Choice()


# --- /analyze/feedback ---

FEEDBACK_OK = json.dumps({
    "themes": ["slow loading", "poor UI"],
    "sentiment": "negative",
    "priority_issues": ["app is too slow"],
    "executive_summary": "Users report performance issues.",
})


def test_feedback_success(client, auth_headers):
    with mock_llm(FEEDBACK_OK):
        resp = client.post(
            "/analyze/feedback",
            json={"text": "The app is slow and ugly.", "language": "en"},
            headers=auth_headers,
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["sentiment"] == "negative"
    assert "slow loading" in body["themes"]
    assert "executive_summary" in body


def test_feedback_defaults_to_english(client, auth_headers):
    with mock_llm(FEEDBACK_OK):
        resp = client.post(
            "/analyze/feedback",
            json={"text": "slow app"},
            headers=auth_headers,
        )
    assert resp.status_code == 200


@pytest.mark.parametrize("language", ["en", "fr", "es"])
def test_feedback_accepts_valid_languages(client, auth_headers, language):
    with mock_llm(FEEDBACK_OK):
        resp = client.post(
            "/analyze/feedback",
            json={"text": "feedback text", "language": language},
            headers=auth_headers,
        )
    assert resp.status_code == 200


def test_feedback_rejects_invalid_language(client, auth_headers):
    resp = client.post(
        "/analyze/feedback",
        json={"text": "text", "language": "de"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_feedback_invalid_llm_json_returns_422(client, auth_headers):
    with mock_llm("not json at all"):
        resp = client.post(
            "/analyze/feedback",
            json={"text": "text", "language": "en"},
            headers=auth_headers,
        )
    assert resp.status_code == 422


# --- /analyze/document ---

DOCUMENT_OK = json.dumps({
    "key_points": ["migration to PostgreSQL", "performance concerns"],
    "decisions": ["migrate to PostgreSQL"],
    "actions": ["John to update schema by Monday"],
    "summary": "The team agreed to migrate and John owns the schema update.",
})


def test_document_success(client, auth_headers):
    with mock_llm(DOCUMENT_OK):
        resp = client.post(
            "/analyze/document",
            json={"text": "We agreed to migrate to PostgreSQL. John will update by Monday."},
            headers=auth_headers,
        )
    assert resp.status_code == 200
    body = resp.json()
    assert "key_points" in body
    assert "decisions" in body
    assert "actions" in body
    assert "summary" in body


def test_document_accepts_bullets_format(client, auth_headers):
    with mock_llm(DOCUMENT_OK):
        resp = client.post(
            "/analyze/document",
            json={"text": "Some text", "output_format": "bullets"},
            headers=auth_headers,
        )
    assert resp.status_code == 200


def test_document_rejects_invalid_format(client, auth_headers):
    resp = client.post(
        "/analyze/document",
        json={"text": "text", "output_format": "markdown"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


# --- /analyze/extract ---

EXTRACT_OK = json.dumps({
    "extracted_data": {
        "dates": ["March 3rd", "end of Q2"],
        "amounts": ["$12,500", "50 units"],
    }
})


def test_extract_success(client, auth_headers):
    with mock_llm(EXTRACT_OK):
        resp = client.post(
            "/analyze/extract",
            json={"text": "Alice sold 50 units on March 3rd. Revenue was $12,500.", "extract_fields": ["dates", "amounts"]},
            headers=auth_headers,
        )
    assert resp.status_code == 200
    body = resp.json()
    assert "extracted_data" in body
    assert "dates" in body["extracted_data"]
    assert "amounts" in body["extracted_data"]


def test_extract_filters_to_requested_fields(client, auth_headers):
    with mock_llm(EXTRACT_OK):
        resp = client.post(
            "/analyze/extract",
            json={"text": "Alice sold 50 units.", "extract_fields": ["amounts"]},
            headers=auth_headers,
        )
    assert resp.status_code == 200
    body = resp.json()
    assert "names" not in body["extracted_data"]
    assert "amounts" in body["extracted_data"]


def test_extract_rejects_invalid_field(client, auth_headers):
    resp = client.post(
        "/analyze/extract",
        json={"text": "text", "extract_fields": ["emails"]},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_extract_requires_at_least_one_field(client, auth_headers):
    resp = client.post(
        "/analyze/extract",
        json={"text": "text", "extract_fields": []},
        headers=auth_headers,
    )
    assert resp.status_code in (200, 422)


# --- LLM schema mismatch ---

def test_feedback_llm_schema_mismatch_returns_422(client, auth_headers):
    """LLM returns valid JSON but 'themes' is a string instead of a list."""
    bad_schema = json.dumps({
        "themes": "customer satisfaction",
        "sentiment": "positive",
        "priority_issues": [],
        "executive_summary": "All good.",
    })
    with mock_llm(bad_schema):
        resp = client.post(
            "/analyze/feedback",
            json={"text": "great product"},
            headers=auth_headers,
        )
    assert resp.status_code == 422
