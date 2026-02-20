// src/App.js
import React, { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Outfit',sans-serif;background:#F7F6F3;color:#1C1C1E;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#F7F6F3}
::-webkit-scrollbar-thumb{background:#ccc;border-radius:5px}
`;

export default function App() {
  const [leads, setLeads] = useState([]);

  // Inject global styles safely
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = STYLES;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // Dummy example: replace with your actual dashboard logic
  useEffect(() => {
    // Example lead data
    setLeads([
      { id: 1, name: "Lead A", score: 92, status: "Accepted" },
      { id: 2, name: "Lead B", score: 45, status: "Rejected" },
    ]);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Aven Lead Dashboard</h1>
      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>ID</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Name</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Score</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{lead.id}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{lead.name}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{lead.score}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
