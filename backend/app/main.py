# Import FastAPI framework and exception handling
from fastapi import FastAPI, HTTPException
# Import CORS middleware to allow frontend-backend communication
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic's BaseModel for request and response validation
from pydantic import BaseModel
# Import typing for type hints
from typing import List
# Import the EmailRetriever class for retrieving emails
from app.services.mail_utils import EmailRetriever  # Import your retriever

# Initialize the FastAPI application with metadata
app = FastAPI(
    title="Email Summarizer API",
    description="Backend for retrieving, prioritizing, and summarizing emails.",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the React frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class EmailRequest(BaseModel):
    """
    Model for the request body when retrieving emails.
    Includes user email, password, and the number of emails to fetch.
    """
    email: str
    password: str
    limit: int = 10

class EmailResponse(BaseModel):
    """
    Model for the response body for each processed email.
    Includes email metadata, assigned priority, and summary.
    """
    id: str
    subject: str
    sender: str
    body: str
    priority: int
    summary: str

# --- Helper functions ---

def assign_priority(email_data):
    """
    Assigns a simple priority to an email.
    Returns 2 if 'urgent' is in the subject, otherwise 1.
    """
    subject = email_data.get("subject", "").lower()
    return 2 if "urgent" in subject else 1

def summarize_email(body):
    """
    Summarizes the email body by returning the first 20 words.
    Adds '...' if the body is longer than 20 words.
    """
    return " ".join(body.split()[:20]) + ("..." if len(body.split()) > 20 else "")

# --- Routes ---

@app.get("/")
def read_root():
    """
    Health check endpoint.
    Returns a simple status message.
    """
    return {"message": "Email Summarizer API is running!"}

@app.post("/retrieve-emails", response_model=List[EmailResponse])
def retrieve_emails_endpoint(request: EmailRequest):
    """
    Endpoint to retrieve emails, assign priority, and summarize each email.
    Uses the EmailRetriever utility to fetch emails from the user's inbox.
    """
    retriever = EmailRetriever(request.email, request.password)
    try:
        # Connect to the mail server
        retriever.connect()
        # Fetch the specified number of emails
        emails = retriever.fetch_emails(request.limit)
        # Close the connection to the mail server
        retriever.close()
        processed_emails = []
        # Process each email: assign priority and generate summary
        for mail in emails:
            processed_emails.append(EmailResponse(
                id=mail["id"],
                subject=mail["subject"],
                sender=mail["sender"],
                body=mail["body"],
                priority=assign_priority(mail),
                summary=summarize_email(mail["body"])
            ))
        # Return the processed emails as the response
        return processed_emails
    except Exception as e:
        # Handle errors and return a 500 Internal Server Error
        raise HTTPException(status_code=500, detail=str(e))
