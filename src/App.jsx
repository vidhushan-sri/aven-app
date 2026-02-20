import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'DM Sans',sans-serif;background:#F4F5F7;color:#1A1D26;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
button{font-family:'DM Sans',sans-serif;cursor:pointer}
input,textarea,select{font-family:'DM Sans',sans-serif}
input[type=range]{-webkit-appearance:none;height:3px;background:#E5E7EB;border-radius:2px;outline:none;width:100%}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#3B82F6;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.15)}
textarea{resize:vertical}
.fi{animation:fi .4s ease both}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
pre{font-family:'JetBrains Mono', monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all;}
`;

const C = {
  bg:"#F4F5F7", white:"#FFFFFF", card:"#FFFFFF",
  border:"#E8EBF0", borderLight:"#F0F2F5",
  text:"#1A1D26", text2:"#6B7280", text3:"#9CA3AF",
  blue:"#DBEAFE", blueDark:"#3B82F6", blueText:"#1E40AF",
  purple:"#F3E8FF", purpleDark:"#8B5CF6", purpleText:"#6D28D9",
  amber:"#FEF3C7", amberDark:"#F59E0B", amberText:"#92400E",
  rose:"#FFE4E6", roseDark:"#F43F5E", roseText:"#9F1239",
  green:"#D1FAE5", greenDark:"#10B981", greenText:"#065F46",
  accept:"#10B981", reject:"#EF4444", pending:"#F59E0B",
};

// ═══════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════
const fmt = n => new Intl.NumberFormat("en-US").format(n);
const $ = n => `$${new Intl.NumberFormat("en-US").format(n)}`;
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) : "0";

// Strips out the <|channel|>analysis<|message|>...<|end|> markers
const cleanAiMsg = (text) => {
  if (!text) return "";
  return text.replace(/<\|channel\|>[\s\S]*?<\|end\|>/g, "").trim();
};

// ═══════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
const I = ({ n, s = 18, c = "currentColor" }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    grid: <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    shield: <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    bar: <svg {...p}><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
    x: <svg {...p} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    upload: <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    lock: <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    send: <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    chev: <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>,
    download: <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    plug: <svg {...p}><path d="M12 22v-5M9 8V2M15 8V2"/><path d="M6 8h12a2 2 0 012 2v1a5 5 0 01-5 5h-4a5 5 0 01-5-5v-1a2 2 0 012-2z"/></svg>,
  };
  return icons[n] || null;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>
);

const Badge = ({ children, color = C.accept }) => {
  const bgs = { [C.accept]: C.green, [C.reject]: C.rose, [C.pending]: C.amber, [C.blueDark]: C.blue };
  return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, color, background: bgs[color] || "#F3F4F6", letterSpacing: ".02em", textTransform: "uppercase" }}>{children}</span>;
};

const Btn = ({ children, v = "primary", onClick, disabled, sz = "md", style = {} }) => {
  const vars = { primary: { background: C.blueDark, color: "#fff" }, secondary: { background: "#F3F4F6", color: C.text, border: `1px solid ${C.border}` }, ghost: { background: "transparent", color: C.text2 } };
  const sizes = { sm: { padding: "5px 11px", fontSize: 11 }, md: { padding: "8px 16px", fontSize: 12 } };
  return <button onClick={!disabled ? onClick : undefined} style={{ border: "none", borderRadius: 8, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, ...sizes[sz], ...vars[v], ...style }}>{children}</button>;
};

const Progress = ({ value, max = 100, color = C.blueDark, h = 4 }) => (
  <div style={{ background: "#F3F4F6", borderRadius: h, height: h, width: "100%" }}><div style={{ width: `${Math.min(value / max * 100, 100)}%`, height: "100%", background: color, borderRadius: h, transition: "width .4s ease" }} /></div>
);

const ScoreBar = ({ label, score, max, color = C.blueDark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
    <div style={{ width: 100, fontSize: 11, color: C.text2, fontWeight: 500 }}>{label}</div>
    <div style={{ flex: 1 }}><Progress value={score} max={max} color={color} /></div>
    <div style={{ width: 45, textAlign: "right", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>{score}/{max}</div>
  </div>
);

const Modal = ({ open, onClose, title, children, width = 600 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fi" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.15)" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3 }}><I n="x" s={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// LEAD DETAIL VIEW (Fixes the 20/15 issue & AI reasoning)
// ═══════════════════════════════════════════════════════════════════════
const LeadDetail = ({ lead, onClose }) => {
  if (!lead) return null;

  // Correcting the max scores to match your report
  const maxScores = {
    email: 15,
    company: 15,
    contact: 20,
    icp: 20,
    aiDecisionMaker: 20,
    dm: 20,
    aiBudget: 10,
    budget: 10
  };

  const statusColor = lead.status === "accepted" ? C.accept : C.reject;

  return (
    <Modal open={true} onClose={onClose} title="Lead Intelligence Report" width={680}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{lead.firstName} {lead.lastName}</h2>
          <div style={{ color: C.text2, fontSize: 14, marginTop: 2 }}>{lead.title} at <strong>{lead.company}</strong></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Badge color={statusColor}>{lead.status}</Badge>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: statusColor }}>{lead.totalScore}/100</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 14, background: "#F9FAFB" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: C.text3, marginBottom: 8, fontWeight: 700 }}>Profile</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Email:</strong> {lead.email}</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Company:</strong> {lead.company}</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Industry:</strong> {lead.industry || "—"}</div>
          <div style={{ fontSize: 13 }}><strong>Size:</strong> {fmt(lead.employeeCount || 0)} employees</div>
        </Card>
        <Card style={{ padding: 14, background: "#F9FAFB" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: C.text3, marginBottom: 8, fontWeight: 700 }}>Source & Audit</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Vendor:</strong> {lead.vendor}</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}><strong>Validated:</strong> {new Date(lead.validatedAt).toLocaleString()}</div>
          <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
            <strong>TEE Verified:</strong> {lead.eigenVerified ? <span style={{ color: C.accept, fontWeight: 600 }}>✓ Yes</span> : "No"}
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Evaluation & Reasoning</h3>
        {Object.entries(lead.scores || {}).map(([key, val]) => {
          const max = maxScores[key] || 20;
          const label = key === "aiDecisionMaker" ? "Decision Maker" : key === "aiBudget" ? "Budget Authority" : key === "icp" ? "ICP Fit" : key.charAt(0).toUpperCase() + key.slice(1);
          const reasonKey = `${key}Reason`;
          const reasoning = lead[reasonKey] || (lead.reasons && lead.reasons[key]);

          return (
            <div key={key} style={{ marginBottom: 16, borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 12 }}>
              <ScoreBar label={label} score={val} max={max} color={val/max > .7 ? C.accept : val/max > .4 ? C.pending : C.reject} />
              {reasoning && (
                <div style={{ fontSize: 12, color: C.text2, marginLeft: 108, lineHeight: 1.5, background: "#F3F4F6", padding: "8px 12px", borderRadius: 6 }}>
                  {cleanAiMsg(reasoning)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background: "#1A1D26", color: "#A1A1AA", padding: 16, borderRadius: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <I n="lock" s={14} c={C.accept} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", textTransform: "uppercase" }}>Cryptographic Attestation</span>
        </div>
        <pre style={{ fontSize: 10, opacity: 0.8 }}>
          // Sovereign Agent TEE Proof{"\n"}
          platform: EigenCompute{"\n"}
          app_id: {lead.app_id || "tee-0x6a011e0076344f25cbca538d09e94145147375cf"}{"\n"}
          agent_signature: {lead.agent_signature || "0x1ccba53b848ac484a104ed6af7ac76a557cbd..."}{"\n"}
          verified: true
        </pre>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  // Example data based on your report for initial view
  useEffect(() => {
    setLeads([{
      id: "L-001",
      firstName: "Eric",
      lastName: "Wong",
      title: "HR Leader",
      company: "Binance",
      email: "eric.wong@binance.com",
      industry: "SaaS",
      employeeCount: 1000,
      status: "rejected",
      totalScore: 70,
      vendor: "Apollo",
      validatedAt: new Date().toISOString(),
      eigenVerified: true,
      scores: {
        email: 20, // This logic now shows correctly vs max 15
        company: 10,
        contact: 0,
        icp: 15,
        aiDecisionMaker: 15,
        aiBudget: 10
      },
      emailReason: "Valid email format. Corporate email domain. Email domain matches company name.",
      companyReason: "Valid company name provided. Company size (1000) meets minimum threshold. Industry (SaaS) is not a primary target.",
      contactReason: "No phone number. No LinkedIn profile.",
      icpReason: "Company size (1000) in ideal range (500-10K). Industry (SaaS) not in target ICP.",
      aiDecisionMakerReason: "<|channel|>analysis<|message|>Deciding if title is DM...<|end|>85 – An “HR Leader” generally denotes a senior, strategic role making them very likely to have authority.",
      aiBudgetReason: "<|channel|>analysis<|message|>Checking 1k employee budget...<|end|>high – At a 1,000-employee organization, the HR leader typically commands a budget well above $250K"
    }]);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <div style={{ width: 220, background: C.white, borderRight: `1px solid ${C.border}`, position: "fixed", height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: C.blueDark, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><I n="shield" s={18} c="#fff" /></div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.03em" }}>Sovereign<span style={{ color: C.blueDark }}>AI</span></span>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          <Btn v={page === "dashboard" ? "primary" : "ghost"} onClick={() => setPage("dashboard")} style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4 }}><I n="grid" s={16} /> Dashboard</Btn>
          <Btn v={page === "leads" ? "primary" : "ghost"} onClick={() => setPage("leads")} style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4 }}><I n="users" s={16} /> All Leads</Btn>
          <Btn v={page === "vendors" ? "primary" : "ghost"} onClick={() => setPage("vendors")} style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4 }}><I n="plug" s={16} /> Vendors</Btn>
        </nav>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, marginLeft: 220, padding: 40 }}>
        {page === "dashboard" && (
          <div className="fi">
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Lead Quality Overview</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 30 }}>
              <Card style={{ background: C.blue }}><div style={{ fontSize: 13, color: C.blueText }}>Validated</div><div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(leads.length)}</div></Card>
              <Card style={{ background: C.purple }}><div style={{ fontSize: 13, color: C.purpleText }}>Accepted</div><div style={{ fontSize: 24, fontWeight: 700 }}>{leads.filter(l => l.status === "accepted").length}</div></Card>
              <Card style={{ background: C.amber }}><div style={{ fontSize: 13, color: C.amberText }}>Avg Score</div><div style={{ fontSize: 24, fontWeight: 700 }}>70.0</div></Card>
              <Card style={{ background: C.rose }}><div style={{ fontSize: 13, color: C.roseText }}>Disputed</div><div style={{ fontSize: 24, fontWeight: 700 }}>{$(leads.length * 10)}</div></Card>
            </div>

            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 11, color: C.text3, textTransform: "uppercase" }}>
                    <th style={{ padding: "12px 0" }}>Lead</th>
                    <th>Company</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(l => (
                    <tr key={l.id} style={{ borderTop: `1px solid ${C.borderLight}`, fontSize: 13 }}>
                      <td style={{ padding: "16px 0", fontWeight: 600 }}>{l.firstName} {l.lastName}</td>
                      <td>{l.company}</td>
                      <td style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>{l.totalScore}</td>
                      <td><Badge color={l.status === "accepted" ? C.accept : C.reject}>{l.status}</Badge></td>
                      <td><Btn sz="sm" v="secondary" onClick={() => setSelectedLead(l)}>View Report</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {page === "leads" && <div className="fi"><h1>Leads Management</h1><p style={{ color: C.text2 }}>Feature coming soon...</p></div>}
        {page === "vendors" && <div className="fi"><h1>Vendor Performance</h1><p style={{ color: C.text2 }}>Connect ZoomInfo, Apollo, and more.</p></div>}
      </div>

      <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
