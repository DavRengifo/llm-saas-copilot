from pydantic import BaseModel, Field
from typing import Literal


class FeedbackRequest(BaseModel):
    text: str = Field(min_length=1, max_length=100000)
    language: Literal["fr", "en", "es"] = "en"


class FeedbackResponse(BaseModel):
    themes: list[str]
    sentiment: Literal["positive", "negative", "mixed"]
    priority_issues: list[str]
    executive_summary: str


class DocumentRequest(BaseModel):
    text: str = Field(min_length=1, max_length=100000)
    output_format: Literal["bullets", "structured"] = "structured"
    language: Literal["fr", "en", "es"] = "en"


class DocumentResponse(BaseModel):
    key_points: list[str]
    decisions: list[str]
    actions: list[str]
    summary: str


class ExtractRequest(BaseModel):
    text: str = Field(min_length=1, max_length=100000)
    extract_fields: list[Literal["dates", "names", "amounts"]] = Field(min_length=1)
    language: Literal["fr", "en", "es"] = "en"


class ExtractResponse(BaseModel):
    extracted_data: dict[str, list[str]]
