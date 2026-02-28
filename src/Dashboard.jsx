import React from 'react';

const Dashboard = ({ leads = [] }) => {
  const C = {
    bg: "#FFFFFF",
    border: "#E5E7EB",
    text1: "#1A1D26",
    text2: "#4B5563",
    text3: "#9CA3AF",
    primary: "#4F46E5", 
    success: "#10B981", 
    successBg: "#D1FAE5"
  };

  const cardStyle = {
    background: C.bg,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text1, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: C.text3 }}>Welcome back! Here's what's happening today.</p>
        </div>
        <button style={{
          background: C.primary, color: "#fff", padding: "10px 18px", borderRadius: 8, 
          fontSize: 14, fontWeight: 600, border: "none", display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer"
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
          </svg>
          Generate Leads
        </button>
      </div>

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: C.text2, fontWeight: 500, marginBottom: 8 }}>Total Leads Processed</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.text1 }}>24,592</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.success, background: C.successBg, padding: "2px 6px", borderRadius: 4, marginBottom: 6 }}>+12%</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: C.text2, fontWeight: 500, marginBottom: 8 }}>Conversion Rate</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.text1 }}>8.4%</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.success, background: C.successBg, padding: "2px 6px", borderRadius: 4, marginBottom: 6 }}>+1.2%</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: C.text2, fontWeight: 500, marginBottom: 8 }}>Target Reached</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.text1 }}>64%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "64%", height: "100%", background: C.primary, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1 }}>Conversion Activity</h2>
            <select style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.text2, cursor: "pointer" }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div style={{ flex: 1, minHeight: 250, background: "#F9FAFB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, border: `1px dashed ${C.border}` }}>
            [ Chart Visualization ]
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1, marginBottom: 20 }}>Recent Activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "Lead #1024 Qualified", time: "2 minutes ago", color: C.primary },
              { title: "Follow-up email sent", time: "15 minutes ago", color: C.success },
              { title: "System backup completed", time: "1 hour ago", color: C.text3 },
              { title: "Campaign 'Alpha' Launched", time: "Yesterday", color: C.primary }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text1 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
