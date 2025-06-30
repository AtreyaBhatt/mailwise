import React, { useState } from "react";
import axios from "axios";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [limit, setLimit] = useState(10);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEmails([]);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/retrieve-emails`,
        { email, password, limit: Number(limit) }
      );
      setEmails(response.data);
    } catch (err) {
      setError("Failed to fetch emails. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#181a1b",
        color: "#f7f7fa",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        maxWidth: 800,
        margin: "2rem auto",
        padding: "1rem 2rem",
        borderRadius: 14,
        boxShadow: "0 2px 24px #0008",
      }}
    >
      <h1 style={{ color: "#fd5c63", textAlign: "center", marginBottom: 24 }}>
        EmailWise
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            flex: "1 1 250px",
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid #444",
            background: "#26282a",
            color: "#f7f7fa",
            fontSize: "1rem",
          }}
        />
        <input
          type="password"
          placeholder="App password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            flex: "1 1 250px",
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid #444",
            background: "#26282a",
            color: "#f7f7fa",
            fontSize: "1rem",
          }}
        />
        <input
          type="number"
          min={1}
          max={50}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          style={{
            width: 80,
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid #444",
            background: "#26282a",
            color: "#f7f7fa",
            fontSize: "1rem",
            textAlign: "center",
          }}
          title="Number of emails to fetch"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#fd5c63",
            border: "none",
            borderRadius: 8,
            padding: "0.6rem 2rem",
            color: "#fff",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            flex: "1 1 120px",
          }}
        >
          {loading ? "Fetching..." : "Fetch Emails"}
        </button>
      </form>
      {error && (
        <div
          style={{
            color: "#fd5c63",
            marginBottom: 20,
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
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
      <footer style={{ color: "#aaa", fontSize: "0.95em", marginTop: 32, textAlign: "center" }}>
        Minimal dark mode. Powered by FastAPI &amp; Gemini Flash 1.5.
      </footer>
    </div>
  );
}

export default App;
