import { useState, useRef, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#03070F",
  surface: "rgba(13,22,38,0.75)",
  card: "rgba(16,26,44,0.5)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.13)",
  primary: "#00FF87",
  primaryDim: "rgba(0,255,135,0.1)",
  primaryGlow: "rgba(0,255,135,0.35)",
  blue: "#38BDF8",
  blueDim: "rgba(56,189,248,0.1)",
  purple: "#A78BFA",
  purpleDim: "rgba(167,139,250,0.1)",
  gold: "#FBBF24",
  goldDim: "rgba(251,191,36,0.1)",
  danger: "#F87171",
  dangerDim: "rgba(248,113,113,0.1)",
  text: "#EEF2FF",
  textSub: "#8892A4",
  textMuted: "#404C5E",
};

const DB = { users: {} };
const fmt = (v) => "₹" + Math.abs(Math.round(v)).toLocaleString("en-IN");
const fmtK = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : fmt(v);

// ─────────────────────────────────────────────────────────────────────────────
// STYLE INJECTION
// ─────────────────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("cc-v2")) return;
  const s = document.createElement("style");
  s.id = "cc-v2";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #03070F; color: #EEF2FF; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
    @keyframes slideIn { from{transform:rotateY(40deg) scale(0.9);opacity:0} to{transform:rotateY(0) scale(1);opacity:1} }
    @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,70px)} }
    @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-60px,40px)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .panel { background:rgba(13,22,38,0.75); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.07); border-radius:16px; transition:border-color 0.2s; }
    .panel:hover { border-color:rgba(255,255,255,0.12); }
    .panel-flat { background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); border-radius:12px; }
    .inp { width:100%; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:14px 16px; color:#EEF2FF; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:all 0.2s; }
    .inp:focus { border-color:#00FF87; box-shadow:0 0 0 3px rgba(0,255,135,0.1); }
    .inp::placeholder { color:#404C5E; }
    select.inp { appearance:none; cursor:pointer; }
    .btn-p { background:linear-gradient(135deg,#00FF87,#00CFFF); color:#000; border:none; border-radius:10px; padding:14px 28px; font-weight:700; font-size:15px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.25s; box-shadow:0 4px 24px rgba(0,255,135,0.2); }
    .btn-p:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,255,135,0.35); }
    .btn-p:disabled { opacity:0.6; transform:none; cursor:not-allowed; }
    .btn-g { background:rgba(255,255,255,0.04); color:#EEF2FF; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 20px; font-weight:500; font-size:13px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; text-align:left; }
    .btn-g:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.15); }
    .chip { padding:7px 14px; border-radius:20px; border:1px solid rgba(255,255,255,0.07); font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; background:transparent; color:#8892A4; font-family:'DM Sans',sans-serif; white-space:nowrap; }
    .chip:hover,.chip.on { background:rgba(0,255,135,0.1); border-color:#00FF87; color:#00FF87; }
    .nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:10px; cursor:pointer; transition:all 0.2s; color:#8892A4; font-weight:500; font-size:14px; border:1px solid transparent; }
    .nav-item:hover { background:rgba(255,255,255,0.04); color:#EEF2FF; }
    .nav-item.active { background:rgba(0,255,135,0.08); color:#00FF87; border-color:rgba(0,255,135,0.15); font-weight:600; }
    .mono { font-family:'JetBrains Mono',monospace; }
    .range-sl { width:100%; -webkit-appearance:none; height:4px; border-radius:4px; outline:none; cursor:pointer; background:transparent; }
    .range-sl::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#00FF87; box-shadow:0 0 10px rgba(0,255,135,0.5); cursor:pointer; transition:transform 0.15s; }
    .range-sl::-webkit-slider-thumb:hover { transform:scale(1.25); }
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
    .table-row:hover { background:rgba(255,255,255,0.025); }
    .game-bar { height:6px; border-radius:6px; transition:width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
    .game-btn { flex:1; padding:18px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); color:#EEF2FF; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; text-align:left; line-height:1.5; }
    .game-btn:hover { border-color:#00FF87; background:rgba(0,255,135,0.07); transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
    .card-anim { animation:slideIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-up { animation:fadeUp 0.4s ease both; }
    .anim-in { animation:fadeIn 0.35s ease both; }
    .tag { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600; letter-spacing:0.3px; text-transform:uppercase; }

    /* Mobile Responsive Additions */
    .mobile-topbar { display: none; padding: 14px 20px; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(3,7,15,0.92); position: sticky; top: 0; z-index: 90; backdrop-filter: blur(24px); }
    .sidebar { width: 236px; padding: 26px 14px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.07); background: rgba(3,7,15,0.92); backdrop-filter: blur(24px); height: 100vh; z-index: 100; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
    .main-area { flex: 1; padding: 44px 52px; overflow-y: auto; overflow-x: hidden; height: 100vh; display: flex; flex-direction: column; }
    .nav-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 95; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.3s; pointer-events: none; }
    .nav-overlay.show { display: block; opacity: 1; pointer-events: all; }
    
    @media (max-width: 900px) {
      .mobile-topbar { display: flex; }
      .sidebar { position: fixed; left: 0; top: 0; transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); box-shadow: 10px 0 40px rgba(0,0,0,0.8); }
      .main-area { padding: 24px 16px; height: calc(100vh - 65px); }
      
      /* STRICT MOBILE GRID OVERRIDES */
      .responsive-header { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
      .responsive-grid { display: flex !important; flex-direction: column !important; width: 100% !important; gap: 16px !important; }
      
      .game-btn-container { flex-direction: column !important; }
      .mobile-close-btn { display: block !important; }
    }
  `;
  document.head.appendChild(s);
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────
const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FF87"/>
        <stop offset="1" stopColor="#00CFFF"/>
      </linearGradient>
    </defs>
    <rect width="34" height="34" rx="9" fill="url(#logoGrad)"/>
    <path d="M7 25 L12 15 L17 20 L23 9 L29 13" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="29" cy="13" r="2.5" fill="#000"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────
const Counter = ({ to, prefix = "", suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const dur = 900;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * ease));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [to]);
  return <span className="mono">{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// CIBIL ARC GAUGE
// ─────────────────────────────────────────────────────────────────────────────
const CibilGauge = ({ score }) => {
  const pct = Math.max(0, Math.min(1, (score - 300) / 600));
  const color = score >= 750 ? T.primary : score >= 650 ? T.gold : T.danger;
  const label = score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Poor";
  const cx = 80, cy = 75, r = 58;
  const startA = -210, sweep = 240;
  const toXY = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const arcD = (from, to) => {
    const [x1, y1] = toXY(from);
    const [x2, y2] = toXY(to);
    const large = (to - from) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const endAngle = startA + pct * sweep;
  return (
    <svg width="160" height="110" viewBox="0 0 160 110">
      <path d={arcD(startA, startA + sweep)} stroke={T.border} strokeWidth="7" fill="none" strokeLinecap="round"/>
      {pct > 0.01 && <path d={arcD(startA, endAngle)} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" style={{ transition: "all 0.8s ease", filter: `drop-shadow(0 0 6px ${color})` }}/>}
      <text x="80" y="70" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="JetBrains Mono">{score}</text>
      <text x="80" y="88" textAnchor="middle" fill={T.textSub} fontSize="11" fontFamily="DM Sans">{label}</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH RING
// ─────────────────────────────────────────────────────────────────────────────
const HealthRing = ({ score, size = 80 }) => {
  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score > 72 ? T.primary : score > 48 ? T.gold : T.danger;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth="7"/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 5px ${color})` }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="mono" style={{ fontSize: size > 80 ? 18 : 15, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", salary: "", numEmis: "", currentEmi: "", cibil: "", age: "", goal: "Wealth Accumulation" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { injectStyles(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        const u = DB.users[form.email];
        if (!u || u.password !== form.password) return setError("Invalid credentials.");
        onLogin(u);
      } else if (step === 1) {
        if (!form.name || !form.email || !form.password) return setError("All fields required.");
        if (form.password.length < 6) return setError("Password must be 6+ characters.");
        setStep(2);
      } else {
        if (!form.salary || !form.cibil || !form.age) return setError("Complete all profile fields.");
        const user = { ...form, id: Date.now(), salary: +form.salary, currentEmi: +form.currentEmi || 0, cibil: +form.cibil || 700, age: +form.age || 25 };
        DB.users[form.email] = user;
        
        // Redirect back to login explicitly
        setMode("login");
        setStep(1);
        setError("✅ Account created successfully! Please log in.");
      }
    }, 450);
  };

  const goals = ["Buy a House", "Buy a Car", "Become Debt Free", "Wealth Accumulation", "Start a Business", "Early Retirement"];

  const isSuccess = error.includes("✅");
  const bannerColor = isSuccess ? T.primary : T.danger;
  const bannerBg = isSuccess ? T.primaryDim : T.dangerDim;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: T.bg }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,135,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.025) 1px, transparent 1px)`, backgroundSize: "56px 56px" }}/>
      <div className="orb" style={{ width: 550, height: 550, background: "radial-gradient(circle,rgba(0,255,135,0.06),transparent 70%)", top: "-15%", left: "-8%", animation: "orb1 18s infinite ease-in-out" }}/>
      <div className="orb" style={{ width: 400, height: 400, background: "radial-gradient(circle,rgba(56,189,248,0.06),transparent 70%)", bottom: "-10%", right: "-5%", animation: "orb2 14s infinite ease-in-out" }}/>

      <div className="panel" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 480, padding: "44px 40px", margin: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo size={52}/>
          <h1 style={{ marginTop: 16, fontSize: 30, fontWeight: 800, background: "linear-gradient(to right,#00FF87,#38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CrediCoach</h1>
          <p style={{ color: T.textSub, fontSize: 14, marginTop: 6 }}>Intelligent Wealth Management Platform</p>
        </div>

        {mode === "register" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: step >= s ? T.primary : T.border, transition: "background 0.35s" }}/>)}
          </div>
        )}

        {error && <div style={{ background: bannerBg, border: `1px solid ${bannerColor}`, borderRadius: 10, padding: "11px 16px", color: bannerColor, marginBottom: 20, fontSize: 13, display: "flex", gap: 8, animation: "shake 0.35s ease" }}>{isSuccess ? "" : "⚠ "}{error}</div>}

        {mode === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input className="inp" placeholder="Email address" type="email" value={form.email} onChange={e => set("email", e.target.value)}/>
            <input className="inp" placeholder="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}/>
            <button className="btn-p" onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 4 }}>{loading ? "Authenticating..." : "Access Dashboard →"}</button>
          </div>
        ) : step === 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input className="inp" placeholder="Full Name" value={form.name} onChange={e => set("name", e.target.value)}/>
            <input className="inp" placeholder="Email address" type="email" value={form.email} onChange={e => set("email", e.target.value)}/>
            <input className="inp" placeholder="Password (min. 6 chars)" type="password" value={form.password} onChange={e => set("password", e.target.value)}/>
            <button className="btn-p" onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 4 }}>{loading ? "Processing..." : "Continue to Profile →"}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input className="inp" placeholder="Age" type="number" value={form.age} onChange={e => set("age", e.target.value)}/>
              <input className="inp" placeholder="CIBIL Score (300–900)" type="number" value={form.cibil} onChange={e => set("cibil", e.target.value)}/>
            </div>
            
            <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input className="inp" placeholder="Monthly Salary ₹" type="number" value={form.salary} onChange={e => set("salary", e.target.value)}/>
              <input className="inp" placeholder="Number of Active EMIs" type="number" value={form.numEmis} onChange={e => set("numEmis", e.target.value)}/>
            </div>
            
            {Number(form.numEmis) > 0 && (
              <div className="anim-in">
                <input className="inp" placeholder="Total Monthly EMI Amount ₹" type="number" value={form.currentEmi} onChange={e => set("currentEmi", e.target.value)}/>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 }}>
              {goals.map(g => <button key={g} className={`chip ${form.goal === g ? "on" : ""}`} onClick={() => set("goal", g)} style={{ fontSize: 11, padding: "7px 8px" }}>{g}</button>)}
            </div>
            <button className="btn-p" onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 4 }}>{loading ? "Creating Profile..." : "Create Account →"}</button>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: T.textMuted }}>
          <span style={{ cursor: "pointer", color: T.primary }} onClick={() => { setMode(mode === "login" ? "register" : "login"); setStep(1); setError(""); }}>
            {mode === "login" ? "New here? Create an account" : "Have an account? Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const Overview = ({ user }) => {
  const expenses = Math.round(user.salary * 0.35);
  const net = user.salary - user.currentEmi - expenses;
  const foir = user.currentEmi / user.salary;

  const cibilPts = Math.round((Math.max(0, user.cibil - 300) / 600) * 40);
  const foirPts = Math.round((1 - Math.min(foir, 1)) * 30);
  const netPts = net > 0 ? Math.min(20, Math.round((net / user.salary) * 40)) : 0;
  const agePts = user.age < 30 ? 10 : user.age < 40 ? 8 : 5;
  const healthScore = Math.min(100, cibilPts + foirPts + netPts + agePts);

  const projection = Array.from({ length: 7 }, (_, i) => ({
    m: ["Now","1M","2M","3M","4M","5M","6M"][i],
    wealth: Math.max(0, Math.round(net * i * 1.007)),
    target: Math.round(user.salary * i * 0.25),
  }));

  const expPie = [
    { name: "EMIs", value: user.currentEmi, color: T.danger },
    { name: "Living", value: expenses, color: T.blue },
    { name: "Free Cash", value: Math.max(0, net), color: T.primary },
  ];

  const cards = [
    { label: "Monthly Income", val: user.salary, color: T.primary, icon: "💰", prefix: "₹", note: "Total inflow" },
    { label: "Active EMIs", val: user.currentEmi, color: T.danger, icon: "📤", prefix: "", note: `${Math.round(foir * 100)}% of income` },
    { label: "Free Cashflow", val: Math.abs(net), color: net >= 0 ? T.primary : T.danger, icon: net >= 0 ? "📈" : "📉", prefix: "₹", note: net >= 0 ? "Healthy surplus" : "Deficit!" },
    { label: "CIBIL Score", val: user.cibil, color: user.cibil >= 750 ? T.primary : user.cibil >= 650 ? T.gold : T.danger, icon: "🏆", prefix: "", note: user.cibil >= 750 ? "Excellent" : user.cibil >= 650 ? "Fair" : "Needs work" },
  ];

  const tips = [
    net < 0 && { t: "danger", i: "🚨", txt: "Your EMIs exceed safe FOIR limits (40%). Consider loan restructuring immediately." },
    user.cibil < 700 && { t: "warn", i: "⚡", txt: "Pay every EMI on time for 6 months. Even one missed payment can drop CIBIL by 50+ pts." },
    foir > 0.45 && { t: "warn", i: "⚠️", txt: `FOIR at ${Math.round(foir * 100)}%. Most lenders cap at 40–50%. New loan approval risk is high.` },
    net > 0 && user.cibil >= 750 && { t: "good", i: "✅", txt: "Profile qualifies for premium rates. HDFC/SBI will likely offer sub-9% on home loans." },
    net > 5000 && { t: "info", i: "💡", txt: `Investing ${fmtK(net * 0.5)}/mo in Nifty 50 index funds could build ₹1Cr in ~${Math.round(100 / (net * 0.5 / user.salary * 2))} years.` },
  ].filter(Boolean).slice(0, 3);

  const tipColors = { danger: T.danger, warn: T.gold, good: T.primary, info: T.blue };

  return (
    <div className="anim-in">
      <div className="responsive-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 13, color: T.textSub, marginBottom: 6 }}>Good day,</p>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>{user.name.split(" ")[0]}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: T.textSub, fontSize: 13 }}>Goal:</span>
            <span className="tag" style={{ background: T.blueDim, color: T.blue }}>{user.goal}</span>
          </div>
        </div>
        <div className="panel" style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <HealthRing score={healthScore} size={88}/>
          <div>
            <div style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: 1 }}>Financial Health</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: healthScore > 72 ? T.primary : healthScore > 48 ? T.gold : T.danger }}>{healthScore > 72 ? "Strong" : healthScore > 48 ? "Moderate" : "At Risk"}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Score out of 100</div>
          </div>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
        {cards.map((c, i) => (
          <div key={i} className="panel anim-up" style={{ padding: "20px 22px", animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>{c.label}</span>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
            </div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: c.color, marginTop: 14 }}>
              {c.prefix}<Counter to={c.val}/>
            </div>
            <div style={{ fontSize: 12, color: T.textSub, marginTop: 6 }}>{c.note}</div>
          </div>
        ))}
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="panel" style={{ padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Wealth Projection</div>
              <div style={{ fontSize: 12, color: T.textSub, marginTop: 3 }}>6-month forecast at 8.4% annual returns</div>
            </div>
            <span className="tag" style={{ background: T.primaryDim, color: T.primary }}>LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={projection} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.primary} stopOpacity={0.28}/>
                  <stop offset="100%" stopColor={T.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.blue} stopOpacity={0.2}/>
                  <stop offset="100%" stopColor={T.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false}/>
              <XAxis dataKey="m" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v, n) => [fmtK(v), n]} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13 }}/>
              <Area type="monotone" dataKey="wealth" stroke={T.primary} fill="url(#wGrad)" strokeWidth={2.5} name="Projected"/>
              <Area type="monotone" dataKey="target" stroke={T.blue} fill="url(#tGrad)" strokeWidth={2} strokeDasharray="5 3" name="Target"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="responsive-grid" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel" style={{ padding: 22, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Cash Breakdown</div>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={expPie} cx="50%" cy="50%" innerRadius={30} outerRadius={46} dataKey="value" stroke="none">
                  {expPie.map((e, i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={fmt} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
              {expPie.map((e, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }}/>
                    <span style={{ color: T.textSub }}>{e.name}</span>
                  </div>
                  <span className="mono" style={{ fontWeight: 600 }}>{fmt(e.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 12, color: T.textSub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, alignSelf: "flex-start" }}>CIBIL Score</div>
            <CibilGauge score={user.cibil}/>
          </div>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {tips.map((t, i) => (
          <div key={i} className="panel anim-up" style={{ padding: 18, borderLeft: `3px solid ${tipColors[t.t]}`, animationDelay: `${0.35 + i * 0.1}s` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{t.i}</span>
              <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.55 }}>{t.txt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMI CALCULATOR — ADVANCED (4 Tabs)
// ─────────────────────────────────────────────────────────────────────────────
const EMICalc = ({ params, setParams, user }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [prepay, setPrepay] = useState(0);

  const calcEMI = (p, r, n) => {
    p = Number(p) || 0; r = Number(r) || 0; n = Number(n) || 1;
    const mr = r / 12 / 100;
    if (mr === 0) return p / n;
    return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  };

  const p = Number(params.principal) || 0;
  const r = Number(params.rate) || 0;
  const t = Number(params.tenure) || 1;
  const cEmi = params.currentEmi !== undefined ? Number(params.currentEmi) : (Number(user.currentEmi) || 0);

  const emi = calcEMI(p, r, t);
  const totalPay = emi * t;
  const totalInt = Math.max(0, totalPay - p);
  
  const currentFoir = cEmi / user.salary;
  const foirAfter = (cEmi + emi) / user.salary;

  const amort = useMemo(() => {
    const mr = r / 12 / 100;
    let bal = p;
    return Array.from({ length: Math.min(t, 24) }, (_, i) => {
      const interest = bal * mr;
      const principal = emi - interest;
      bal = Math.max(0, bal - principal);
      return { mo: i + 1, emi: Math.round(emi), principal: Math.round(principal), interest: Math.round(interest), balance: Math.round(bal) };
    });
  }, [p, r, t, emi]);

  const prepayResult = useMemo(() => {
    if (!prepay || p <= 0 || r <= 0 || t <= 0) return null;
    const mr = r / 12 / 100;
    let bal = p, mos = 0, ti = 0;
    while (bal > 1 && mos < 1200) {
      const int = bal * mr;
      const prin = Math.min(bal, emi - int + prepay);
      ti += int; bal -= prin; mos++;
    }
    return { months: mos, saved: Math.max(0, Math.round(totalInt - ti)), savedMonths: Math.max(0, t - mos) };
  }, [p, r, t, emi, prepay, totalInt]);

  const tenures = [{ l: "5 Yr", n: 60 }, { l: "10 Yr", n: 120 }, { l: "15 Yr", n: 180 }, { l: "20 Yr", n: 240 }];
  const cmpData = tenures.map(ten => ({ label: ten.l, tenure: ten.n, emi: Math.round(calcEMI(p, r, ten.n)), total: Math.round(calcEMI(p, r, ten.n) * ten.n) }));

  const pieData = [{ name: "Principal", value: Math.round(p) }, { name: "Interest", value: Math.round(totalInt) }];

  const renderSlider = ({ label, k, min, max, step, colors, prefix = "", suffix = "", fallback }) => {
    const rawVal = params[k] !== undefined ? params[k] : (fallback !== undefined ? fallback : 0);
    const val = Number(rawVal) || 0;
    const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));

    const handleInputChange = (e) => {
      const inputVal = e.target.value;
      setParams({ ...params, [k]: inputVal === "" ? "" : Number(inputVal) });
    };

    return (
      <div key={k} style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>{label}</span>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.45)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 10px", transition: "border-color 0.2s" }} onFocus={e => e.currentTarget.style.borderColor = T.primary} onBlur={e => e.currentTarget.style.borderColor = T.border}>
            {prefix && <span style={{ color: T.textSub, fontSize: 14, marginRight: 6 }}>{prefix}</span>}
            <input
              type="number"
              value={rawVal}
              onChange={handleInputChange}
              className="mono"
              style={{
                background: "transparent", border: "none", outline: "none", color: T.primary,
                fontSize: 15, fontWeight: 700, width: (k === 'principal' || k === 'currentEmi') ? 85 : 55, textAlign: "right"
              }}
            />
            {suffix && <span style={{ color: T.textSub, fontSize: 13, marginLeft: 6 }}>{suffix}</span>}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, borderRadius: 4, background: T.border, transform: "translateY(-50%)" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: colors || `linear-gradient(to right,${T.primary},${T.blue})`, transition: "width 0.1s" }}/>
          </div>
          <input className="range-sl" type="range" min={min} max={max} step={step} value={val} onChange={handleInputChange}/>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "basic", label: "Calculator" },
    { id: "amortize", label: "Schedule" },
    { id: "prepay", label: "Prepayment" },
    { id: "compare", label: "Compare" },
  ];

  return (
    <div className="anim-in">
      <div className="responsive-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>EMI Calculator</h2>
          <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>EMI calculator • Amortization schedule • Prepayment analysis</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map(tb => <button key={tb.id} className={`chip ${activeTab === tb.id ? "on" : ""}`} onClick={() => setActiveTab(tb.id)}>{tb.label}</button>)}
        </div>
      </div>

      {activeTab === "basic" && (
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22 }}>
          <div className="panel" style={{ padding: 32 }}>
            {renderSlider({ label: "Loan Amount", k: "principal", prefix: "₹", min: 10000, max: 5000000, step: 10000 })}
            {renderSlider({ label: "Interest Rate (p.a.)", k: "rate", suffix: "%", min: 5, max: 30, step: 0.1, colors: `linear-gradient(to right,${T.primary},${T.gold},${T.danger})` })}
            {renderSlider({ label: "Loan Tenure", k: "tenure", suffix: "mo", min: 3, max: 360, step: 3 })}
            {renderSlider({ label: "Existing EMIs", k: "currentEmi", prefix: "₹", min: 0, max: user.salary, step: 500, colors: `linear-gradient(to right,${T.blue},${T.primary})`, fallback: Number(user.currentEmi) || 0 })}
            
            <div className="panel-flat" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: T.textSub }}>Current EMI Burden</span>
                <span className="mono" style={{ fontWeight: 700, color: currentFoir > 0.4 ? T.danger : T.primary, fontSize: 13 }}>{Math.round(currentFoir * 100)}% of income</span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: T.border, marginBottom: 16 }}>
                <div style={{ width: `${Math.min(currentFoir * 100, 100)}%`, height: "100%", borderRadius: 4, background: currentFoir > 0.4 ? T.danger : T.primary, transition: "width 0.3s" }}/>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: T.textSub }}>FOIR after this loan</span>
                <span className="mono" style={{ fontWeight: 700, color: foirAfter > 0.5 ? T.danger : T.primary, fontSize: 13 }}>{Math.round(foirAfter * 100)}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: T.border }}>
                <div style={{ width: `${Math.min(foirAfter * 100, 100)}%`, height: "100%", borderRadius: 4, background: foirAfter > 0.5 ? T.danger : T.primary, transition: "width 0.3s" }}/>
              </div>
              {foirAfter > 0.5 && <p style={{ fontSize: 11, color: T.danger, marginTop: 7 }}>⚠ FOIR exceeds 50% — most lenders will reject this application</p>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="panel" style={{ padding: 26, textAlign: "center" }}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={66} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                    <Cell fill={T.blue}/>
                    <Cell fill={T.primary}/>
                  </Pie>
                  <Tooltip formatter={fmt} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: T.textSub, letterSpacing: 1, textTransform: "uppercase" }}>Monthly EMI</div>
              <div className="mono" style={{ fontSize: 36, fontWeight: 800, color: T.primary, marginTop: 6 }}>{fmt(emi)}</div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              {[
                { l: "Total Payable", v: fmt(totalPay), c: T.text },
                { l: "Principal", v: fmt(p), c: T.blue },
                { l: "Total Interest", v: fmt(totalInt), c: T.primary },
                { l: "Interest Burden", v: `${p > 0 ? Math.round((totalInt / p) * 100) : 0}%`, c: T.gold },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: T.textSub }}>{r.l}</span>
                  <span className="mono" style={{ fontWeight: 700, color: r.c, fontSize: 13 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "amortize" && (
        <div className="panel" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>Amortization Schedule</h3>
            <p style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>Month-by-month principal vs interest breakdown (first 24 months)</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Mo", "EMI", "Principal", "Interest", "Balance"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "right", color: T.textSub, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap", fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amort.map(r => (
                  <tr key={r.mo} className="table-row" style={{ borderBottom: `1px solid rgba(255,255,255,0.025)` }}>
                    <td className="mono" style={{ padding: "10px 16px", color: T.textMuted, textAlign: "right" }}>{r.mo}</td>
                    <td className="mono" style={{ padding: "10px 16px", textAlign: "right" }}>{fmt(r.emi)}</td>
                    <td className="mono" style={{ padding: "10px 16px", textAlign: "right", color: T.blue }}>{fmt(r.principal)}</td>
                    <td className="mono" style={{ padding: "10px 16px", textAlign: "right", color: T.primary }}>{fmt(r.interest)}</td>
                    <td className="mono" style={{ padding: "10px 16px", textAlign: "right", color: T.textSub }}>{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t > 24 && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 14, textAlign: "center" }}>Showing first 24 of {t} months</p>}
        </div>
      )}

      {activeTab === "prepay" && (
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <div className="panel" style={{ padding: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Prepayment Simulator</h3>
            <p style={{ fontSize: 13, color: T.textSub, marginBottom: 28, lineHeight: 1.6 }}>Pay extra each month — see how much time and interest you save.</p>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: T.textSub }}>Extra Payment / Month</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: T.gold }}>{fmt(prepay)}</span>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, borderRadius: 4, background: T.border, transform: "translateY(-50%)" }}>
                  <div style={{ width: `${(prepay / 50000) * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(to right,${T.gold},${T.primary})`, transition: "width 0.1s" }}/>
                </div>
                <input className="range-sl" type="range" min={0} max={50000} step={500} value={prepay} onChange={e => setPrepay(+e.target.value)}/>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[0, 2000, 5000, 10000, 25000].map(v => (
                <button key={v} className="btn-g" onClick={() => setPrepay(v)} style={{ borderColor: prepay === v ? T.gold : T.border, color: prepay === v ? T.gold : T.textSub, fontSize: 13 }}>
                  {v === 0 ? "No prepayment (baseline)" : `+ ${fmt(v)} / month`}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="panel" style={{ padding: 26 }}>
              <div style={{ fontSize: 12, color: T.textSub, marginBottom: 16, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8 }}>Without Prepayment</div>
              {[{ l: "Tenure", v: `${t} months`, c: T.text }, { l: "Total Interest", v: fmt(totalInt), c: T.danger }].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: T.textSub }}>{r.l}</span>
                  <span className="mono" style={{ fontWeight: 700, color: r.c }}>{r.v}</span>
                </div>
              ))}
            </div>
            {prepayResult ? (
              <div className="panel" style={{ padding: 26, borderColor: "rgba(0,255,135,0.2)" }}>
                <div style={{ fontSize: 12, color: T.primary, marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>With {fmt(prepay)}/mo Extra</div>
                {[
                  { l: "New Tenure", v: `${prepayResult.months} months`, c: T.primary },
                  { l: "Months Saved", v: `-${prepayResult.savedMonths} months`, c: T.blue },
                  { l: "Interest Saved", v: fmt(prepayResult.saved), c: T.primary },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                    <span style={{ fontSize: 13, color: T.textSub }}>{r.l}</span>
                    <span className="mono" style={{ fontWeight: 700, color: r.c, fontSize: i === 2 ? 18 : 13 }}>{r.v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel" style={{ padding: 26, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 14, minHeight: 120 }}>
                ← Drag the slider to see savings
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "compare" && (
        <div>
          <div className="responsive-header" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>Tenure Comparison</h3>
            <span style={{ fontSize: 13, color: T.textSub }}>— {fmtK(p)} at {r}% p.a.</span>
          </div>
          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {cmpData.map((c, i) => (
              <div key={i} onClick={() => setParams({ ...params, tenure: c.tenure })} className="panel" style={{ padding: 22, textAlign: "center", cursor: "pointer", borderColor: t === c.tenure ? T.primary : T.border }}>
                <div style={{ fontSize: 13, color: T.textSub, marginBottom: 8 }}>{c.label}</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>{fmt(c.emi)}</div>
                <div style={{ fontSize: 11, color: T.textSub, marginTop: 4 }}>per month</div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 12, color: T.textMuted }}>Total: {fmtK(c.total)}</div>
                  <div style={{ fontSize: 11, color: T.danger, marginTop: 3 }}>Interest: {fmtK(c.total - p)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cmpData} barGap={10}>
                <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false}/>
                <XAxis dataKey="label" tick={{ fill: T.textMuted, fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmtK} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Tooltip formatter={fmt} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }}/>
                <Bar dataKey="total" name="Total Payable" fill={T.blue} radius={[6, 6, 0, 0]} opacity={0.7}/>
                <Bar dataKey="emi" name="Monthly EMI" fill={T.primary} radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL GAME
// ─────────────────────────────────────────────────────────────────────────────
const FinancialGame = ({ user }) => {
  const init = { cash: user.salary * 3, credit: user.cibil, happy: 70, month: 1, streak: 0 };
  const [gs, setGs] = useState(init);
  const [idx, setIdx] = useState(0);
  const [over, setOver] = useState(null);
  const [result, setResult] = useState(null);
  const [ach, setAch] = useState([]);

  const scenarios = [
    { emoji: "📱", title: "iPhone Launch", cat: "Lifestyle", desc: "New iPhone drops. 0% no-cost EMI for 12 months is pre-approved for you.", choices: [
      { label: "Take EMI ₹5K/mo", icon: "💳", cashΔ: -5000, creditΔ: +5, happyΔ: +18, outcome: "EMI added to your profile. If paid on time, CIBIL benefits slightly. But flexibility decreases." },
      { label: "Wait & Save", icon: "💰", cashΔ: +2000, creditΔ: 0, happyΔ: -5, outcome: "Delayed gratification is one of the most underrated wealth-building skills. ₹2K saved this month." },
    ]},
    { emoji: "🏥", title: "Medical Emergency", cat: "Crisis", desc: "Unexpected hospital bill of ₹40,000. You have no health insurance.", choices: [
      { label: "Pay from savings", icon: "💸", cashΔ: -40000, creditΔ: 0, happyΔ: -12, outcome: "Painful but responsible. This event shows why a 6-month emergency fund is non-negotiable." },
      { label: "Credit card", icon: "💳", cashΔ: 0, creditΔ: -28, happyΔ: -22, outcome: "Credit utilization spikes. CIBIL drops sharply. Revolving balance at 36% p.a. is financial quicksand." },
    ]},
    { emoji: "📉", title: "Nifty Crashes 8%", cat: "Investment", desc: "Market correction. Your friend says 'this is the bottom, buy now!'", choices: [
      { label: "Invest ₹20K", icon: "🚀", cashΔ: -20000, creditΔ: 0, happyΔ: +10, outcome: "Long-term thinking. Index funds recover. Time in market > timing the market. Statistically sound." },
      { label: "Stay sideline", icon: "⏳", cashΔ: 0, creditΔ: 0, happyΔ: 0, outcome: "Preserving cash is also valid if you have upcoming large expenses or low emergency fund." },
    ]},
    { emoji: "💳", title: "Credit Card Due", cat: "Debt", desc: "₹15,000 bill due today. Minimum payment is just ₹750.", choices: [
      { label: "Pay full amount", icon: "✅", cashΔ: -15000, creditΔ: +22, happyΔ: +6, outcome: "Zero interest, CIBIL improves, no revolving debt trap. The only correct answer." },
      { label: "Pay minimum ₹750", icon: "😬", cashΔ: -750, creditΔ: -38, happyΔ: -8, outcome: "Remaining ₹14,250 at 36% p.a. = a debt spiral. CIBIL tanks hard. This choice destroys wealth." },
    ]},
    { emoji: "🎁", title: "Year-End Bonus!", cat: "Windfall", desc: "₹60,000 performance bonus hits your account today!", choices: [
      { label: "Prepay home loan", icon: "🏠", cashΔ: -50000, creditΔ: +32, happyΔ: +8, outcome: "Reduces principal aggressively. Saves significant interest over loan tenure. Wealth-maximizing move." },
      { label: "Vacation + gadgets", icon: "✈️", cashΔ: -60000, creditΔ: -5, happyΔ: +35, outcome: "High present value, zero long-term value. The wealthy spend windfalls on assets, not experiences." },
    ]},
    { emoji: "🏠", title: "Rent Hike Notice", cat: "Housing", desc: "Landlord hikes rent by ₹4,000. Friend offers info on home loan eligibility.", choices: [
      { label: "Explore home loan", icon: "🏡", cashΔ: -12000, creditΔ: +10, happyΔ: +22, outcome: "EMI higher but you're building equity, not paying someone else's loan. Long-term wealth builder." },
      { label: "Negotiate / relocate", icon: "🤝", cashΔ: -1000, creditΔ: 0, happyΔ: -8, outcome: "Saves ₹3K/month vs EMI. Keeps options open. Valid if FOIR is already stressed." },
    ]},
    { emoji: "📊", title: "Tax-Saving Window", cat: "Tax Planning", desc: "March 31 approaches. You can invest ₹1.5L in ELSS for 80C benefit.", choices: [
      { label: "Invest ₹1.5L ELSS", icon: "📉", cashΔ: -150000, creditΔ: 0, happyΔ: +16, outcome: "Saves ~₹46K in taxes (30% bracket). 3-year lock-in builds discipline. Equity returns beat FD." },
      { label: "Skip this year", icon: "😴", cashΔ: 0, creditΔ: 0, happyΔ: -6, outcome: "₹46K in tax savings permanently lost. Procrastination in tax planning is just volunteering to pay more." },
    ]},
    { emoji: "👔", title: "Competing Job Offer", cat: "Career", desc: "Rival firm offers 35% salary hike. Current employer offers 12% retention hike.", choices: [
      { label: "Accept new offer", icon: "💼", cashΔ: +18000, creditΔ: +5, happyΔ: +28, outcome: "Income surge improves all financial ratios. Higher salary = better loan eligibility and investment capacity." },
      { label: "Stay for 12% hike", icon: "🤝", cashΔ: +6000, creditΔ: 0, happyΔ: +12, outcome: "Lower risk, some gain. Comfortable but remember: the market pays your true worth, not your loyalty." },
    ]},
  ];

  const handle = (choice) => {
    const ng = { ...gs, cash: gs.cash + choice.cashΔ, credit: gs.credit + choice.creditΔ, happy: Math.max(0, Math.min(100, gs.happy + choice.happyΔ)), month: gs.month + 1, streak: choice.creditΔ >= 0 ? gs.streak + 1 : 0 };
    setResult(choice);
    const newAch = [...ach];
    if (ng.credit >= 800 && !ach.includes("🏆 Credit Master")) newAch.push("🏆 Credit Master");
    if (ng.streak >= 3 && !ach.includes("🔥 On a Roll")) newAch.push("🔥 On a Roll");
    if (ng.cash >= user.salary * 8 && !ach.includes("💰 Cash King")) newAch.push("💰 Cash King");
    setAch(newAch);
    setTimeout(() => {
      setResult(null);
      setGs(ng);
      if (ng.credit < 300) { setOver({ win: false, reason: "Credit score collapsed below 300. Consistent defaults destroy financial credibility and access to capital." }); return; }
      if (ng.cash < 0) { setOver({ win: false, reason: "Ran out of liquidity. Even high earners can become insolvent without proper cash flow management." }); return; }
      if (idx + 1 >= scenarios.length) { setOver({ win: true, ...ng }); return; }
      setIdx(i => i + 1);
    }, 2500);
  };

  const reset = () => { setGs(init); setIdx(0); setOver(null); setResult(null); setAch([]); };

  const grade = () => {
    if (!over) return "";
    const s = over.credit + (over.cash / 8000) + over.happy;
    return s > 1100 ? "S" : s > 900 ? "A" : s > 750 ? "B" : s > 600 ? "C" : "D";
  };

  const bars = [
    { label: "Cash", val: gs.cash, max: user.salary * 6, color: T.primary, display: fmtK(gs.cash) },
    { label: "CIBIL", val: gs.credit, max: 900, color: gs.credit >= 700 ? T.blue : T.danger, display: String(gs.credit) },
    { label: "Happiness", val: gs.happy, max: 100, color: T.gold, display: gs.happy + "%" },
  ];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }} className="anim-in">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800 }}>Financial Crossroads</h2>
        <p style={{ color: T.textSub, fontSize: 14, marginTop: 6 }}>Real decisions. Real consequences. One wrong move can spiral.</p>
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {bars.map((b, i) => (
          <div key={i} className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: 0.8 }}>{b.label}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.display}</span>
            </div>
            <div style={{ height: 5, borderRadius: 5, background: T.border }}>
              <div className="game-bar" style={{ width: `${Math.max(2, Math.min(100, (b.val / b.max) * 100))}%`, background: `linear-gradient(to right,${b.color}88,${b.color})` }}/>
            </div>
          </div>
        ))}
      </div>

      {ach.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {ach.map(a => <span key={a} className="tag" style={{ background: T.goldDim, color: T.gold, animation: "fadeUp 0.3s ease" }}>{a}</span>)}
        </div>
      )}

      {over ? (
        <div className="panel card-anim" style={{ padding: 48, textAlign: "center", borderColor: over.win ? T.primary : T.danger }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{over.win ? "🎊" : "💀"}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: over.win ? T.primary : T.danger }}>
            {over.win ? "Year Complete!" : "Game Over"}
          </h2>
          {over.win ? (
            <>
              <div className="mono" style={{ fontSize: 80, fontWeight: 800, color: T.primary, margin: "12px 0", lineHeight: 1 }}>{grade()}</div>
              <p style={{ color: T.textSub, fontSize: 14 }}>CIBIL {over.credit} · Cash {fmtK(over.cash)} · Happiness {over.happy}%</p>
            </>
          ) : (
            <p style={{ color: T.textSub, marginTop: 12, lineHeight: 1.7, maxWidth: 420, margin: "12px auto 0", fontSize: 14 }}>{over.reason}</p>
          )}
          <button className="btn-p" onClick={reset} style={{ marginTop: 28 }}>Play Again</button>
        </div>
      ) : result ? (
        <div className="panel anim-in" style={{ padding: 36, textAlign: "center", borderColor: result.creditΔ >= 0 ? T.primary : T.danger }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{result.creditΔ >= 0 ? "✅" : "⚠️"}</div>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: result.creditΔ >= 0 ? T.primary : T.gold }}>{result.creditΔ >= 0 ? "Smart Move!" : "Risky Choice!"}</h3>
          <p style={{ color: T.textSub, marginTop: 12, lineHeight: 1.7, fontSize: 14, maxWidth: 460, margin: "12px auto 0" }}>{result.outcome}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
            {result.cashΔ !== 0 && <span className="tag" style={{ background: result.cashΔ > 0 ? T.primaryDim : T.dangerDim, color: result.cashΔ > 0 ? T.primary : T.danger }}>Cash {result.cashΔ > 0 ? "+" : ""}{fmtK(result.cashΔ)}</span>}
            {result.creditΔ !== 0 && <span className="tag" style={{ background: result.creditΔ > 0 ? T.blueDim : T.dangerDim, color: result.creditΔ > 0 ? T.blue : T.danger }}>CIBIL {result.creditΔ > 0 ? "+" : ""}{result.creditΔ}</span>}
            {result.happyΔ !== 0 && <span className="tag" style={{ background: T.goldDim, color: T.gold }}>Mood {result.happyΔ > 0 ? "+" : ""}{result.happyΔ}%</span>}
          </div>
        </div>
      ) : (
        <div className="panel card-anim" style={{ overflow: "hidden" }}>
          <div style={{ height: 3, background: T.border }}>
            <div style={{ height: "100%", width: `${((idx + 1) / scenarios.length) * 100}%`, background: `linear-gradient(to right,${T.primary},${T.blue})`, transition: "width 0.4s ease" }}/>
          </div>
          <div style={{ padding: 36 }}>
            <div className="responsive-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <span className="tag" style={{ background: T.primaryDim, color: T.primary }}>Month {gs.month} · Scenario {idx + 1}/{scenarios.length}</span>
              <span className="tag" style={{ background: T.blueDim, color: T.blue }}>{scenarios[idx].cat}</span>
            </div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 58, marginBottom: 12 }}>{scenarios[idx].emoji}</div>
              <h3 style={{ fontSize: 24, fontWeight: 800 }}>{scenarios[idx].title}</h3>
              <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.7, marginTop: 10, maxWidth: 480, margin: "10px auto 0" }}>{scenarios[idx].desc}</p>
            </div>
            <div className="game-btn-container" style={{ display: "flex", gap: 14 }}>
              {scenarios[idx].choices.map((c, i) => (
                <button key={i} className="game-btn" onClick={() => handle(c)}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 10 }}>{c.label}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {c.cashΔ !== 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: c.cashΔ > 0 ? T.primaryDim : T.dangerDim, color: c.cashΔ > 0 ? T.primary : T.danger }}>{c.cashΔ > 0 ? "+" : ""}{fmtK(c.cashΔ)}</span>}
                    {c.creditΔ !== 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: c.creditΔ > 0 ? T.blueDim : T.dangerDim, color: c.creditΔ > 0 ? T.blue : T.danger }}>CIBIL {c.creditΔ > 0 ? "+" : ""}{c.creditΔ}</span>}
                    {c.happyΔ !== 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: T.goldDim, color: T.gold }}>😊 {c.happyΔ > 0 ? "+" : ""}{c.happyΔ}%</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKETS
// ─────────────────────────────────────────────────────────────────────────────
const Markets = ({ user }) => {
  const [filter, setFilter] = useState("All");
  const [sel, setSel] = useState(null);

  const lenders = [
    { id: 1, logo: "🏦", name: "HDFC Bank", type: "Personal", rate: 10.5, max: 4000000, speed: "24 hrs", minCibil: 700, minSalary: 25000, score: 94 },
    { id: 2, logo: "🏛", name: "SBI Home Loan", type: "Home", rate: 8.4, max: 50000000, speed: "5 days", minCibil: 650, minSalary: 30000, score: 97 },
    { id: 3, logo: "⚡", name: "Bajaj Finserv", type: "Personal", rate: 11.9, max: 2500000, speed: "2 hrs", minCibil: 640, minSalary: 15000, score: 86 },
    { id: 4, logo: "🔷", name: "ICICI Bank", type: "Personal", rate: 10.75, max: 3000000, speed: "48 hrs", minCibil: 720, minSalary: 30000, score: 91 },
    { id: 5, logo: "🏠", name: "LIC Housing", type: "Home", rate: 8.65, max: 30000000, speed: "7 days", minCibil: 660, minSalary: 35000, score: 93 },
    { id: 6, logo: "🔶", name: "Axis Bank", type: "Car", rate: 9.2, max: 2000000, speed: "24 hrs", minCibil: 700, minSalary: 20000, score: 89 },
    { id: 7, logo: "🚀", name: "KreditBee", type: "Personal", rate: 17.0, max: 400000, speed: "10 min", minCibil: 580, minSalary: 10000, score: 71 },
  ];

  const getElig = (l) => {
    if (user.cibil < l.minCibil) return { pct: 15, label: "Not Eligible", color: T.danger };
    if (user.salary < l.minSalary) return { pct: 35, label: "Low Income", color: T.danger };
    const cf = Math.min(100, ((user.cibil - l.minCibil) / (900 - l.minCibil)) * 100);
    const sf = Math.min(100, ((user.salary - l.minSalary) / (200000 - l.minSalary)) * 100);
    const pct = Math.round(cf * 0.6 + sf * 0.4);
    return { pct, label: pct > 80 ? "High Eligible" : pct > 55 ? "Eligible" : "Low Eligible", color: pct > 80 ? T.primary : pct > 55 ? T.gold : T.danger };
  };

  const filtered = filter === "All" ? lenders : lenders.filter(l => l.type === filter);
  const selected = sel || filtered[0];
  const elig = getElig(selected);
  const rateData = lenders.map(l => ({ name: l.name.split(" ")[0], rate: l.rate }));

  return (
    <div className="anim-in">
      <div className="responsive-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>Market Hub</h2>
          <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Compare lenders · Check eligibility · Find best rates</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", "Personal", "Home", "Car"].map(t => <button key={t} className={`chip ${filter === t ? "on" : ""}`} onClick={() => { setFilter(t); setSel(null); }}>{t}</button>)}
        </div>
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, marginBottom: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(l => {
            const e = getElig(l);
            return (
              <div key={l.id} onClick={() => setSel(l)} className="panel" style={{ padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, borderLeft: selected?.id === l.id ? `3px solid ${T.primary}` : "1px solid transparent" }}>
                <div style={{ fontSize: 26, width: 38, textAlign: "center" }}>{l.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                    <span className="tag" style={{ background: T.border, color: T.textSub, fontSize: 10 }}>{l.type}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: l.rate < 10 ? T.primary : l.rate < 13 ? T.gold : T.danger }}>{l.rate}%</span>
                    <span style={{ fontSize: 12, color: T.textSub, alignSelf: "center" }}>p.a. · {l.speed}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <div style={{ fontSize: 11, color: e.color, fontWeight: 600 }}>{e.label}</div>
                  <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: T.border }}>
                    <div style={{ width: `${e.pct}%`, height: "100%", borderRadius: 4, background: e.color, transition: "width 0.4s" }}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel" style={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 38, marginBottom: 8 }}>{selected.logo}</div>
            <h3 style={{ fontWeight: 800, fontSize: 19 }}>{selected.name}</h3>
            <span className="tag" style={{ background: T.blueDim, color: T.blue, marginTop: 8, display: "inline-block" }}>{selected.type} Loan</span>
          </div>
          <div className="panel-flat" style={{ padding: 18, marginBottom: 16 }}>
            {[
              { l: "Interest Rate", v: `${selected.rate}% p.a.`, c: T.primary },
              { l: "Max Loan Amount", v: fmtK(selected.max), c: T.text },
              { l: "Processing Speed", v: selected.speed, c: T.blue },
              { l: "Min. CIBIL Required", v: String(selected.minCibil), c: T.text },
              { l: "Min. Monthly Salary", v: fmt(selected.minSalary), c: T.text },
              { l: "Lender Score", v: `${selected.score}/100`, c: T.gold },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 5 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ fontSize: 12, color: T.textSub }}>{r.l}</span>
                <span className="mono" style={{ fontWeight: 700, color: r.c, fontSize: 12 }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.textSub }}>Your Eligibility</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: elig.color }}>{elig.pct}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 7, background: T.border }}>
              <div style={{ width: `${elig.pct}%`, height: "100%", borderRadius: 7, background: elig.color, transition: "width 0.6s ease", boxShadow: `0 0 8px ${elig.color}66` }}/>
            </div>
          </div>
          <button className="btn-p" style={{ width: "100%", fontSize: 14 }}>Apply for Pre-Approval →</button>
        </div>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Interest Rate Comparison Across Lenders</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={rateData} barSize={30}>
            <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false}/>
            <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis domain={[6, 20]} tickFormatter={v => `${v}%`} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip formatter={v => [`${v}%`, "Rate"]} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }}/>
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {rateData.map((e, i) => <Cell key={i} fill={e.rate < 10 ? T.primary : e.rate < 13 ? T.gold : T.danger}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI ADVISOR — Gemini Powered
// ─────────────────────────────────────────────────────────────────────────────
const AIAdvisor = ({ user }) => {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: `Hi ${user.name.split(" ")[0]}! I'm your AI Wealth Manager.\n\nProfile loaded: CIBIL ${user.cibil} · Income ${fmt(user.salary)}/mo · Goal: ${user.goal}\n\nI'll give you blunt, math-driven financial advice. No fluff. What do you want to optimize?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const prompts = ["Can I afford a home loan?", "How to boost my CIBIL fast?", "Best investment for my income?", "When can I retire early?", "How to become debt-free?"];

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const updated = [...msgs, { role: "user", content: msg }];
    setMsgs(updated);
    setLoading(true);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60);

    const systemPrompt = `You are a ruthlessly honest Indian financial advisor in the CrediCoach app.
Client: ${user.name}, Age ${user.age}, Salary ₹${user.salary}/mo, EMIs ₹${user.currentEmi}/mo, CIBIL ${user.cibil}, Goal: ${user.goal}.
Free cashflow estimate: ₹${Math.max(0, user.salary - user.currentEmi - Math.round(user.salary * 0.35))}/mo.

Rules:
- Use real numbers from their profile in every response
- Be direct. No emotional padding. No "great question!"
- Call out bad financial behavior clearly when relevant
- Use Indian financial context: RBI, SEBI, CIBIL, INR, 80C, FOIR, FD rates, NPS
- Max 4-5 bullet points or numbered items per response
- Lead with the most important insight
- If asked about loans, calculate FOIR impact for them`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            ...updated.slice(1).map(m => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            }))
          ],
          max_tokens: 800,
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Groq API Error:", err);
        setMsgs([...updated, { role: "assistant", content: `Error: ${err.error?.message || "Something went wrong. Try again."}` }]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "No response received.";
      setMsgs([...updated, { role: "assistant", content: reply }]);

    } catch (e) {
      console.error("Fetch Error:", e);
      setMsgs([...updated, { role: "assistant", content: "Network error. Please try again." }]);
    }

    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const renderMsg = (text) => text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 6 }}/>;
    const isBullet = /^[-•*]/.test(line.trim());
    const isNum = /^\d+\./.test(line.trim());
    const isHeader = /^\*\*/.test(line.trim()) && line.endsWith("**");
    const clean = line.replace(/^\s*[-•*]\s*/, "").replace(/\*\*/g, "");
    if (isHeader) return <div key={i} style={{ fontWeight: 700, color: T.text, marginTop: 6, marginBottom: 2, fontSize: 14 }}>{clean}</div>;
    if (isBullet) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}><span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>▸</span><span style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6 }}>{clean}</span></div>;
    if (isNum) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}><span className="mono" style={{ color: T.blue, flexShrink: 0, fontSize: 13, marginTop: 1 }}>{line.match(/^\d+/)[0]}.</span><span style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6 }}>{line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "")}</span></div>;
    return <div key={i} style={{ fontSize: 14, color: T.textSub, lineHeight: 1.65 }}>{clean}</div>;
  });

  return (
    <div className="anim-in" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Wealth Manager AI</h2>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Powered by Groq · Personalized to your financial profile</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {prompts.map((p, i) => <button key={i} className="chip" style={{ fontSize: 12 }} onClick={() => send(p)}>{p}</button>)}
      </div>
      <div className="panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} className="anim-up" style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", animationDelay: "0s" }}>
              {m.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <Logo size={18}/>
                  <span style={{ fontSize: 11, color: T.primary, fontWeight: 600, letterSpacing: 0.5 }}>WEALTH AI</span>
                </div>
              )}
              <div style={{ maxWidth: "82%", padding: "14px 18px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", background: m.role === "user" ? T.primaryDim : "rgba(255,255,255,0.03)", border: `1px solid ${m.role === "user" ? "rgba(0,255,135,0.18)" : T.border}` }}>
                {renderMsg(m.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logo size={18}/>
              <span style={{ fontSize: 13, color: T.primary, animation: "pulse 1.4s infinite" }}>Analyzing your profile...</span>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 18px", display: "flex", gap: 10, background: "rgba(0,0,0,0.2)" }}>
          <input className="inp" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about your finances..."/>
          <button className="btn-p" onClick={() => send()} disabled={loading} style={{ padding: "0 22px", whiteSpace: "nowrap", fontSize: 14 }}>{loading ? "..." : "Send →"}</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [emiParams, setEmiParams] = useState({ principal: 500000, rate: 10.5, tenure: 60 });
  const [navOpen, setNavOpen] = useState(false); 

  useEffect(() => { injectStyles(); }, []);

  if (!user) return <AuthScreen onLogin={(u) => { injectStyles(); setUser(u); }}/>;

  const nav = [
    { id: "overview", icon: "⊞", label: "Dashboard" },
    { id: "emi", icon: "⌗", label: "EMI Calculator" },
    { id: "markets", icon: "📊", label: "Markets" },
    { id: "game", icon: "🃏", label: "Game" },
    { id: "ai", icon: "✦", label: "Wealth AI" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>
      
      {/* Mobile Dimmed Overlay */}
      <div className={`nav-overlay ${navOpen ? "show" : ""}`} onClick={() => setNavOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 38 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={30}/>
            <div>
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 17, fontWeight: 800 }}>CrediCoach</div>
              <div style={{ fontSize: 9, color: T.textSub, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Developed by Divakar</div>
            </div>
          </div>
          {/* Close button inside sidebar on mobile */}
          <button className="mobile-close-btn" onClick={() => setNavOpen(false)} style={{ background: "none", border: "none", color: T.textSub, fontSize: 24, cursor: "pointer", display: "none" }}>×</button>
        </div>

        <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 8px", marginBottom: 10 }}>Navigation</div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {nav.map(n => (
            <div key={n.id} onClick={() => { setTab(n.id); setNavOpen(false); }} className={`nav-item ${tab === n.id ? "active" : ""}`}>
              <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>{n.icon}</span>
              <span>{n.label}</span>
              {tab === n.id && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: T.primary, boxShadow: `0 0 6px ${T.primary}` }}/>}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18, marginTop: 12 }}>
          <div style={{ padding: "0 8px", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{user.name.split(" ")[0]}</div>
            <div style={{ fontSize: 11, color: T.textSub, marginTop: 2 }}>{user.email}</div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "10px", background: T.primaryDim, borderRadius: 10, marginBottom: 12, border: `1px solid rgba(0,255,135,0.12)` }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{user.cibil}</div>
              <div style={{ fontSize: 9, color: T.textSub, letterSpacing: 0.5 }}>CIBIL</div>
            </div>
            <div style={{ width: 1, background: T.border }}/>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: T.blue }}>{fmtK(user.salary)}</div>
              <div style={{ fontSize: 9, color: T.textSub, letterSpacing: 0.5 }}>SALARY</div>
            </div>
          </div>
          <button onClick={() => setUser(null)} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 8px", display: "block", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = T.danger} onMouseOut={e => e.target.style.color = T.textMuted}>← Sign Out</button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Mobile Top Navigation Bar */}
        <div className="mobile-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={24}/>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800 }}>CrediCoach</div>
          </div>
          <button onClick={() => setNavOpen(true)} style={{ background: "none", border: "none", color: T.text, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}>
            ⋮
          </button>
        </div>

        {/* Main scrollable content */}
        <div className="main-area">
          {tab === "overview" && <Overview user={user}/>}
          {tab === "emi" && <EMICalc params={emiParams} setParams={setEmiParams} user={user}/>}
          {tab === "markets" && <Markets user={user}/>}
          {tab === "game" && <FinancialGame user={user}/>}
          {tab === "ai" && <AIAdvisor user={user}/>}
        </div>
        
      </div>
    </div>
  );
}