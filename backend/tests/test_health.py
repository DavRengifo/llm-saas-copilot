def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "model" in body


def test_health_requires_no_auth(client):
    response = client.get("/health")
    assert response.status_code == 200
