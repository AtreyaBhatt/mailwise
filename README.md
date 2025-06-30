# 📬 EmailWise — Prioritize & Summarize Your Emails Using AI

EmailWise is a personal productivity tool that integrates with Gmail via Google OAuth to fetch your recent emails, summarize them using LLMs, and assign a priority score to help you focus on what matters most.

Built with **FastAPI**, **React**, and **OAuth2**, this project demonstrates secure authentication, Google API usage, and AI-powered summarization.

---

## 🚀 Features

- 🔐 Google OAuth 2.0 login flow  
- 📥 Fetch recent Gmail messages  
- 🧠 AI-powered email summarization & priority scoring  
- 🎯 Sort emails by importance  
- 🖥️ Responsive and elegant UI with React  

---

## 🛠️ Tech Stack

| Frontend | Backend | AI / NLP | Auth |
|----------|---------|----------|------|
| React    | FastAPI | Google Gemini | Google OAuth 2.0 |
| Axios    | Starlette | Python | Authlib |
| Inter UI | CORS Middleware | OpenAI / Local LLM (configurable) | |

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project → **APIs & Services** → **OAuth Consent Screen**.
3. Enable **Gmail API**.
4. Create **OAuth Credentials** with:
   - Type: Web Application
   - Redirect URI: `http://localhost:8000/auth/google/callback`
5. Get your **Client ID** and **Client Secret**.

---

## 🧑‍💻 Local Setup

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_session_secret
```

Run the server:

```bash
uvicorn main:app --reload
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Make sure React is served on port `5173`, or update redirect URLs accordingly.

---

## 📡 API Endpoints

| Method | Route                    | Description                 |
|--------|--------------------------|-----------------------------|
| `GET`  | `/auth/google/login`     | Start Google OAuth flow     |
| `GET`  | `/auth/google/callback`  | OAuth2 redirect URI         |
| `POST` | `/api/emails`            | Fetch, summarize & score emails |

---

## 📄 Sample Email Output

```json
{
  "sender": "example@gmail.com",
  "subject": "Meeting Update",
  "summary": "Rescheduled team meeting to Thursday 4 PM.",
  "priority": 4,
  "id": "17c2ba43e1..."
}
```

---

## 🤖 Summarization & Scoring Logic

> Located in: `app/services/llm_utils.py`

Replace this with your preferred AI model:
- OpenAI GPT-3.5/4
- Llama2, Mixtral via Ollama
- Hugging Face Transformers

---

## 🔒 Disclaimer

This is a personal project for educational purposes. Use responsibly — it accesses your email data with read-only permission.

---

## 📌 To-Do / Improvements

- [ ] Support for pagination (more than 50 emails)
- [ ] Better error handling and token refresh
- [ ] Dark/light theme toggle
- [ ] Deployment via Docker or Render

---

## 📃 License

MIT License. Feel free to fork, remix, or contribute!
