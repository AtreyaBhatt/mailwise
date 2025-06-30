from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.services.mail_utils import EmailRetriever
from app.services.preprocess_utils import prepare_email_for_llm
from app.services.llm_utils import summarize_and_score_email
import traceback

app = FastAPI(
    title="Email Summarizer API",
    description="Production backend for retrieving, cleaning, summarizing, and prioritizing emails using Gemini 1.5 Flash.",
    version="1.0.0"
)

# CORS configuration for secure frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set your production frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for retrieving emails
class EmailRequest(BaseModel):
    email: str
    password: str
    limit: int = 10

# Response model including summary and priority
class GeminiEmailResponse(BaseModel):
    sender: str
    subject: str
    body: str
    summary: str
    priority: int

@app.get("/")
def read_root():
    return {"message": "Email Summarizer API is running in production."}

@app.post("/retrieve-emails", response_model=List[GeminiEmailResponse])
def retrieve_emails_endpoint(request: EmailRequest):
    """
    Retrieve emails, clean them, summarize, and assign priority using Gemini 1.5 Flash.
    All Gemini API calls are securely made from the backend.
    """
    retriever = EmailRetriever(request.email, request.password)
    try:
        retriever.connect()
        emails = retriever.fetch_emails(request.limit)
        retriever.close()
        results = []
        for email in emails:
            cleaned = prepare_email_for_llm(email)
            gemini_result = summarize_and_score_email(cleaned)
            results.append(GeminiEmailResponse(
                sender=cleaned["sender"],
                subject=cleaned["subject"],
                body=cleaned["body"],
                summary=gemini_result["summary"],
                priority=gemini_result["priority"]
            ))
        return results
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # This will print the full error in your terminal
        raise HTTPException(status_code=500, detail=str(e))