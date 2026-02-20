import { useState, useEffect, useRef } from "react";

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
`;

// ═══════════════════════════════════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════════════════════════════════
const C = {
  bg:"#F4F5F7", white:"#FFFFFF", card:"#FFFFFF",
  border:"#E8EBF0", borderLight:"#F0F2F5",
  text:"#1A1D26", text2:"#6B7280", text3:"#9CA3AF", textFaint:"#D1D5DB",
  blue:"#DBEAFE", blueDark:"#3B82F6", blueText:"#1E40AF",
  purple:"#F3E8FF", purpleDark:"#8B5CF6", purpleText:"#6D28D9",
  amber:"#FEF3C7", amberDark:"#F59E0B", amberText:"#92400E",
  rose:"#FFE4E6", roseDark:"#F43F5E", roseText:"#9F1239",
  green:"#D1FAE5", greenDark:"#10B981", greenText:"#065F46",
  accept:"#10B981", reject:"#EF4444", pending:"#F59E0B",
};

// ═══════════════════════════════════════════════════════════════════════
// AGENT API
// ═══════════════════════════════════════════════════════════════════════
const AGENT = "/api/proxy";

async function api(path, opts = {}) {
  try {
    const r = await fetch(`${AGENT}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    return await r.json();
  } catch (e) {
    return { error: e.message };
  }
}

const agentValidate = (lead) => api("/validate", { method: "POST", body: JSON.stringify(lead) });
const agentBatch = (leads) => api("/validate/batch", { method: "POST", body: JSON.stringify({ leads }) });
const agentStatus = () => api("/status");

// ═══════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════
const I = ({ n, s = 18, c = "currentColor" }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    grid: <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    shield: <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    scale: <svg {...p}><path d="M12 3v18M3 7l9-4 9 4M3 7v2c0 1 3 3 6 3V7M15 7v5c3 0 6-2 6-3V7"/></svg>,
    bar: <svg {...p}><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
    x: <svg {...p} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    upload: <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    download: <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    lock: <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    send: <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    info: <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
    check: <svg {...p} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    chev: <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>,
    plug: <svg {...p}><path d="M12 22v-5M9 8V2M15 8V2"/><path d="M6 8h12a2 2 0 012 2v1a5 5 0 01-5 5h-4a5 5 0 01-5-5v-1a2 2 0 012-2z"/></svg>,
  };
  return icons[n] || null;
};

// ═══════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
const Card = ({ children, style, className = "" }) => (
  <div className={className} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>
);

const StatCard = ({ label, value, change, bg }) => (
  <div style={{ background: bg, borderRadius: 14, padding: "20px 24px", flex: 1, minWidth: 180 }}>
    <div style={{ fontSize: 13, color: "rgba(0,0,0,.6)", fontWeight: 500, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6 }}>{value}</div>
    {change !== undefined && (
      <div style={{ fontSize: 12, fontWeight: 600, color: change > 0 ? C.accept : C.reject }}>
        {change > 0 ? "↗" : "↘"} {change > 0 ? "+" : ""}{change}% from last period
      </div>
    )}
  </div>
);

const Badge = ({ children, color = C.accept }) => {
  const bgs = { [C.accept]: C.green, [C.reject]: C.rose, [C.pending]: C.amber, [C.blueDark]: C.blue };
  return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, color, background: bgs[color] || "#F3F4F6", letterSpacing: ".02em", textTransform: "uppercase" }}>{children}</span>;
};

const Btn = ({ children, v = "primary", onClick, disabled, sz = "md", style: s }) => {
  const base = { border: "none", borderRadius: 8, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? .5 : 1 };
  const sizes = { sm: { padding: "5px 11px", fontSize: 11 }, md: { padding: "8px 16px", fontSize: 12 }, lg: { padding: "11px 22px", fontSize: 13 } };
  const vars = { primary: { background: C.blueDark, color: "#fff" }, secondary: { background: "#F3F4F6", color: C.text, border: `1px solid ${C.border}` }, ghost: { background: "transparent", color: C.text2 }, danger: { background: C.reject, color: "#fff" } };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[sz], ...vars[v], ...s }}>{children}</button>;
};

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
    {tabs.map(t => <button key={t} onClick={() => onChange(t)} style={{ padding: "9px 18px", border: "none", background: "transparent", fontSize: 12.5, fontWeight: active === t ? 600 : 400, color: active === t ? C.blueDark : C.text2, borderBottom: active === t ? `2px solid ${C.blueDark}` : "2px solid transparent", cursor: "pointer", transition: "all .12s" }}>{t}</button>)}
  </div>
);

