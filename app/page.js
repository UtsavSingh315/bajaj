"use client";

import { useState } from "react";
import axios from "axios";
import TreeDisplay from "@/components/TreeDisplay";
import "./page.css";

export default function Home() {
  const [inputData, setInputData] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const dataArray = inputData
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const result = await axios.post("/api/bfhl", { data: dataArray });
      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to connect to API. Please check your input."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputData("");
    setResponse(null);
    setError("");
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🌳 Tree Builder</h1>
        <p className="subtitle">BFHL Processor - Hierarchy Analyzer</p>
      </header>

      <div className="main-content">
        <div className="input-section">
          <h2>📝 Enter Edges</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter edges like:&#10;A->B&#10;A->C&#10;B->D&#10;C->E&#10;E->F&#10;&#10;One edge per line"
              rows={8}
            />
            <div className="button-group">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "⏳ Processing..." : "✓ Submit"}
              </button>
              <button type="button" onClick={handleClear} className="clear-btn">
                🗑️ Clear
              </button>
            </div>
          </form>
        </div>

        <div className="results-section">
          {error && <div className="error-box">❌ {error}</div>}

          {response && (
            <div className="response-container">
              <div className="user-info">
                <h3>👤 User Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">User ID</span>
                    <span className="value">{response.user_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value" style={{ fontSize: "0.85em" }}>
                      {response.email_id}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Roll Number</span>
                    <span className="value" style={{ fontSize: "1.1em" }}>
                      {response.college_roll_number}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3>📊 Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item success">
                    <span className="label">✓ Valid Trees</span>
                    <span className="value">
                      {response.summary.total_trees}
                    </span>
                  </div>
                  <div className="summary-item warning">
                    <span className="label">⚠️ Cycles Found</span>
                    <span className="value">
                      {response.summary.total_cycles}
                    </span>
                  </div>
                  <div className="summary-item info">
                    <span className="label">🏆 Largest Tree</span>
                    <span className="value">
                      {response.summary.largest_tree_root || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <TreeDisplay hierarchies={response.hierarchies} />

              {response.invalid_entries.length > 0 && (
                <div className="issues-section">
                  <h3>❌ Invalid Entries ({response.invalid_entries.length})</h3>
                  <ul className="entries-list">
                    {response.invalid_entries.map((entry, idx) => (
                      <li key={idx}>{entry}</li>
                    ))}
                  </ul>
                </div>
              )}

              {response.duplicate_edges.length > 0 && (
                <div className="issues-section">
                  <h3>⚠️ Duplicate Edges ({response.duplicate_edges.length})</h3>
                  <ul className="entries-list">
                    {response.duplicate_edges.map((edge, idx) => (
                      <li key={idx}>{edge}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!response && !error && (
            <div className="placeholder">
              <p>📥 Enter edges above and click Submit to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
