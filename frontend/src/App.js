import React, { useState } from "react";
import { fetchEmails } from "./api/emailApi";
import EmailTable from "./components/EmailTable";
import Loader from "./components/Loader";

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
      const response = await fetchEmails(email, password, limit);
      setEmails(response.data);
    } catch (err) {
      setError("Failed to fetch emails. Please check your credentials and try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>EmailWise</h1>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="App password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="number"
          min={1}
          max={50}
          value={limit}
          onChange={e => setLimit(e.target.value)}
          className="limit-input"
        />
        <button type="submit" disabled={loading}>Fetch Emails</button>
      </form>
      {loading && <Loader />}
      {error && <div className="error">{error}</div>}
      <EmailTable emails={emails} />
      <footer>
        <span>Minimal dark mode. Powered by FastAPI &amp; Gemini Flash 1.5.</span>
      </footer>
    </div>
  );
}

export default App;
