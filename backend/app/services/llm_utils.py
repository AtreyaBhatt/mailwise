import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

import re
import json

def extract_json_from_llm_response(text):
    """
    Extracts JSON object from a string that may be wrapped in markdown code block.
    """
    # Try to extract JSON from a markdown code block
    match = re.search(r"``````", text, re.DOTALL)
    if match:
        json_str = match.group(1)
    else:
        # Fallback: extract the first {...} block
        match = re.search(r"({.*})", text, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            raise ValueError(f"No JSON object found in response: {text}")
    try:
        return json.loads(json_str)
    except Exception as e:
        raise ValueError(f"Failed to parse JSON from response: {e}\nRaw: {json_str}")

def summarize_and_score_email(email):
    prompt = (
        f"Email subject: {email['subject']}\n"
        f"Email body: {email['body']}\n\n"
        "Summarize this email in 1-2 sentences and assign a priority from 1-5 (1=very low, 5=very high) based on urgency or importance. "
        "Importance is based on how urgently the email needs to be addressed"
        "Respond in JSON as: {\"summary\": \"...\", \"priority\": <number>}"
    )
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return extract_json_from_llm_response(response.text)