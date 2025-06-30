import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";

const PRIORITY_LABELS = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

const PRIORITY_COLORS = {
  1: "#808080",   // Very Low - Gray
  2: "#3fc380",   // Low - Green
  3: "#f7ca18",   // Medium - Yellow
  4: "#fd7e14",   // High - Orange
  5: "#dc3545",   // Very High - Red
};

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [maxResults, setMaxResults] = useState(10);

  // Handle Google login redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const at = params.get("access_token");
    if (at) {
      setAccessToken(at);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Redirect user to backend Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  // Fetch emails from backend using access token
  const fetchEmails = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/emails", {
        access_token: accessToken,
        max_results: maxResults,
      });
      setEmails(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch emails.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID.apps.googleusercontent.com">
      <div
        style={{
          padding: 32,
          fontFamily: "Inter, Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#181a1b",
          color: "#f7f7fa",
        }}
      >
        <h1 style={{ marginBottom: 24 }}>EmailWise (Google OAuth Demo)</h1>

        {!accessToken ? (
          <button
            onClick={handleGoogleLogin}
            style={{
              background: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "0.7rem 2rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>
                Number of emails to fetch:{" "}
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxResults}
                  onChange={e => setMaxResults(Number(e.target.value))}
                  style={{
                    width: 60,
                    padding: "0.3rem",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    marginLeft: 8,
                  }}
                />
              </label>
            </div>
            <button
              onClick={fetchEmails}
              style={{
                background: "#fd5c63",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "0.7rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 24,
              }}
            >
              Fetch Emails
            </button>

            {error && (
              <div style={{ color: "#fd5c63", marginBottom: 20 }}>{error}</div>
            )}

            {emails.length > 0 && (
              <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#26282a",
            borderRadius: 10,
            overflow: "hidden",
            color: "#f7f7fa",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#232526",
                color: "#fd5c63",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "0.8rem 0.6rem" }}>Sender</th>
              <th style={{ padding: "0.8rem 0.6rem" }}>Subject</th>
              <th style={{ padding: "0.8rem 0.6rem" }}>Summary</th>
              <th style={{ padding: "0.8rem 0.6rem" }}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {emails
              .sort((a, b) => b.priority - a.priority)
              .map((email, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "0.8rem 0.6rem" }}>{email.sender}</td>
                  <td style={{ padding: "0.8rem 0.6rem" }}>{email.subject}</td>
                  <td style={{ padding: "0.8rem 0.6rem" }}>{email.summary}</td>
                  <td style={{ padding: "0.8rem 0.6rem" }}>
                    <span
                      style={{
                        background: PRIORITY_COLORS[email.priority] || "#888",
                        color: "#222",
                        borderRadius: "8px",
                        padding: "2px 10px",
                        fontWeight: "bold",
                        fontSize: "0.95em",
                        display: "inline-block",
                        minWidth: 70,
                        textAlign: "center",
                      }}
                    >
                      {PRIORITY_LABELS[email.priority] || email.priority}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
            )}
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
