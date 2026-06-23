from fastapi import APIRouter, Depends, HTTPException
from models.schemas import (
    FeedbackRequest, FeedbackResponse,
    DocumentRequest, DocumentResponse,
    ExtractRequest, ExtractResponse,
)
from services.llm_service import call_llm
from prompts.feedback_analysis import SYSTEM_PROMPT as FEEDBACK_PROMPT, build_user_message as feedback_msg
from prompts.document_analysis import SYSTEM_PROMPT as DOCUMENT_PROMPT, build_user_message as document_msg
from prompts.extract import SYSTEM_PROMPT as EXTRACT_PROMPT, build_user_message as extract_msg
from dependencies import verify_api_key
import json

router = APIRouter(prefix="/analyze", tags=["analyze"], dependencies=[Depends(verify_api_key)])


def _parse_llm_response(raw: str, model_class):
    try:
        data = json.loads(raw)
        return model_class(**data)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=422, detail=f"LLM returned invalid JSON: {e}")


@router.post("/feedback", response_model=FeedbackResponse)
def analyze_feedback(request: FeedbackRequest) -> FeedbackResponse:
    user_message = feedback_msg(request.text, request.language)
    return _parse_llm_response(call_llm(FEEDBACK_PROMPT, user_message), FeedbackResponse)


@router.post("/document", response_model=DocumentResponse)
def analyze_document(request: DocumentRequest) -> DocumentResponse:
    user_message = document_msg(request.text, request.output_format, request.language)
    return _parse_llm_response(call_llm(DOCUMENT_PROMPT, user_message), DocumentResponse)


@router.post("/extract", response_model=ExtractResponse)
def analyze_extract(request: ExtractRequest) -> ExtractResponse:
    user_message = extract_msg(request.text, request.extract_fields, request.language)
    raw = call_llm(EXTRACT_PROMPT, user_message)
    try:
        data = json.loads(raw)
        response = ExtractResponse(**data)
        # Keep only requested fields in extracted_data
        filtered = {k: v for k, v in response.extracted_data.items() if k in request.extract_fields}
        return ExtractResponse(extracted_data=filtered)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=422, detail=f"LLM returned invalid JSON: {e}")
