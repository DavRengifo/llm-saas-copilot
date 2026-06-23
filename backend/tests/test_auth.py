import json
from unittest.mock import patch

VALID_FEEDBACK_PAYLOAD = {"text": "Great product!", "language": "en"}

MOCK_FEEDBACK_RESPONSE = json.dumps({
    "themes": ["product quality"],
    "sentiment": "positive",
    "priority_issues": [],
    "executive_summary": "Users are happy.",
})


def test_missing_api_key_returns_422(client):
    response = client.post("/analyze/feedback", json=VALID_FEEDBACK_PAYLOAD)
    assert response.status_code == 422


def test_wrong_api_key_returns_401(client):
    response = client.post(
        "/analyze/feedback",
        json=VALID_FEEDBACK_PAYLOAD,
        headers={"X-API-Key": "wrong-key"},
    )
    assert response.status_code == 401


def test_valid_api_key_is_accepted(client, auth_headers):
    with patch("services.llm_service.client") as mock_openai:
        mock_openai.chat.completions.create.return_value.choices[0].message.content = MOCK_FEEDBACK_RESPONSE
        response = client.post("/analyze/feedback", json=VALID_FEEDBACK_PAYLOAD, headers=auth_headers)
    assert response.status_code == 200
