from bs4 import BeautifulSoup
import re

def html_to_text(html):
    """Convert HTML to plain text, removing scripts, styles, and extra whitespace."""
    soup = BeautifulSoup(html, "html.parser")
    # Remove all script and style elements
    for tag in soup(["script", "style", "head", "title", "meta", "[document]"]):
        tag.decompose()
    # Get text and collapse whitespace
    text = soup.get_text(separator=" ")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_text(text):
    # If the body looks like HTML, clean it
    if "<html" in text.lower() or "<!doctype" in text.lower():
        text = html_to_text(text)
    # Further cleaning (remove URLs, footers, etc.) can go here
    # Example: Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    return text.strip()

def prepare_email_for_llm(email):
    sender = email.get('sender', '')
    subject = email.get('subject', '')
    body = clean_text(email.get('body', ''))
    return {
        "sender": sender,
        "subject": subject,
        "body": body
    }