const SearchInput = ({ value, onChange, placeholder = "Search..." }) => (
  <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><I n="search" s={14} c={C.text3} /></div>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 10px 8px 32px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12.5, color: C.text, outline: "none" }} />
  </div>
);

const Progress = ({ value, max = 100, color = C.blueDark, h = 4 }) => (
  <div style={{ background: "#F3F4F6", borderRadius: h, height: h, width: "100%" }}><div style={{ width: `${Math.min(value / max * 100, 100)}%`, height: "100%", background: color, borderRadius: h, transition: "width .4s ease" }} /></div>
);

const ScoreBar = ({ label, score, max, color = C.blueDark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
    <div style={{ width: 120, fontSize: 11, color: C.text2, fontWeight: 500 }}>{label}</div>
    <div style={{ flex: 1 }}><Progress value={score} max={max} color={color} h={6} /></div>
    <div style={{ width: 36, textAlign: "right", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: C.text }}>{score}/{max}</div>
  </div>
);

const Modal = ({ open, onClose, title, children, width = 600 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.25)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fi" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "85vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.1)" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.white, zIndex: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, padding: 2 }}><I n="x" s={18} /></button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
};

const Table = ({ cols, data, onRow, selectable, onSel }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>
        {selectable && <th style={{ width: 36, padding: "8px 10px", borderBottom: `1px solid ${C.border}` }} />}
        {cols.map((c, i) => <th key={i} style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: ".05em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}
      </tr></thead>
      <tbody>{data.map((r, ri) => (
        <tr key={ri} onClick={() => onRow?.(r)} style={{ cursor: onRow ? "pointer" : "default", transition: "background .1s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {selectable && <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.borderLight}` }}><input type="checkbox" checked={r.selected || false} onChange={() => onSel?.(r)} onClick={e => e.stopPropagation()} style={{ accentColor: C.blueDark, width: 15, height: 15, cursor: "pointer" }} /></td>}
          {cols.map((c, ci) => <td key={ci} style={{ padding: "10px 12px", fontSize: 12.5, borderBottom: `1px solid ${C.borderLight}`, whiteSpace: "nowrap" }}>{c.render ? c.render(r) : r[c.key]}</td>)}
        </tr>
      ))}</tbody>
    </table>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// CHARTS (Simplified Donut & Bar for space)
// ═══════════════════════════════════════════════════════════════════════
const Donut = ({ segs, size = 120, sw = 16, center }) => {
  const r = (size - sw) / 2, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const tot = segs.reduce((s, g) => s + g.v, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segs.map((s, i) => { const pct = tot > 0 ? s.v / tot : 0; const dash = pct * circ; const gap = circ - dash; const o = offset; offset += dash; return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth={sw} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-o} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />; })}
      {center && <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="700" fontFamily="DM Sans" fill={C.text}>{center}</text>}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════
const fmt = n => new Intl.NumberFormat("en-US").format(n);
const $ = n => `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)}`;
const dt = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) : "0";

// CSV parser
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_"));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return {
      firstName: obj.first_name || obj.firstname || obj.first || "",
      lastName: obj.last_name || obj.lastname || obj.last || "",
      email: obj.email || obj.email_address || "",
      company: obj.company || obj.company_name || obj.organization || "",
      title: obj.title || obj.job_title || obj.jobtitle || obj.position || "",
      industry: obj.industry || obj.sector || "",
      employeeCount: parseInt(obj.employee_count || obj.employees || obj.company_size || obj.size || "0") || 0,
      phone: obj.phone || obj.phone_number || "",
      linkedIn: obj.linkedin || obj.linkedin_url || "",
      vendor: obj.vendor || obj.source || obj.lead_source || "Direct",
    };
  }).filter(r => r.email && r.company);
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
const Dashboard = ({ leads }) => {
  const acc = leads.filter(l => l.status === "accepted");
  const rej = leads.filter(l => l.status === "rejected");
  const avg = leads.length > 0 ? (leads.reduce((s, l) => s + (l.totalScore || 0), 0) / leads.length).toFixed(1) : "—";
  
  return (
    <div className="fi">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Dashboard</h1>
        <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>Lead validation overview</p>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <StatCard label="Validated" value={fmt(leads.length)} bg={C.blue} />
        <StatCard label="Accepted" value={`${fmt(acc.length)} (${pct(acc.length, leads.length)}%)`} bg={C.purple} />
        <StatCard label="Avg Score" value={avg} bg={C.amber} />
        <StatCard label="Disputed" value={$(rej.length * 10)} bg={C.rose} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// VALIDATE LEADS
// ═══════════════════════════════════════════════════════════════════════
const Validate = ({ leads, setLeads }) => {
  const [tab, setTab] = useState("Batch Upload");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", company: "", title: "", industry: "SaaS", employeeCount: "1000" });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batch, setBatch] = useState(null);
  const [singleResult, setSingleResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const parsed = parseCSV(e.target.result);
      if (parsed.length === 0) return;
      setProcessing(true); setProgress(0);
      
      const iv = setInterval(() => setProgress(p => Math.min(p + 2, 95)), 100);
      
      // FIX 1: Map title and employeeCount to jobTitle and companySize for the backend payload
      const payload = parsed.map(p => ({
          ...p,
          jobTitle: p.title,
          companySize: p.employeeCount
      }));

      const result = await agentBatch(payload);
      
      clearInterval(iv); setProgress(100);
      if (result.results) {
        const newLeads = result.results.map((r, i) => ({
          id: `AV-${String(leads.length + i + 1).padStart(4, "0")}`,
          ...r.lead,
          scores: r.scores,
          totalScore: r.totalScore,
          status: r.decision === "ACCEPT" ? "accepted" : "rejected",
          decision: r.decision,
          reasoning: r.reasoning,
          agentSignature: r.agentSignature,
          teeProof: r.teeProof,
          validatedAt: r.timestamp || new Date().toISOString(),
          vendor: parsed[i]?.vendor || "Direct", 
          selected: false, pushed: false,
        }));
        setLeads(p => [...p, ...newLeads]);
        setBatch({ results: newLeads, meta: result.batchMeta });
      } else {
        alert("Batch processing failed. Is the agent running?");
      }
      setProcessing(false);
    };
    reader.readAsText(file);
  };

  const validateSingle = async () => {
    if (!form.email || !form.company) return;
    setValidating(true); setSingleResult(null);

    // FIX 2: Ensure jobTitle and companySize are sent in single payload as well
    const payload = { 
        ...form, 
        jobTitle: form.title, 
        companySize: parseInt(form.employeeCount) || 1000 
    };

    const result = await agentValidate(payload);
    
    if (!result.error && result.decision) {
      const nl = {
        id: `AV-${String(leads.length + 1).padStart(4, "0")}`,
        ...form, // Keep local form state for UI consistency
        scores: result.scores, totalScore: result.totalScore,
        status: result.decision === "ACCEPT" ? "accepted" : "rejected",
        decision: result.decision,
        reasoning: result.reasoning,
        agentSignature: result.agentSignature,
        teeProof: result.teeProof,
        validatedAt: result.timestamp || new Date().toISOString(),
        vendor: "Direct", selected: false, pushed: false,
      };
      setLeads(p => [...p, nl]); setSingleResult(nl);
    } else {
      setSingleResult({ error: result.error || "Agent not reachable." });
    }
    setValidating(false);
  };

  return (
    <div className="fi">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Validate Leads</h1>
        <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>Upload CSV or validate individual leads via your sovereign agent</p>
      </div>
      <Tabs tabs={["Batch Upload", "Single Lead"]} active={tab} onChange={setTab} />

      {tab === "Single Lead" ? (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[{ k: "firstName", l: "First Name" }, { k: "lastName", l: "Last Name" }, { k: "email", l: "Email *" }, { k: "company", l: "Company *" }, { k: "title", l: "Job Title" }, { k: "industry", l: "Industry" }, { k: "employeeCount", l: "Employees" }].map(f => (
              <div key={f.k}><label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={{ width: "100%", padding: "8px 10px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12.5, color: C.text, outline: "none" }} /></div>
            ))}
          </div>
          <Btn onClick={validateSingle} disabled={!form.email || !form.company || validating}>
            {validating ? "Validating..." : <><I n="shield" s={14} c="#fff" /> Validate with Agent</>}
          </Btn>
          {singleResult && !singleResult.error && <div style={{ marginTop: 16, padding: 14, background: singleResult.status === "accepted" ? C.green : C.rose, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: singleResult.status === "accepted" ? C.greenText : C.roseText }}>{singleResult.status === "accepted" ? "✓ Lead Accepted" : "✗ Lead Rejected"} — Score: {singleResult.totalScore}/100</div>
          </div>}
        </Card>
      ) : (
        <Card style={{ marginBottom: 14 }}>
            {!processing && !batch ? (
              <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "44px 24px", textAlign: "center", cursor: "pointer" }}>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                <I n="upload" s={32} c={C.text3} /><div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>Drop CSV here or click to upload</div>
                <div style={{ fontSize: 12, color: C.text2, marginTop: 4 }}>CSV with columns: first_name, last_name, email, company, title, industry, employee_count, vendor</div>
              </div>
            ) : processing ? (
              <div style={{ padding: "28px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Validating with Sovereign Agent...</div>
                <Progress value={progress} h={5} />
              </div>
            ) : null}
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ALL LEADS 
// ═══════════════════════════════════════════════════════════════════════
const AllLeads = ({ leads, setLeads, setSel }) => {
  const [search, setSearch] = useState("");
  const filtered = leads.filter(l => {
    if (search) { const s = search.toLowerCase(); return `${l.firstName} ${l.lastName}`.toLowerCase().includes(s) || l.company.toLowerCase().includes(s) || l.email.toLowerCase().includes(s); }
    return true;
  }).sort((a, b) => new Date(b.validatedAt) - new Date(a.validatedAt));

  return (
    <div className="fi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>All Leads</h1>
          <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>{fmt(leads.length)} total leads</p></div>
      </div>
      <div style={{ width: 240, marginBottom: 16 }}><SearchInput value={search} onChange={setSearch} placeholder="Search leads..." /></div>
      
      <Card style={{ padding: 0 }}>
        <Table cols={[
          { label: "ID", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.text3 }}>{r.id}</span> },
          { label: "Name", render: r => <span style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</span> },
          { label: "Email", render: r => <span style={{ fontSize: 11, color: C.text2 }}>{r.email}</span> },
          { label: "Company", key: "company" },
          { label: "Score", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, color: (r.totalScore || 0) >= 80 ? C.accept : C.reject }}>{r.totalScore || "—"}</span> },
          { label: "Status", render: r => <Badge color={r.status === "accepted" ? C.accept : C.reject}>{r.status}</Badge> },
        ]} data={filtered} onRow={setSel} />
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// LEAD DETAIL MODAL (FIXED)
// ═══════════════════════════════════════════════════════════════════════
const LeadDetail = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <Modal open={!!lead} onClose={onClose} title="Lead Intelligence Report" width={720}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{lead.firstName} {lead.lastName || lead.email.split('@')[0]}</div>
          <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>{lead.title || lead.jobTitle || 'No Title'} at {lead.company}</div>
        </div>
        <div style={{ textAlign: "right" }}>
           <Badge color={lead.status === "accepted" ? C.accept : C.reject}>{lead.status}</Badge>
           <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: lead.status === "accepted" ? C.greenText : C.roseText }}>{lead.totalScore || 0}/100</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[{ l: "Email", v: lead.email }, { l: "Company", v: lead.company }, { l: "Industry", v: lead.industry }, { l: "Employees", v: lead.employeeCount || lead.companySize ? fmt(lead.employeeCount || lead.companySize) : "—" }].map((x, i) => (
          <div key={i} style={{ padding: "10px 12px", background: "#F9FAFB", borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 10, color: C.text3, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{x.l}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{x.v || "—"}</div>
          </div>
        ))}
      </div>

      {/* AI Evaluation & Reasoning Section */}
      {lead.scores && lead.reasoning && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
             <I n="search" s={16} /> Evaluation & Reasoning
          </div>
          
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
            {Object.entries(lead.scores).map(([key, score]) => {
              // Standardizing max scores based on typical lead evaluation models
              const maxScores = { email: 15, company: 15, contact: 20, icp: 20, aiDecisionMaker: 20, dm: 20, aiBudget: 10, budget: 10 }; 
              const max = maxScores[key] || 20;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // formats camelCase to Title Case
              const explanation = lead.reasoning[key];
              
              return (
                <div key={key} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.borderLight}` }}>
                  <ScoreBar label={label} score={score || 0} max={max} color={(score || 0) / max >= .7 ? C.accept : C.reject} />
                  {explanation && (
                    <div style={{ fontSize: 12, color: C.text2, marginTop: 6, lineHeight: 1.5, marginLeft: 128, background: "#F9FAFB", padding: "8px 12px", borderRadius: 6, borderLeft: `3px solid ${(score || 0) / max >= .7 ? C.accept : C.reject}` }}>
                      {explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {lead.reasoning.overall && (
              <div style={{ marginTop: 16, padding: 12, background: lead.status === "accepted" ? C.green : C.rose, borderRadius: 8, fontSize: 12.5, color: lead.status === "accepted" ? C.greenText : C.roseText, display: "flex", gap: 8 }}>
                <div style={{ marginTop: 2 }}><I n="info" s={14} /></div>
                <div><strong>Final Decision:</strong> {lead.reasoning.overall}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cryptographic TEE Proof Section */}
      {lead.teeProof && (
        <div>
           <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <I n="lock" s={16} /> Cryptographic Attestation
           </div>
           <div style={{ background: "#1A1D26", color: "#E5E7EB", borderRadius: 10, padding: 16, fontFamily: "'JetBrains Mono'", fontSize: 11, lineHeight: 1.8, wordBreak: "break-all", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ color: "#9CA3AF", marginBottom: 8 }}>// Sovereign Agent TEE Proof</div>
            
            {lead.teeProof.platform && <div><span style={{ color: "#60A5FA" }}>platform:</span> {lead.teeProof.platform}</div>}
            {lead.teeProof.appId && <div><span style={{ color: "#60A5FA" }}>app_id:</span> {lead.teeProof.appId}</div>}
            {lead.agentSignature && <div><span style={{ color: "#FBBF24" }}>agent_signature:</span> {lead.agentSignature}</div>}
            
            {lead.teeProof.eigenaiProofs?.decisionMaker && (
                <div style={{ marginTop: 8 }}>
                    <div style={{ color: "#A78BFA" }}>proof_fingerprint (decisionMaker):</div>
                    <div style={{ marginLeft: 16, color: "#D1D5DB" }}>{lead.teeProof.eigenaiProofs.decisionMaker.fingerprint}</div>
                </div>
            )}
            
            <div style={{ marginTop: 12, color: lead.teeProof.runningInTEE ? "#34D399" : "#FBBF24", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
               <I n={lead.teeProof.runningInTEE ? "check" : "info"} s={14} /> 
               {lead.teeProof.runningInTEE ? "Verified in EigenCompute TEE Enclave" : "Running in Standard Mode"}
            </div>
           </div>
        </div>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// NAV + APP
// ═══════════════════════════════════════════════════════════════════════
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "validate", label: "Validate", icon: "shield" },
  { key: "leads", label: "All Leads", icon: "users" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('aven-leads');
    return saved ? JSON.parse(saved) : [];
  });
  const [sel, setSel] = useState(null);
  const [agentUp, setAgentUp] = useState(null);

  useEffect(() => { agentStatus().then(s => setAgentUp(!s.error)); }, []);
  
  useEffect(() => {
    localStorage.setItem('aven-leads', JSON.stringify(leads));
  }, [leads]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <div style={{ width: 210, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "20px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-.03em" }}>Aven</div>
        </div>
        <div style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setPage(n.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 11px",
              border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: page === n.key ? 600 : 400,
              background: page === n.key ? C.blue : "transparent",
              color: page === n.key ? C.blueDark : C.text2, transition: "all .12s", marginBottom: 1,
            }}><I n={n.icon} s={16} c={page === n.key ? C.blueDark : C.text3} />{n.label}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, marginLeft: 210, padding: "24px 28px", minHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard leads={leads} />}
        {page === "validate" && <Validate leads={leads} setLeads={setLeads} />}
        {page === "leads" && <AllLeads leads={leads} setLeads={setLeads} setSel={setSel} />}
      </div>

      <LeadDetail lead={sel} onClose={() => setSel(null)} />
    </div>
  );
}
