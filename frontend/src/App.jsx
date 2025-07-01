import React, { useState, useEffect } from "react";
import axios from "axios";

const PRIORITY_COLORS = {
  1: "#808080",
  2: "#3fc380",
  3: "#f7ca18",
  4: "#fd7e14",
  5: "#dc3545",
};

const PRIORITY_LABELS = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

function LoginScreen({ onGoogleLogin }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#cfd2d7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          boxShadow: "0 4px 32px #d0d3db44",
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 28, color: "#232526" }}>
          Welcome to EmailWise
        </h1>
        <p style={{ color: "#555", margin: "1.1rem 0 2rem 0", fontSize: 15 }}>
          A minimal, modern Gmail viewer with priority filters and Google OAuth.
        </p>
        <button
          onClick={onGoogleLogin}
          style={{
            background: "#5AA8D6",
            color: "#edf3fb",
            border: "none",
            borderRadius: 14,
            padding: "0.7rem 2.2rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px #a3bedf88",
            letterSpacing: 0.1,
            marginTop: 10,
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48"
            style={{ display: "block" }}
          >
            <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.2-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.5 0 4.7.7 6.7 2l6.1-6.1C34.2 5.1 29.4 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.5-.3-3.5z"/>
            <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.2 16.1 18.7 13 24 13c2.5 0 4.7.7 6.7 2l6.1-6.1C34.2 5.1 29.4 3 24 3 15.2 3 7.7 8.7 6.3 14.7z"/>
            <path fill="#FBBC05" d="M24 43c5.4 0 10.2-1.8 13.8-4.9l-6.4-5.2C29.4 35.7 26.9 37 24 37c-5.5 0-10.2-3.7-11.8-8.8l-6.6 5.1C7.7 39.3 15.2 45 24 45z"/>
            <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 2.7-3.2 5-6.3 6.4l6.4 5.2C41.6 36.2 44 30.7 44 24c0-1.3-.1-2.5-.4-3.5z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxResults, setMaxResults] = useState(20);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("priority"); // "priority" or "date"
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fetchCount, setFetchCount] = useState(20);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const at = params.get("access_token");
    if (at) {
      setAccessToken(at);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchEmails();
    }
    // eslint-disable-next-line
  }, [accessToken]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const body = {
        access_token: accessToken,
      };
      if (dateFrom) body.date_from = dateFrom;
      if (dateTo) body.date_to = dateTo;
      if (!dateFrom && !dateTo) body.max_results = fetchCount;

      const res = await axios.post("http://localhost:8000/api/emails", body);
      setEmails(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch emails.");
    }
    setLoading(false);
  };

  const filteredEmails = emails
    .filter(email =>
      (priorityFilter.length === 0 || priorityFilter.includes(email.priority)) &&
      (
        email.sender.toLowerCase().includes(search.toLowerCase()) ||
        email.summary.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortMode === "priority") return b.priority - a.priority;
      if (sortMode === "date") return new Date(b.date) - new Date(a.date);
      return 0;
    });

  const handlePriorityToggle = (priority) => {
    setPriorityFilter((prev) =>
      prev.includes(Number(priority))
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  if (!accessToken) {
    return <LoginScreen onGoogleLogin={handleGoogleLogin} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#cfd2d7",
        color: "#232526",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 13,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Top bar with logo and search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 1100,
          marginBottom: 32,
          marginTop: 40,
          gap: 12,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 22,
            color: "#232526",
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
            flexShrink: 0,
            minWidth: 140,
          }}
        >
          EmailWise
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          {/* Search input */}
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 1px 6px #d0d3db22",
              border: "1px solid #ececec",
              padding: "0.1rem 1rem 0.1rem 1.2rem",
              height: 44,
              transition: "box-shadow 0.2s",
              minWidth: 0,
            }}
          >
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mail"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                flexGrow: 1,
                minWidth: 0,
                color: "#232526",
              }}
            />
            <button
              aria-label="Search"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: 0,
                marginLeft: 8,
              }}
              onClick={() => {}} // No-op, search is live
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#5AA8D6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
          {/* Filters Button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setFiltersOpen((f) => !f)}
              style={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 24,
                padding: "0.5rem 1.2rem",
                fontSize: 15,
                color: "#232526",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 1px 6px #d0d3db22",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Filters
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 10l5 5 5-5"
                  stroke="#5AA8D6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {filtersOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ececec",
                  borderRadius: 10,
                  boxShadow: "0 4px 24px #d0d3db22",
                  minWidth: 320,
                  zIndex: 10,
                  padding: "1.2rem 1.3rem 1.1rem 1.3rem",
                  marginTop: 4,
                }}
              >
                {/* Sort Options */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Sort</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => setSortMode("date")}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: sortMode === "date"
                          ? "linear-gradient(90deg, #5AA8D6 70%, #232526 100%)"
                          : "#f7f8fa",
                        color: sortMode === "date" ? "#fff" : "#232526",
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: "pointer",
                        boxShadow: sortMode === "date" ? "0 2px 8px #cfd2d755" : "none",
                        transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      By Date
                    </button>
                    <button
                      onClick={() => setSortMode("priority")}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: sortMode === "priority"
                          ? "linear-gradient(90deg, #5AA8D6 70%, #232526 100%)"
                          : "#f7f8fa",
                        color: sortMode === "priority" ? "#fff" : "#232526",
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: "pointer",
                        boxShadow: sortMode === "priority" ? "0 2px 8px #cfd2d755" : "none",
                        transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      By Priority
                    </button>
                  </div>
                </div>
                {/* Filter by Priority */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Filter by Priority</div>
                  <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
                    {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                      <button
                        key={priority}
                        onClick={() => handlePriorityToggle(Number(priority))}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: color,
                          border: priorityFilter.includes(Number(priority))
                            ? "3px solid #232526"
                            : "2px solid #e0e0e0",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border 0.15s",
                        }}
                        aria-label={PRIORITY_LABELS[priority]}
                      />
                    ))}
                  </div>
                </div>
                {/* Fetch by Date Range */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Fetch by Date Range</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      style={{
                        fontSize: 13,
                        borderRadius: 7,
                        border: "1px solid #e0e0e0",
                        padding: "4px 10px",
                        color: "#232526",
                        background: "#f7f8fa",
                      }}
                      placeholder="From"
                    />
                    <span style={{ fontSize: 14, color: "#888" }}>to</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      style={{
                        fontSize: 13,
                        borderRadius: 7,
                        border: "1px solid #e0e0e0",
                        padding: "4px 10px",
                        color: "#232526",
                        background: "#f7f8fa",
                      }}
                      placeholder="To"
                    />
                  </div>
                </div>
                {/* Fetch by Number */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Fetch by Number</div>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={fetchCount}
                    onChange={e => setFetchCount(Number(e.target.value))}
                    style={{
                      fontSize: 13,
                      borderRadius: 7,
                      border: "1px solid #e0e0e0",
                      padding: "4px 10px",
                      color: "#232526",
                      background: "#f7f8fa",
                      width: 70,
                    }}
                  />
                </div>
                {/* Fetch Emails Button */}
                <button
                  onClick={() => { setMaxResults(fetchCount); fetchEmails(); setFiltersOpen(false); }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: "#5AA8D6",
                    color: "#edf3fb",
                    border: "none",
                    borderRadius: 10,
                    padding: "0.7rem 0",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 4,
                    boxShadow: "0 2px 8px #a3bedf88",
                    letterSpacing: 0.1,
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? "Loading..." : "Fetch Emails"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(224,226,231,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: "6px solid #b4d2fe",
              borderTop: "6px solid #ffe066",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: 16,
            }} />
            <span style={{ color: "#232526", fontWeight: 500, fontSize: 16 }}>Loading...</span>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg);}
                  100% { transform: rotate(360deg);}
                }
              `}
            </style>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#ff686b",
            marginBottom: 20,
            fontSize: 13,
            borderRadius: 8,
            background: "#fff3f3",
            padding: "0.7em 1.2em",
          }}
        >
          {error}
        </div>
      )}
      {filteredEmails.length > 0 && (
        <table
          style={{
            width: "100%",
            maxWidth: 1100,
            borderCollapse: "separate",
            borderSpacing: 0,
            background: "rgba(255,255,255,0.5)",
            borderRadius: 22,
            overflow: "hidden",
            color: "#232526",
            fontSize: 13.5,
            boxShadow: "0 2px 24px #eaeaea88",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <thead>
            <tr
              style={{
                background: "rgba(247,248,250,0.5)",
                color: "#888",
                textAlign: "left",
                fontWeight: 600,
                fontSize: 12.5,
              }}
            >
              <th style={{ padding: "1.2rem 1.2rem" }}></th>
              <th style={{ padding: "1.2rem 1.2rem" }}>Sender</th>
              <th style={{ padding: "1.2rem 1.2rem" }}>Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmails.map((email, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: "1px solid #f7f8fa",
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(247,248,250,0.5)",
                }}
              >
                <td style={{ padding: "1.1rem 1.2rem", width: 30 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: PRIORITY_COLORS[email.priority] || "#ccc",
                      display: "inline-block",
                      border: "1.5px solid #ececec",
                      marginRight: 0,
                    }}
                  />
                </td>
                <td style={{ padding: "1.1rem 1.2rem", fontWeight: 500 }}>
                  {email.sender}
                </td>
                <td style={{
                  padding: "1.1rem 1.2rem",
                  minWidth: 180,
                  position: "relative",
                  verticalAlign: "top",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", minHeight: 36 }}>
                    <span style={{ wordBreak: "break-word" }}>{email.summary}</span>
                    {email.date && (
                      <span
                        style={{
                          alignSelf: "flex-end",
                          fontSize: 11,
                          color: "#fff",
                          opacity: 0.92,
                          marginTop: 8,
                          letterSpacing: 0.2,
                          fontFamily: "monospace",
                          background: "#23272f",
                          padding: "2px 8px",
                          borderRadius: 7,
                          boxShadow: "0 1px 2px #2223",
                        }}
                      >
                        {new Date(email.date).toLocaleString(undefined, {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filteredEmails.length === 0 && emails.length > 0 && (
        <div
          style={{
            opacity: 0.6,
            marginTop: 40,
            fontSize: 13,
            letterSpacing: 0.1,
          }}
        >
          No emails match the selected filters.
        </div>
      )}
    </div>
  );
}

export default App;
