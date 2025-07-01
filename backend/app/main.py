from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from dotenv import load_dotenv
import os
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.utils import parsedate_to_datetime
from services.llm_utils import summarize_and_score_emails
from datetime import datetime, timedelta

# Load environment variables from .env
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_key")

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = Config(environ={
    "GOOGLE_CLIENT_ID": GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": GOOGLE_CLIENT_SECRET,
    "SECRET_KEY": SECRET_KEY,
})
oauth = OAuth(config)
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.readonly"
    }
)

@app.get("/auth/google/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def auth(request: Request):
    token = await oauth.google.authorize_access_token(request)
    response = RedirectResponse(url=f"http://localhost:5173/oauth-success?access_token={token['access_token']}")
    return response

@app.post("/api/emails")
async def get_emails(request: Request):
    data = await request.json()
    access_token = data.get("access_token")
    max_results = int(data.get("max_results", 10))
    date_from = data.get("date_from")  # "YYYY-MM-DD"
    date_to = data.get("date_to")      # "YYYY-MM-DD"

    if not access_token:
        raise HTTPException(status_code=400, detail="Missing access_token")

    try:
        creds = Credentials(token=access_token)
        service = build('gmail', 'v1', credentials=creds)

        # Gmail query for date range
        query = None
        if date_from and date_to:
            dt_from = datetime.strptime(date_from, "%Y-%m-%d")
            dt_to = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = f"after:{dt_from.strftime('%Y/%m/%d')} before:{dt_to.strftime('%Y/%m/%d')}"
        elif date_from:
            dt_from = datetime.strptime(date_from, "%Y-%m-%d")
            query = f"after:{dt_from.strftime('%Y/%m/%d')}"
        elif date_to:
            dt_to = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = f"before:{dt_to.strftime('%Y/%m/%d')}"

        emails = []
        page_token = None
        fetched_count = 0
        # If a date range is provided, ignore max_results and fetch all
        fetch_all = bool(date_from or date_to)

        while True:
            params = {
                "userId": "me",
                "q": query,
                "maxResults": 100,  # Gmail API max is 500, but 100 is safe
            }
            if not fetch_all:
                params["maxResults"] = max_results
            if page_token:
                params["pageToken"] = page_token

            results = service.users().messages().list(**params).execute()
            messages = results.get('messages', [])
            if not messages:
                break

            for msg in messages:
                msg_data = service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full',
                    metadataHeaders=['From', 'Subject', 'Date']
                ).execute()

                headers = {h['name']: h['value'] for h in msg_data['payload']['headers']}
                body = ""
                payload = msg_data['payload']

                if 'parts' in payload:
                    for part in payload['parts']:
                        if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                            body = part['body']['data']
                            break
                else:
                    body = payload.get('body', {}).get('data', '')

                if body:
                    try:
                        body = base64.urlsafe_b64decode(body + '===').decode('utf-8', errors='ignore')
                    except Exception:
                        body = ""

                date_str = headers.get("Date", "")
                date_iso = None
                if date_str:
                    try:
                        date_obj = parsedate_to_datetime(date_str)
                        date_iso = date_obj.isoformat()
                    except Exception:
                        date_iso = None
                if not date_iso and 'internalDate' in msg_data:
                    try:
                        date_obj = datetime.fromtimestamp(int(msg_data['internalDate']) / 1000)
                        date_iso = date_obj.isoformat()
                    except Exception:
                        date_iso = None

                emails.append({
                    "sender": headers.get("From", ""),
                    "subject": headers.get("Subject", ""),
                    "body": body,
                    "id": msg['id'],
                    "date": date_iso
                })
                fetched_count += 1
                if not fetch_all and fetched_count >= max_results:
                    break

            if not fetch_all and fetched_count >= max_results:
                break

            page_token = results.get("nextPageToken")
            if not page_token:
                break

        summary_data = summarize_and_score_emails(emails)
        for idx, email in enumerate(emails):
            email['summary'] = summary_data[idx].get('summary', '')
            email['priority'] = summary_data[idx].get('priority', 1)

        emails.sort(key=lambda e: e['priority'], reverse=True)
        return emails

    except Exception as e:
        print(f"Error fetching emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch emails")