import os
import google.generativeai as genai
from dotenv import load_dotenv
import re
import json

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_json_from_llm_response(text):
    """Extracts JSON object/array from LLM response text"""
    # Try to extract from markdown code block
    match = re.search(r"``````", text, re.DOTALL)
    if match:
        json_str = match.group(1)
    else:
        # Fallback: extract the first JSON structure
        match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            raise ValueError(f"No JSON object found in response: {text}")
    
    try:
        return json.loads(json_str)
    except Exception as e:
        raise ValueError(f"Failed to parse JSON from response: {e}\nRaw: {json_str}")

def summarize_and_score_emails(emails):
    """Process multiple emails in a single LLM request"""
    # Build combined prompt for all emails
    email_prompts = []
    for i, email in enumerate(emails, 1):
        email_prompts.append(
            f"### Email {i} ###\n"
            f"Subject: {email['subject']}\n"
            f"Body: {email['body'][:1000]}{'...' if len(email['body']) > 1000 else ''}\n"
        )
    
    combined_prompt = (
        "You are an email prioritization assistant. For each email below:\n"
        "1. Write a 1-2 sentence summary\n"
        "2. Assign priority (1-5, 5=most urgent)\n"
        "3. Respond with JSON array of objects: [{'summary':..., 'priority':...}, ...]\n\n"
        "Guidelines:\n"
        "- Priority 5: Urgent action needed (e.g., deadlines, security issues)\n"
        "- Priority 4: Important but not urgent\n"
        "- Priority 3: Neutral importance\n"
        "- Priority 2: Low importance\n"
        "- Priority 1: Not important\n\n"
        "Emails:\n" + "\n".join(email_prompts)
    )
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(combined_prompt)
    return extract_json_from_llm_response(response.text)
