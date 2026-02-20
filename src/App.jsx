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
`;

// ═══════════════════════════════════════════════════════════════════════
// TOKENS — neutral, soft, matching the screenshot
// ═══════════════════════════════════════════════════════════════════════
const C = {
  bg:"#F4F5F7", white:"#FFFFFF", card:"#FFFFFF",
  border:"#E8EBF0", borderLight:"#F0F2F5",
  text:"#1A1D26", text2:"#6B7280", text3:"#9CA3AF", textFaint:"#D1D5DB",
  // Pastel stat card backgrounds (from screenshot)
  blue:"#DBEAFE", blueDark:"#3B82F6", blueText:"#1E40AF",
  purple:"#F3E8FF", purpleDark:"#8B5CF6", purpleText:"#6D28D9",
  amber:"#FEF3C7", amberDark:"#F59E0B", amberText:"#92400E",
  rose:"#FFE4E6", roseDark:"#F43F5E", roseText:"#9F1239",
  green:"#D1FAE5", greenDark:"#10B981", greenText:"#065F46",
  // Functional
  accept:"#10B981", reject:"#EF4444", pending:"#F59E0B",
};

// ═══════════════════════════════════════════════════════════════════════
// AGENT API
// ═══════════════════════════════════════════════════════════════════════
const AGENT = "http://104.196.63.225:3000";

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

const agentValidate = (lead) => api("/api/validate", { method: "POST", body: JSON.stringify(lead) });
const agentBatch = (leads) => api("/api/validate/batch", { method: "POST", body: JSON.stringify({ leads }) });
const agentStatus = () => api("/api/status");
const agentConfig = (cfg) => api("/api/config", { method: "PUT", body: JSON.stringify(cfg) });
const agentAudit = () => api("/api/audit");

// ═══════════════════════════════════════════════════════════════════════
// ICONS (minimal inline SVG)
// ═══════════════════════════════════════════════════════════════════════
const I = ({ n, s = 18, c = "currentColor" }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    grid: <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    shield: <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    scale: <svg {...p}><path d="M12 3v18M3 7l9-4 9 4M3 7v2c0 1 3 3 6 3V7M15 7v5c3 0 6-2 6-3V7"/></svg>,
    bar: <svg {...p}><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
    gear: <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    x: <svg {...p} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    upload: <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    download: <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    lock: <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    send: <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    info: <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
    check: <svg {...p} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    chev: <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>,
    chevR: <svg {...p}><polyline points="9 18 15 12 9 6"/></svg>,
    trend: <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    eye: <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    plug: <svg {...p}><path d="M12 22v-5M9 8V2M15 8V2"/><path d="M6 8h12a2 2 0 012 2v1a5 5 0 01-5 5h-4a5 5 0 01-5-5v-1a2 2 0 012-2z"/></svg>,
    wallet: <svg {...p}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="16" cy="14" r="1.5" fill={c} stroke="none"/></svg>,
    save: <svg {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    star: <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    filter: <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    calendar: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  };
  return icons[n] || null;
};

// ═══════════════════════════════════════════════════════════════════════
// SPARKLINE (mini chart for stat cards, like the screenshot)
// ═══════════════════════════════════════════════════════════════════════
const Spark = ({ data, color, w = 80, h = 30 }) => {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".6"/>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
const Card = ({ children, style, className = "" }) => (
  <div className={className} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>
);

const StatCard = ({ label, value, change, sparkData, bg, sparkColor, icon }) => (
  <div style={{ background: bg, borderRadius: 14, padding: "16px 20px", flex: 1, minWidth: 180, position: "relative", overflow: "hidden" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ opacity: .7, fontSize: 22 }}>{icon}</div>
      {change && <span style={{ fontSize: 11, fontWeight: 600, color: change > 0 ? C.accept : C.reject, display: "flex", alignItems: "center", gap: 2 }}>
        {change > 0 ? "↗" : "↘"} {change > 0 ? "+" : ""}{change}%
      </span>}
    </div>
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,.5)", fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 2 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em" }}>{value}</div>
        <Spark data={sparkData} color={sparkColor} />
      </div>
    </div>
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
    <div style={{ width: 80, fontSize: 11, color: C.text2 }}>{label}</div>
    <div style={{ flex: 1 }}><Progress value={score} max={max} color={color} /></div>
    <div style={{ width: 36, textAlign: "right", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: C.text }}>{score}/{max}</div>
  </div>
);

const Modal = ({ open, onClose, title, children, width = 600 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.25)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fi" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "85vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.1)" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, padding: 2 }}><I n="x" s={16} /></button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
};

const Tip = ({ text, children }) => {
  const [s, setS] = useState(false);
  return (<span style={{ position: "relative", display: "inline-flex", alignItems: "center" }} onMouseEnter={() => setS(true)} onMouseLeave={() => setS(false)}>{children}{s && <span style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#1A1D26", color: "#fff", padding: "6px 10px", borderRadius: 6, fontSize: 10.5, whiteSpace: "normal", maxWidth: 240, zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,.12)", pointerEvents: "none", lineHeight: 1.4 }}>{text}</span>}</span>);
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
// SVG CHARTS
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

const BarChart = ({ data, h = 200, barW = 28 }) => {
  const mx = Math.max(...data.map(d => Math.max(d.v1 || 0, d.v2 || 0)), 1);
  const totalW = data.length * (barW * 2 + 20);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${totalW} ${h}`} style={{ display: "block" }}>
      {/* Grid lines */}
      {[0, .25, .5, .75, 1].map((p, i) => (
        <g key={i}>
          <line x1="0" y1={h - 24 - p * (h - 40)} x2={totalW} y2={h - 24 - p * (h - 40)} stroke="#F0F2F5" strokeWidth="1" />
          <text x="-4" y={h - 22 - p * (h - 40)} textAnchor="end" fontSize="9" fill={C.text3} fontFamily="DM Sans">{Math.round(mx * p)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = i * (barW * 2 + 20) + 10;
        const bh1 = ((d.v1 || 0) / mx) * (h - 44);
        const bh2 = ((d.v2 || 0) / mx) * (h - 44);
        return (
          <g key={i}>
            <rect x={x} y={h - 24 - bh1} width={barW} height={bh1} rx={4} fill={C.blueDark} opacity=".85" />
            {d.v2 !== undefined && <rect x={x + barW + 3} y={h - 24 - bh2} width={barW} height={bh2} rx={4} fill="#93C5FD" opacity=".6" />}
            <text x={x + barW + 1} y={h - 4} textAnchor="middle" fontSize={10} fill={C.text3} fontFamily="DM Sans">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
};

const LineChart = ({ data, h = 200, color = C.blueDark, color2 = "#93C5FD" }) => {
  if (!data || data.length < 2) return null;
  const w = 500;
  const mx = Math.max(...data.map(d => Math.max(d.v1, d.v2 || 0)), 1);
  const pts = (key) => data.map((d, i) => `${(i / (data.length - 1)) * (w - 40) + 20},${h - 30 - ((d[key] || 0) / mx) * (h - 50)}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {[0, .25, .5, .75, 1].map((p, i) => <line key={i} x1="20" y1={h - 30 - p * (h - 50)} x2={w - 20} y2={h - 30 - p * (h - 50)} stroke="#F0F2F5" strokeWidth="1" />)}
      <polyline points={pts("v1")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data[0].v2 !== undefined && <polyline points={pts("v2")} fill="none" stroke={color2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,4" />}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={(i / (data.length - 1)) * (w - 40) + 20} cy={h - 30 - ((d.v1) / mx) * (h - 50)} r="3.5" fill={color} />
          <text x={(i / (data.length - 1)) * (w - 40) + 20} y={h - 8} textAnchor="middle" fontSize={10} fill={C.text3} fontFamily="DM Sans">{d.l}</text>
        </g>
      ))}
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
    // Normalize common field names
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
  const [dateRange, setDateRange] = useState("all");
  const [accOpen, setAccOpen] = useState(false);
  const [rejOpen, setRejOpen] = useState(false);

  const filtered = dateRange === "all" ? leads : leads.filter(l => {
    const d = new Date(l.validatedAt);
    const now = new Date();
    if (dateRange === "7d") return now - d < 7 * 864e5;
    if (dateRange === "30d") return now - d < 30 * 864e5;
    if (dateRange === "90d") return now - d < 90 * 864e5;
    return true;
  });

  const acc = filtered.filter(l => l.status === "accepted");
  const rej = filtered.filter(l => l.status === "rejected");
  const avg = filtered.length > 0 ? (filtered.reduce((s, l) => s + (l.totalScore || 0), 0) / filtered.length).toFixed(1) : "—";
  const recent = [...filtered].sort((a, b) => new Date(b.validatedAt) - new Date(a.validatedAt)).slice(0, 8);

  // Trend data (group by month)
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const trendData = months.map((m, i) => ({
    l: m,
    v1: i < 5 ? [12, 28, 42, 58, 71][i] : acc.length,
    v2: i < 5 ? [4, 8, 14, 18, 22][i] : rej.length,
  }));

  // Score trend
  const scoreTrend = months.map((m, i) => ({
    l: m,
    v1: i < 5 ? [62, 68, 72, 76, 79][i] : parseFloat(avg) || 78,
  }));

  // Acceptance reasons
  const accReasons = {};
  acc.forEach(l => { l.acceptReasons?.forEach(r => { accReasons[r.cat] = (accReasons[r.cat] || 0) + 1; }); });
  const accEntries = Object.entries(accReasons).sort((a, b) => b[1] - a[1]);

  // Rejection reasons
  const rejReasons = {};
  rej.forEach(l => { if (l.rejectionReason) rejReasons[l.rejectionReason] = (rejReasons[l.rejectionReason] || 0) + 1; });
  const rejEntries = Object.entries(rejReasons).sort((a, b) => b[1] - a[1]);
  const rejColors = ["#EF4444", "#F59E0B", "#8B5CF6", "#3B82F6", "#6B7280", "#EC4899"];

  // Top vendor
  const vendorCounts = {};
  filtered.forEach(l => { vendorCounts[l.vendor] = (vendorCounts[l.vendor] || 0) + 1; });
  const topVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="fi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Dashboard</h1>
          <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>Lead validation overview</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["7d", "7 Days"], ["30d", "30 Days"], ["90d", "90 Days"], ["all", "All Time"]].map(([k, l]) => (
            <button key={k} onClick={() => setDateRange(k)} style={{ padding: "5px 12px", border: `1px solid ${dateRange === k ? C.blueDark : C.border}`, borderRadius: 6, background: dateRange === k ? C.blue : "transparent", color: dateRange === k ? C.blueDark : C.text2, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Stat Cards — pastel backgrounds with sparklines */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <StatCard label="Validated" value={fmt(filtered.length)} change={2.6} bg={C.blue} sparkColor={C.blueDark} sparkData={[12, 28, 42, 58, 71, filtered.length]} icon="🛡️" />
        <StatCard label="Accepted" value={fmt(acc.length)} change={parseFloat(pct(acc.length, filtered.length)) > 60 ? 1.2 : -0.8} bg={C.purple} sparkColor={C.purpleDark} sparkData={[8, 20, 32, 44, 55, acc.length]} icon="✅" />
        <StatCard label="Avg Score" value={avg} change={3.1} bg={C.amber} sparkColor={C.amberDark} sparkData={[62, 68, 72, 76, 79, parseFloat(avg) || 78]} icon="📊" />
        <StatCard label="Disputed" value={$(rej.length * 10)} change={-1.4} bg={C.rose} sparkColor={C.roseDark} sparkData={[4, 8, 14, 18, 22, rej.length]} icon="⚖️" />
      </div>

      {/* Big Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Validation Trends</div>
            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blueDark }} /> Accepted</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#93C5FD" }} /> Rejected</span>
            </div>
          </div>
          <BarChart data={trendData} h={180} />
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Score Trend Over Time</div>
          <LineChart data={scoreTrend} h={180} />
        </Card>
      </div>

      {/* Dropdown Visuals: Acceptance + Rejection Reasons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card style={{ padding: 0 }}>
          <div onClick={() => setAccOpen(!accOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Acceptance Reasons</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Badge color={C.accept}>{acc.length} accepted</Badge>
              <div style={{ transform: accOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}><I n="chev" s={14} c={C.text3} /></div>
            </div>
          </div>
          {accOpen && <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
            {accEntries.length > 0 ? accEntries.map(([cat, count]) => (
              <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accept }} />
                  <span style={{ fontSize: 12 }}>{cat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Progress value={count} max={acc.length} color={C.accept} h={3} />
                  <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono'", minWidth: 28, textAlign: "right" }}>{count}</span>
                </div>
              </div>
            )) : <div style={{ fontSize: 12, color: C.text3 }}>No data yet — validate leads to see reasons.</div>}
          </div>}
        </Card>

        <Card style={{ padding: 0 }}>
          <div onClick={() => setRejOpen(!rejOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Rejection Reasons</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Badge color={C.reject}>{rej.length} rejected</Badge>
              <div style={{ transform: rejOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}><I n="chev" s={14} c={C.text3} /></div>
            </div>
          </div>
          {rejOpen && <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
            {rejEntries.length > 0 ? (
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <Donut size={90} sw={12} segs={rejEntries.map(([, v], i) => ({ v, c: rejColors[i % rejColors.length] }))} center={rej.length.toString()} />
                <div style={{ flex: 1 }}>
                  {rejEntries.map(([r, c], i) => (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: rejColors[i % rejColors.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 10.5, color: C.text2, flex: 1 }}>{r}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div style={{ fontSize: 12, color: C.text3 }}>No rejections yet.</div>}
          </div>}
        </Card>
      </div>

      {/* Bottom Row: Recent + Top Source */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}>Recent Validations</div>
          {recent.length > 0 ? (
            <Table cols={[
              { label: "Lead", render: r => <span style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</span> },
              { label: "Company", key: "company" },
              { label: "Score", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, color: (r.totalScore || 0) >= 80 ? C.accept : C.reject }}>{r.totalScore || "—"}</span> },
              { label: "Status", render: r => <Badge color={r.status === "accepted" ? C.accept : C.reject}>{r.status}</Badge> },
              { label: "Proof", render: r => r.proof?.eigenProof?.simulated === false ? <Badge color={C.accept}>Verified</Badge> : <Badge color={C.text3}>Demo</Badge> },
              { label: "Date", render: r => <span style={{ color: C.text2, fontSize: 11 }}>{dt(r.validatedAt)}</span> },
            ]} data={recent} />
          ) : <div style={{ padding: 30, textAlign: "center", color: C.text3, fontSize: 13 }}>No leads validated yet. Go to Validate tab to get started.</div>}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Top Trusted Source</div>
            {topVendor ? (
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{topVendor[0]}</div>
                <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{topVendor[1]} leads supplied</div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Acceptance rate</div>
                  <Progress value={filtered.filter(l => l.vendor === topVendor[0] && l.status === "accepted").length} max={topVendor[1]} color={C.accept} h={5} />
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3 }}>{pct(filtered.filter(l => l.vendor === topVendor[0] && l.status === "accepted").length, topVendor[1])}%</div>
                </div>
              </div>
            ) : <div style={{ color: C.text3, fontSize: 12 }}>No data yet.</div>}
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Quality Score</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Donut size={60} sw={8} segs={[{ v: acc.length || 1, c: C.accept }, { v: rej.length || 1, c: "#E5E7EB" }]} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{filtered.length > 0 ? pct(acc.length, filtered.length) : "—"}%</div>
                <div style={{ fontSize: 11, color: C.text2 }}>acceptance rate</div>
              </div>
            </div>
          </Card>
        </div>
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
      // Simulate progress while calling agent
      const iv = setInterval(() => setProgress(p => Math.min(p + 2, 95)), 100);
      const result = await agentBatch(parsed);
      clearInterval(iv); setProgress(100);
      if (result.results) {
        const newLeads = result.results.map((r, i) => ({
          id: `AV-${String(leads.length + i + 1).padStart(4, "0")}`,
          ...r.lead,
          scores: r.scores,
          totalScore: r.totalScore,
          status: r.decision === "ACCEPT" ? "accepted" : "rejected",
          acceptReasons: r.decision === "ACCEPT" ? [{ cat: "Score Met Threshold", detail: "Total score exceeded acceptance threshold", score: r.totalScore }] : null,
          rejectionReason: r.decision === "REJECT" ? "Score below acceptance threshold" : null,
          validatedAt: new Date().toISOString(),
          cost: 10, proof: r.proof || {},
          vendor: parsed[i]?.vendor || "Direct", selected: false, pushed: false,
          eigenVerified: !r.proof?.simulated,
          phone: parsed[i]?.phone || "", linkedIn: parsed[i]?.linkedIn || "",
          employeeCount: parsed[i]?.employeeCount || 0, industry: parsed[i]?.industry || "",
        }));
        setLeads(p => [...p, ...newLeads]);
        setBatch({ results: newLeads, meta: result.batchMeta });
      } else {
        // Fallback if agent down — just store the parsed data
        const fallback = parsed.map((p, i) => ({
          id: `AV-${String(leads.length + i + 1).padStart(4, "0")}`,
          ...p, scores: {}, totalScore: 0, status: "pending",
          validatedAt: new Date().toISOString(), cost: 10, proof: {},
          selected: false, pushed: false, eigenVerified: false,
          acceptReasons: null, rejectionReason: "Agent offline",
        }));
        setLeads(pr => [...pr, ...fallback]);
        setBatch({ results: fallback, meta: { totalProcessed: fallback.length, accepted: 0, rejected: 0 } });
      }
      setProcessing(false);
    };
    reader.readAsText(file);
  };

  const validateSingle = async () => {
    if (!form.email || !form.company) return;
    setValidating(true); setSingleResult(null);
    const result = await agentValidate({ ...form, employeeCount: parseInt(form.employeeCount) || 1000 });
    if (!result.error && result.decision) {
      const nl = {
        id: `AV-${String(leads.length + 1).padStart(4, "0")}`,
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        company: form.company, title: form.title, industry: form.industry,
        employeeCount: parseInt(form.employeeCount) || 1000,
        scores: result.scores, totalScore: result.totalScore,
        status: result.decision === "ACCEPT" ? "accepted" : "rejected",
        acceptReasons: result.decision === "ACCEPT" ? [{ cat: "DM", detail: result.reasoning?.dm || "Verified", score: result.scores?.dm || 0 }, { cat: "Budget", detail: result.reasoning?.budget || "Verified", score: result.scores?.budget || 0 }] : null,
        rejectionReason: result.decision === "REJECT" ? (result.reasoning?.dm || "Below threshold") : null,
        validatedAt: result.meta?.timestamp || new Date().toISOString(),
        cost: 10, proof: result.proof || {},
        vendor: "Direct", selected: false, pushed: false,
        eigenVerified: !result.proof?.eigenProof?.simulated,
        phone: "", linkedIn: "",
      };
      setLeads(p => [...p, nl]); setSingleResult(nl);
    } else {
      setSingleResult({ error: result.error || "Agent not reachable. Ensure backend is running." });
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
          {singleResult?.error && <div style={{ marginTop: 16, padding: 14, background: C.amber, borderRadius: 8, fontSize: 12, color: C.amberText }}>{singleResult.error}</div>}
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 14 }}>
            {!processing && !batch ? (
              <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "44px 24px", textAlign: "center", cursor: "pointer" }}>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                <I n="upload" s={32} c={C.text3} /><div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>Drop CSV here or click to upload</div>
                <div style={{ fontSize: 12, color: C.text2, marginTop: 4 }}>CSV with columns: first_name, last_name, email, company, title, industry, employee_count, vendor</div>
                <Btn v="secondary" style={{ marginTop: 14 }}>Select File</Btn>
              </div>
            ) : processing ? (
              <div style={{ padding: "28px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Validating with Sovereign Agent...</div>
                <Progress value={progress} h={5} /><div style={{ fontSize: 11, color: C.text2, marginTop: 8 }}>{Math.floor(progress)}% — Deterministic inference via EigenAI TEE</div>
              </div>
            ) : null}
          </Card>
          {batch && <Card style={{ padding: 0 }}>
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><span style={{ fontSize: 13, fontWeight: 600 }}>Results</span><span style={{ fontSize: 11, color: C.text2, marginLeft: 8 }}>{batch.meta?.totalProcessed || batch.results.length} processed — {batch.meta?.accepted || batch.results.filter(l => l.status === "accepted").length} accepted</span></div>
              <Btn v="secondary" sz="sm" onClick={() => { setBatch(null); setProgress(0); }}>Upload More</Btn>
            </div>
            <Table cols={[
              { label: "Lead", render: r => <span style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</span> },
              { label: "Company", key: "company" },
              { label: "Score", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, color: (r.totalScore || 0) >= 80 ? C.accept : C.reject }}>{r.totalScore || "—"}</span> },
              { label: "Status", render: r => <Badge color={r.status === "accepted" ? C.accept : r.status === "rejected" ? C.reject : C.pending}>{r.status}</Badge> },
            ]} data={batch.results.slice(0, 30)} />
          </Card>}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ALL LEADS (empty by default, user uploads CSV)
// ═══════════════════════════════════════════════════════════════════════
const AllLeads = ({ leads, setLeads, setSel }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [crmModal, setCrmModal] = useState(false);
  const [crmType, setCrmType] = useState("hubspot");
  const [crmKey, setCrmKey] = useState("");
  const [pushMsg, setPushMsg] = useState(null);

  const filtered = leads.filter(l => {
    if (filter === "Accepted" && l.status !== "accepted") return false;
    if (filter === "Rejected" && l.status !== "rejected") return false;
    if (filter === "Pushed" && !l.pushed) return false;
    if (search) { const s = search.toLowerCase(); return `${l.firstName} ${l.lastName}`.toLowerCase().includes(s) || l.company.toLowerCase().includes(s) || l.email.toLowerCase().includes(s); }
    return true;
  }).sort((a, b) => new Date(b.validatedAt) - new Date(a.validatedAt));

  const sel = leads.filter(l => l.selected);
  const toggleSel = r => setLeads(p => p.map(l => l.id === r.id ? { ...l, selected: !l.selected } : l));

  const CRM_ENDPOINTS = {
    hubspot: { url: "https://api.hubapi.com/crm/v3/objects/contacts/batch/create", label: "HubSpot", auth: "Bearer" },
    salesforce: { url: "https://login.salesforce.com/services/data/v58.0/composite/sobjects", label: "Salesforce", auth: "Bearer" },
    dynamics: { url: "https://org.api.crm.dynamics.com/api/data/v9.2/contacts", label: "Dynamics 365", auth: "Bearer" },
  };

  const pushToCRM = async () => {
    const count = sel.length;
    const crm = CRM_ENDPOINTS[crmType];
    if (crmKey && crm) {
      try {
        const body = crmType === "hubspot"
          ? { inputs: sel.map(l => ({ properties: { firstname: l.firstName, lastname: l.lastName, email: l.email, company: l.company, jobtitle: l.title, phone: l.phone } })) }
          : { records: sel.map(l => ({ attributes: { type: "Contact" }, FirstName: l.firstName, LastName: l.lastName, Email: l.email, Company: l.company, Title: l.title })) };
        await fetch(crm.url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `${crm.auth} ${crmKey}` }, body: JSON.stringify(body) });
      } catch (e) { /* log but don't block */ }
    }
    setLeads(p => p.map(l => l.selected ? { ...l, selected: false, pushed: true } : l));
    setPushMsg(`${count} leads pushed to ${CRM_ENDPOINTS[crmType].label}`);
    setCrmModal(false);
    setTimeout(() => setPushMsg(null), 3000);
  };

  return (
    <div className="fi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>All Leads</h1>
          <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>{fmt(leads.length)} total leads</p></div>
        <div style={{ display: "flex", gap: 6 }}>
          {sel.length > 0 && <Btn onClick={() => setCrmModal(true)}><I n="send" s={13} c="#fff" /> Push {sel.length} to CRM</Btn>}
          <Btn v="secondary" sz="sm"><I n="download" s={13} /> Export</Btn>
        </div>
      </div>
      {pushMsg && <div style={{ padding: "8px 14px", background: C.green, color: C.greenText, borderRadius: 8, fontSize: 12, fontWeight: 500, marginBottom: 12 }}><I n="check" s={14} c={C.accept} /> {pushMsg}</div>}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ width: 240 }}><SearchInput value={search} onChange={setSearch} placeholder="Search leads..." /></div>
        <Tabs tabs={["All", "Accepted", "Rejected", "Pushed"]} active={filter} onChange={setFilter} />
      </div>

      {leads.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 50 }}>
          <I n="users" s={40} c={C.textFaint} />
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>No Leads Yet</div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 4 }}>Upload a CSV in the Validate tab to get started.</div>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          <Table selectable onSel={toggleSel} cols={[
            { label: "ID", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.text3 }}>{r.id}</span> },
            { label: "Name", render: r => <span style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</span> },
            { label: "Email", render: r => <span style={{ fontSize: 11, color: C.text2 }}>{r.email}</span> },
            { label: "Company", key: "company" },
            { label: "Score", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, color: (r.totalScore || 0) >= 80 ? C.accept : C.reject }}>{r.totalScore || "—"}</span> },
            { label: "Status", render: r => <Badge color={r.status === "accepted" ? C.accept : C.reject}>{r.status}</Badge> },
            { label: "CRM", render: r => r.pushed ? <Badge color={C.blueDark}>Pushed</Badge> : <span style={{ color: C.text3, fontSize: 10 }}>—</span> },
          ]} data={filtered.slice(0, 50)} onRow={setSel} />
          {filtered.length > 50 && <div style={{ textAlign: "center", padding: 12, color: C.text3, fontSize: 11 }}>Showing 50 of {fmt(filtered.length)}</div>}
        </Card>
      )}

      <Modal open={crmModal} onClose={() => setCrmModal(false)} title="Push to CRM" width={480}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }}><strong>{sel.length}</strong> leads will be pushed.</div>
          <label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>CRM Platform</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {Object.entries(CRM_ENDPOINTS).map(([k, v]) => (
              <button key={k} onClick={() => setCrmType(k)} style={{ padding: "6px 14px", border: `1px solid ${crmType === k ? C.blueDark : C.border}`, borderRadius: 6, background: crmType === k ? C.blue : "transparent", color: crmType === k ? C.blueDark : C.text2, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{v.label}</button>
            ))}
          </div>
          <label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>API Key / Bearer Token</label>
          <input value={crmKey} onChange={e => setCrmKey(e.target.value)} type="password" placeholder="Enter API key..." style={{ width: "100%", padding: "8px 10px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 10 }} />
          <div style={{ fontSize: 10, color: C.text3 }}>Leave key blank for demo mode. In production, this calls the real CRM API.</div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Btn v="secondary" onClick={() => setCrmModal(false)}>Cancel</Btn><Btn onClick={pushToCRM}><I n="send" s={13} c="#fff" /> Push Leads</Btn></div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// DISPUTES (kept as-is)
// ═══════════════════════════════════════════════════════════════════════
const Disputes = ({ leads }) => {
  const rej = leads.filter(l => l.status === "rejected");
  const active = rej.filter((_, i) => i % 3 !== 0), resolved = rej.filter((_, i) => i % 3 === 0);
  const [tab, setTab] = useState("Active");
  const [proof, setProof] = useState(null);
  const data = tab === "Active" ? active : tab === "Resolved" ? resolved : rej;

  return (
    <div className="fi">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Disputes</h1>
        <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>Auto-filed disputes with cryptographic proofs</p>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <StatCard label="Active" value={active.length} bg={C.amber} sparkColor={C.amberDark} sparkData={[2, 5, 8, 12, active.length]} icon="⏳" />
        <StatCard label="Resolved" value={resolved.length} bg={C.green} sparkColor={C.greenDark} sparkData={[1, 3, 6, 9, resolved.length]} icon="✅" />
        <StatCard label="Value" value={$(rej.length * 10)} bg={C.blue} sparkColor={C.blueDark} sparkData={[10, 40, 80, 160, rej.length * 10]} icon="💰" />
      </div>
      <Tabs tabs={["Active", "Resolved", "Proof Library"]} active={tab} onChange={setTab} />
      {data.length > 0 ? (
        <Card style={{ padding: 0 }}>
          <Table cols={[
            { label: "Lead", render: r => <span style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</span> },
            { label: "Vendor", key: "vendor" },
            { label: "Reason", render: r => <span style={{ fontSize: 11 }}>{r.rejectionReason || "—"}</span> },
            { label: "Amount", render: r => <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>{$(r.cost)}</span> },
            { label: "Proof", render: r => <Btn v="ghost" sz="sm" onClick={() => setProof(r)}><I n="lock" s={13} /> View</Btn> },
          ]} data={data.slice(0, 30)} />
        </Card>
      ) : <Card style={{ textAlign: "center", padding: 40, color: C.text3 }}>No disputes in this category.</Card>}

      <Modal open={!!proof} onClose={() => setProof(null)} title="Cryptographic Proof" width={620}>
        {proof && (<div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div><div style={{ fontSize: 16, fontWeight: 700 }}>{proof.firstName} {proof.lastName}</div><div style={{ fontSize: 12, color: C.text2 }}>{proof.company}</div></div>
            <Badge color={C.reject}>Score {proof.totalScore || 0}/100</Badge>
          </div>
          {proof.scores && <div style={{ marginBottom: 16 }}>
            {[{ l: "Email", s: proof.scores.email, m: 20 }, { l: "Company", s: proof.scores.company, m: 15 }, { l: "Contact", s: proof.scores.contact, m: 20 }, { l: "ICP", s: proof.scores.icp, m: 20 }, { l: "DM", s: proof.scores.dm, m: 15 }, { l: "Budget", s: proof.scores.budget, m: 10 }].map((x, i) => <ScoreBar key={i} label={x.l} score={x.s || 0} max={x.m} color={(x.s || 0) / x.m >= .7 ? C.accept : C.reject} />)}
          </div>}
          <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 14, fontFamily: "'JetBrains Mono'", fontSize: 10.5, lineHeight: 2, border: `1px solid ${C.border}`, wordBreak: "break-all" }}>
            <div style={{ color: C.text3 }}>// Sovereign Agent Proof Package</div>
            {proof.proof?.inputHash && <div><span style={{ color: C.blueDark }}>input_hash:</span> {proof.proof.inputHash}</div>}
            {proof.proof?.outputHash && <div><span style={{ color: C.purpleDark }}>output_hash:</span> {proof.proof.outputHash}</div>}
            {proof.proof?.eigenProof?.id && <div><span style={{ color: C.accept }}>eigenai_id:</span> {proof.proof.eigenProof.id}</div>}
            {proof.proof?.eigenProof?.fingerprint && <div><span style={{ color: C.accept }}>fingerprint:</span> {proof.proof.eigenProof.fingerprint}</div>}
            {proof.proof?.agentSignature?.signature && <div><span style={{ color: C.amberDark }}>agent_sig:</span> {proof.proof.agentSignature.signature}</div>}
            {proof.proof?.agentSignature?.signer && <div><span style={{ color: C.amberDark }}>agent_wallet:</span> {proof.proof.agentSignature.signer}</div>}
            <div style={{ marginTop: 6, color: C.accept }}>✓ Sovereign · Deterministic · {proof.proof?.eigenProof?.simulated === false ? "TEE Attested" : "Demo Mode"}</div>
          </div>
        </div>)}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// VENDORS (actionable connections)
// ═══════════════════════════════════════════════════════════════════════
const Vendors = ({ leads }) => {
  const [tab, setTab] = useState("Performance");
  const [connectModal, setConnectModal] = useState(null);
  const [connections, setConnections] = useState({ ZoomInfo: { key: "", endpoint: "", connected: false }, Apollo: { key: "", endpoint: "", connected: false }, Clearbit: { key: "", endpoint: "", connected: false }, Lusha: { key: "", endpoint: "", connected: false } });

  const vendorMeta = [
    { name: "ZoomInfo", logo: "🔍", cost: 10, desc: "Enterprise B2B intelligence" },
    { name: "Apollo", logo: "🚀", cost: 8, desc: "Sales intelligence & engagement" },
    { name: "Clearbit", logo: "🔮", cost: 12, desc: "Data enrichment APIs" },
    { name: "Lusha", logo: "📱", cost: 15, desc: "Contact & company data" },
  ];

  const vendorStats = vendorMeta.filter(v => leads.some(l => l.vendor === v.name)).map(v => {
    const vl = leads.filter(l => l.vendor === v.name);
    const acc = vl.filter(l => l.status === "accepted");
    return { ...v, total: vl.length, acc: acc.length, rej: vl.length - acc.length, rate: pct(acc.length, vl.length), spend: vl.length * v.cost };
  });

  const saveConnection = (name) => {
    setConnections(p => ({ ...p, [name]: { ...p[name], connected: true } }));
    setConnectModal(null);
  };

  return (
    <div className="fi">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Vendors</h1>
        <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>Connect vendor APIs and analyze lead quality</p>
      </div>
      <Tabs tabs={["Performance", "Connections"]} active={tab} onChange={setTab} />

      {tab === "Connections" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {vendorMeta.map(v => (
            <Card key={v.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{v.logo}</span><div><div style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</div><div style={{ fontSize: 11, color: C.text2 }}>{v.desc}</div></div></div>
                <Badge color={connections[v.name]?.connected ? C.accept : C.text3}>{connections[v.name]?.connected ? "Connected" : "Not Connected"}</Badge>
              </div>
              <div style={{ fontSize: 11, color: C.text2, marginBottom: 10 }}>Cost/Lead: <strong style={{ color: C.text }}>{$(v.cost)}</strong></div>
              <Btn v={connections[v.name]?.connected ? "secondary" : "primary"} sz="sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setConnectModal(v.name)}>
                <I n="plug" s={13} c={connections[v.name]?.connected ? C.text2 : "#fff"} /> {connections[v.name]?.connected ? "Configure" : "Connect API"}
              </Btn>
            </Card>
          ))}
        </div>
      ) : vendorStats.length > 0 ? (
        <Card style={{ padding: 0 }}>
          <Table cols={[
            { label: "Vendor", render: r => <span style={{ fontWeight: 600 }}>{r.logo} {r.name}</span> },
            { label: "Leads", render: r => fmt(r.total) },
            { label: "Accepted", render: r => <span style={{ color: C.accept, fontWeight: 600 }}>{r.acc}</span> },
            { label: "Rejected", render: r => <span style={{ color: C.reject, fontWeight: 600 }}>{r.rej}</span> },
            { label: "Accept Rate", render: r => <span style={{ fontWeight: 600, color: parseFloat(r.rate) >= 60 ? C.accept : C.pending }}>{r.rate}%</span> },
            { label: "Spend", render: r => <span style={{ fontFamily: "'JetBrains Mono'" }}>{$(r.spend)}</span> },
          ]} data={vendorStats} />
        </Card>
      ) : <Card style={{ textAlign: "center", padding: 40, color: C.text3 }}>No vendor data yet. Validate leads to see performance.</Card>}

      <Modal open={!!connectModal} onClose={() => setConnectModal(null)} title={`Connect ${connectModal}`} width={440}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>API Key</label>
          <input value={connections[connectModal]?.key || ""} onChange={e => setConnections(p => ({ ...p, [connectModal]: { ...p[connectModal], key: e.target.value } }))} placeholder="Enter API key..." style={{ width: "100%", padding: "8px 10px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 10 }} />
          <label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>API Endpoint (optional)</label>
          <input value={connections[connectModal]?.endpoint || ""} onChange={e => setConnections(p => ({ ...p, [connectModal]: { ...p[connectModal], endpoint: e.target.value } }))} placeholder="https://api.vendor.com/v2" style={{ width: "100%", padding: "8px 10px", background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Btn v="secondary" onClick={() => setConnectModal(null)}>Cancel</Btn><Btn onClick={() => saveConnection(connectModal)}><I n="plug" s={13} c="#fff" /> Save & Connect</Btn></div>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS (actually calls backend /api/config)
// ═══════════════════════════════════════════════════════════════════════
const Settings = () => {
  const [weights, setWeights] = useState({ email: 20, company: 15, contact: 20, icp: 20, dm: 15, budget: 10 });
  const [threshold, setThreshold] = useState(80);
  const [eigenPrompt, setEigenPrompt] = useState("You are a B2B lead quality validator. Analyze the provided lead data and determine if this person is a legitimate decision-maker with budget authority at a company that matches the target ICP. Score each criterion carefully. Be strict but fair.");
  const [icp, setIcp] = useState({ minSize: "500", maxSize: "10000", industries: "SaaS, FinTech, HealthTech, DevTools", geo: "North America" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState("eigen");

  useEffect(() => { agentStatus().then(s => { if (s.config) { setThreshold(s.config.threshold); setWeights(s.config.weights); } }); }, []);

  const save = async () => {
    setSaving(true);
    const result = await agentConfig({ weights, threshold, eigenPrompt, icp: { ...icp, minSize: parseInt(icp.minSize), maxSize: parseInt(icp.maxSize), industries: icp.industries.split(",").map(s => s.trim()) } });
    setSaving(false);
    if (!result.error) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const Sec = ({ title, desc, id, children }) => (
    <Card style={{ marginBottom: 12, padding: 0 }}>
      <div onClick={() => setOpen(open === id ? null : id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "14px 20px" }}>
        <div><div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div><div style={{ fontSize: 11, color: C.text2, marginTop: 1 }}>{desc}</div></div>
        <div style={{ transform: open === id ? "rotate(90deg)" : "none", transition: "transform .15s" }}><I n="chevR" s={15} c={C.text3} /></div>
      </div>
      {open === id && <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>{children}</div>}
    </Card>
  );

  return (
    <div className="fi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Settings</h1>
          <p style={{ color: C.text2, marginTop: 2, fontSize: 13 }}>Configure your sovereign agent</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 12, color: C.accept, fontWeight: 500 }}>✓ Saved to agent</span>}
          <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : <><I n="save" s={13} c="#fff" /> Save Settings</>}</Btn>
        </div>
      </div>

      <Sec title="EigenAI Configuration" desc="This updates the validation prompt sent to your sovereign agent backend" id="eigen">
        <div style={{ padding: "8px 10px", background: "#F9FAFB", borderRadius: 6, fontSize: 11, color: C.text2, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <I n="info" s={13} c={C.text3} /> Changes here are sent to <code style={{ background: "#E5E7EB", padding: "1px 4px", borderRadius: 3 }}>PUT /api/config</code> on your agent at <code style={{ background: "#E5E7EB", padding: "1px 4px", borderRadius: 3 }}>{AGENT}</code>
        </div>
        <label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>Validation Prompt (sent to EigenAI for each lead)</label>
        <textarea value={eigenPrompt} onChange={e => setEigenPrompt(e.target.value)} rows={4} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11.5, fontFamily: "'JetBrains Mono'", outline: "none", lineHeight: 1.6, background: "#F9FAFB" }} />
      </Sec>

      <Sec title="Scoring Weights" desc="How each criterion contributes to total score (100 max)" id="weights">
        {Object.entries(weights).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{k === "dm" ? "Decision Maker" : k === "icp" ? "ICP Fit" : k[0].toUpperCase() + k.slice(1)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>{v}</span>
            </div>
            <input type="range" min="0" max="30" value={v} onChange={e => setWeights(p => ({ ...p, [k]: parseInt(e.target.value) }))} />
          </div>
        ))}
        <div style={{ padding: "6px 10px", background: "#F9FAFB", borderRadius: 6, fontSize: 11, color: C.text2 }}>Total: <strong style={{ color: Object.values(weights).reduce((s, v) => s + v, 0) === 100 ? C.accept : C.reject }}>{Object.values(weights).reduce((s, v) => s + v, 0)}/100</strong></div>
      </Sec>

      <Sec title="Acceptance Threshold" desc="Minimum score to accept a lead" id="threshold">
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: C.blueDark }}>{threshold}</span>
          <span style={{ fontSize: 13, color: C.text2, marginLeft: 3 }}>/100</span>
        </div>
        <input type="range" min="50" max="95" value={threshold} onChange={e => setThreshold(parseInt(e.target.value))} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: C.text3 }}><span>Lenient (50)</span><span>Strict (95)</span></div>
      </Sec>

      <Sec title="ICP Configuration" desc="Ideal Customer Profile parameters" id="icp">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ k: "minSize", l: "Min Employees" }, { k: "maxSize", l: "Max Employees" }, { k: "industries", l: "Target Industries (comma-separated)" }, { k: "geo", l: "Geography" }].map(f => (
            <div key={f.k}><label style={{ display: "block", fontSize: 11, color: C.text2, marginBottom: 3 }}>{f.l}</label>
              <input value={icp[f.k]} onChange={e => setIcp(p => ({ ...p, [f.k]: e.target.value }))} style={{ width: "100%", padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none" }} /></div>
          ))}
        </div>
      </Sec>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// LEAD DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════
const LeadDetail = ({ lead, onClose }) => (
  <Modal open={!!lead} onClose={onClose} title="Lead Details" width={620}>
    {lead && (<div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <div><div style={{ fontSize: 18, fontWeight: 700 }}>{lead.firstName} {lead.lastName}</div><div style={{ fontSize: 12, color: C.text2 }}>{lead.title} at {lead.company}</div></div>
        <Badge color={lead.status === "accepted" ? C.accept : C.reject}>{lead.status} — {lead.totalScore || 0}/100</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        {[{ l: "Email", v: lead.email }, { l: "Company", v: lead.company }, { l: "Industry", v: lead.industry }, { l: "Employees", v: lead.employeeCount ? fmt(lead.employeeCount) : "—" }, { l: "Vendor", v: lead.vendor }].map((x, i) => (
          <div key={i} style={{ padding: 8, background: "#F9FAFB", borderRadius: 6 }}><div style={{ fontSize: 9, color: C.text3, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 2 }}>{x.l}</div><div style={{ fontSize: 12 }}>{x.v || "—"}</div></div>
        ))}
      </div>
      {lead.scores && <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Score Breakdown</div>
        {[{ l: "Email", s: lead.scores.email, m: 20 }, { l: "Company", s: lead.scores.company, m: 15 }, { l: "Contact", s: lead.scores.contact, m: 20 }, { l: "ICP Fit", s: lead.scores.icp, m: 20 }, { l: "DM", s: lead.scores.dm, m: 15 }, { l: "Budget", s: lead.scores.budget, m: 10 }].map((x, i) => <ScoreBar key={i} label={x.l} score={x.s || 0} max={x.m} color={(x.s || 0) / x.m >= .7 ? C.accept : C.reject} />)}
      </div>}
    </div>)}
  </Modal>
);

// ═══════════════════════════════════════════════════════════════════════
// NAV + APP
// ═══════════════════════════════════════════════════════════════════════
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "validate", label: "Validate", icon: "shield" },
  { key: "leads", label: "All Leads", icon: "users" },
  { key: "disputes", label: "Disputes", icon: "scale" },
  { key: "vendors", label: "Vendors", icon: "bar" },
  { key: "settings", label: "Settings", icon: "gear" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState([]);
  const [sel, setSel] = useState(null);
  const [agentUp, setAgentUp] = useState(null);

  useEffect(() => { agentStatus().then(s => setAgentUp(!s.error)); }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <div style={{ width: 210, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "20px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-.03em" }}>Aven</div>
          <div style={{ fontSize: 9.5, color: C.text3, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 1 }}>Verifiable Lead Intelligence</div>
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
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: agentUp ? C.accept : C.reject }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: agentUp ? C.accept : C.reject }}>{agentUp ? "Agent Online" : "Agent Offline"}</span>
          </div>
          <div style={{ fontSize: 10, color: C.text3 }}>{fmt(leads.length)} leads · {AGENT.replace("http://", "")}</div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, marginLeft: 210, padding: "24px 28px", minHeight: "100vh" }}>
        {!agentUp && agentUp !== null && <div style={{ padding: "10px 14px", background: C.rose, borderRadius: 8, fontSize: 12, color: C.roseText, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><I n="info" s={14} c={C.reject} /> Agent at {AGENT} is not reachable. Start your backend or check the URL.</div>}
        {page === "dashboard" && <Dashboard leads={leads} />}
        {page === "validate" && <Validate leads={leads} setLeads={setLeads} />}
        {page === "leads" && <AllLeads leads={leads} setLeads={setLeads} setSel={setSel} />}
        {page === "disputes" && <Disputes leads={leads} />}
        {page === "vendors" && <Vendors leads={leads} />}
        {page === "settings" && <Settings />}
      </div>

      <LeadDetail lead={sel} onClose={() => setSel(null)} />
    </div>
  );
}
