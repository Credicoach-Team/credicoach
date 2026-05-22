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

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENT STORAGE
// ─────────────────────────────────────────────────────────────────────────────
const Storage = {
  getUsers: () => {
    try { return JSON.parse(localStorage.getItem("cc_users") || "{}"); } catch { return {}; }
  },
  saveUser: (user) => {
    try {
      const users = Storage.getUsers();
      users[user.email] = user;
      localStorage.setItem("cc_users", JSON.stringify(users));
    } catch {}
  },
  getUser: (email) => {
    try { return Storage.getUsers()[email] || null; } catch { return null; }
  },
  getExpenses: (email) => {
    try {
      const all = JSON.parse(localStorage.getItem("cc_expenses") || "{}");
      return all[email] || [];
    } catch { return []; }
  },
  saveExpenses: (email, expenses) => {
    try {
      const all = JSON.parse(localStorage.getItem("cc_expenses") || "{}");
      all[email] = expenses;
      localStorage.setItem("cc_expenses", JSON.stringify(all));
    } catch {}
  },
};

const fmt = (v) => "₹" + Math.abs(Math.round(v)).toLocaleString("en-IN");
const fmtK = (v) => v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : fmt(v);

// ─────────────────────────────────────────────────────────────────────────────
// STYLE INJECTION
// ─────────────────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("cc-v3")) return;
  const s = document.createElement("style");
  s.id = "cc-v3";
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
    input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
    input[type=number] { -moz-appearance:textfield; }
    .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
    .table-row:hover { background:rgba(255,255,255,0.025); }
    .game-bar { height:6px; border-radius:6px; transition:width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
    .game-btn { flex:1; padding:18px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); color:#EEF2FF; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; text-align:left; line-height:1.5; min-width:0; }
    .game-btn:hover { border-color:#00FF87; background:rgba(0,255,135,0.07); transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
    .card-anim { animation:slideIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-up { animation:fadeUp 0.4s ease both; }
    .anim-in { animation:fadeIn 0.35s ease both; }
    .tag { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600; letter-spacing:0.3px; text-transform:uppercase; }
    .exp-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
    .exp-row:hover { background:rgba(255,255,255,0.02); border-radius:8px; padding:12px 8px; }
    .mobile-topbar { display:none; padding:14px 20px; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(3,7,15,0.92); position:sticky; top:0; z-index:90; backdrop-filter:blur(24px); }
    .sidebar { width:236px; padding:26px 14px; display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.07); background:rgba(3,7,15,0.92); backdrop-filter:blur(24px); height:100vh; z-index:100; transition:transform 0.3s cubic-bezier(0.4,0,0.2,1); flex-shrink:0; }
    .main-area { flex:1; padding:44px 52px; overflow-y:auto; overflow-x:hidden; height:100vh; display:flex; flex-direction:column; }
    .nav-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:95; backdrop-filter:blur(4px); opacity:0; transition:opacity 0.3s; pointer-events:none; }
    .nav-overlay.show { display:block; opacity:1; pointer-events:all; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:22px; }
    .two-col { display:grid; grid-template-columns:1.9fr 1fr; gap:20px; margin-bottom:20px; }
    .three-col { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .two-col-eq { display:grid; grid-template-columns:1fr 1fr; gap:22px; }
    .four-col { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .game-btn-row { display:flex; gap:14px; }
    .sip-grid { display:grid; grid-template-columns:1.2fr 1fr; gap:22px; }
    .mkt-grid { display:grid; grid-template-columns:1.5fr 1fr; gap:22px; margin-bottom:22px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:28px; flex-wrap:wrap; gap:14px; }

    @media (max-width:900px) {
      .mobile-topbar { display:flex; }
      .sidebar { position:fixed; left:0; top:0; transform:translateX(-100%); }
      .sidebar.open { transform:translateX(0); box-shadow:10px 0 40px rgba(0,0,0,0.8); }
      .main-area { padding:20px 16px; height:calc(100vh - 65px); }
      .stats-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
      .two-col { grid-template-columns:1fr; }
      .three-col { grid-template-columns:1fr; }
      .two-col-eq { grid-template-columns:1fr; }
      .four-col { grid-template-columns:repeat(2,1fr); }
      .game-btn-row { flex-direction:column; }
      .sip-grid { grid-template-columns:1fr; }
      .mkt-grid { grid-template-columns:1fr; }
      .page-header { flex-direction:column; align-items:flex-start; }
      .hide-mobile { display:none !important; }
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
        <stop stopColor="#00FF87"/><stop offset="1" stopColor="#00CFFF"/>
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
    const start = Date.now(), dur = 900;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [to]);
  return <span className="mono">{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// CIBIL GAUGE
// ─────────────────────────────────────────────────────────────────────────────
const CibilGauge = ({ score }) => {
  const pct = Math.max(0, Math.min(1, (score - 300) / 600));
  const color = score >= 750 ? T.primary : score >= 650 ? T.gold : T.danger;
  const label = score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Poor";
  const cx = 80, cy = 75, r = 58;
  const toXY = (deg) => { const rad = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; };
  const arcD = (from, to) => { const [x1,y1]=toXY(from); const [x2,y2]=toXY(to); return `M ${x1} ${y1} A ${r} ${r} 0 ${(to-from)>180?1:0} 1 ${x2} ${y2}`; };
  const startA = -210, sweep = 240;
  return (
    <svg width="160" height="110" viewBox="0 0 160 110">
      <path d={arcD(startA, startA+sweep)} stroke={T.border} strokeWidth="7" fill="none" strokeLinecap="round"/>
      {pct > 0.01 && <path d={arcD(startA, startA+pct*sweep)} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" style={{transition:"all 0.8s ease",filter:`drop-shadow(0 0 6px ${color})`}}/>}
      <text x="80" y="70" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="JetBrains Mono">{score}</text>
      <text x="80" y="88" textAnchor="middle" fill={T.textSub} fontSize="11" fontFamily="DM Sans">{label}</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH RING
// ─────────────────────────────────────────────────────────────────────────────
const HealthRing = ({ score, size = 80 }) => {
  const r = size/2 - 9, circ = 2*Math.PI*r;
  const color = score > 72 ? T.primary : score > 48 ? T.gold : T.danger;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",filter:`drop-shadow(0 0 5px ${color})`}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span className="mono" style={{fontSize:size>80?18:15,fontWeight:700,color}}>{score}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", email:"", password:"", salary:"", numEmis:"", currentEmi:"", cibil:"", age:"", goal:"Wealth Accumulation" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { injectStyles(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        const u = Storage.getUser(form.email);
        if (!u || u.password !== form.password) return setError("Invalid credentials.");
        onLogin(u);
      } else if (step === 1) {
        if (!form.name || !form.email || !form.password) return setError("All fields required.");
        if (form.password.length < 6) return setError("Password must be 6+ characters.");
        if (Storage.getUser(form.email)) return setError("Email already registered. Sign in instead.");
        setStep(2);
      } else {
        if (!form.salary || !form.cibil || !form.age) return setError("Complete all profile fields.");
        const cibil = Math.min(900, Math.max(300, +form.cibil || 700));
        const user = { ...form, id: Date.now(), salary: +form.salary, currentEmi: +form.currentEmi || 0, cibil, age: +form.age || 25 };
        Storage.saveUser(user);
        setMode("login"); setStep(1);
        setError("✅ Account created! Please sign in.");
      }
    }, 450);
  };

  const goals = ["Buy a House","Buy a Car","Become Debt Free","Wealth Accumulation","Start a Business","Early Retirement"];
  const isSuccess = error.includes("✅");

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:T.bg}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(0,255,135,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.025) 1px,transparent 1px)`,backgroundSize:"56px 56px"}}/>
      <div className="orb" style={{width:550,height:550,background:"radial-gradient(circle,rgba(0,255,135,0.06),transparent 70%)",top:"-15%",left:"-8%",animation:"orb1 18s infinite ease-in-out"}}/>
      <div className="orb" style={{width:400,height:400,background:"radial-gradient(circle,rgba(56,189,248,0.06),transparent 70%)",bottom:"-10%",right:"-5%",animation:"orb2 14s infinite ease-in-out"}}/>
      <div className="panel" style={{position:"relative",zIndex:10,width:"100%",maxWidth:480,padding:"44px 40px",margin:20}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <Logo size={52}/>
          <h1 style={{marginTop:16,fontSize:30,fontWeight:800,background:"linear-gradient(to right,#00FF87,#38BDF8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CrediCoach</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:6}}>Intelligent Wealth Management Platform</p>
        </div>
        {mode==="register" && (
          <div style={{display:"flex",gap:8,marginBottom:28}}>
            {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:3,background:step>=s?T.primary:T.border,transition:"background 0.35s"}}/>)}
          </div>
        )}
        {error && <div style={{background:isSuccess?T.primaryDim:T.dangerDim,border:`1px solid ${isSuccess?T.primary:T.danger}`,borderRadius:10,padding:"11px 16px",color:isSuccess?T.primary:T.danger,marginBottom:20,fontSize:13,animation:"shake 0.35s ease"}}>{error}</div>}
        {mode==="login" ? (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <input className="inp" placeholder="Email address" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/>
            <input className="inp" placeholder="Password" type="password" value={form.password} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            <button className="btn-p" onClick={submit} disabled={loading} style={{width:"100%",marginTop:4}}>{loading?"Authenticating...":"Access Dashboard →"}</button>
          </div>
        ) : step===1 ? (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <input className="inp" placeholder="Full Name" value={form.name} onChange={e=>set("name",e.target.value)}/>
            <input className="inp" placeholder="Email address" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/>
            <input className="inp" placeholder="Password (min. 6 chars)" type="password" value={form.password} onChange={e=>set("password",e.target.value)}/>
            <button className="btn-p" onClick={submit} disabled={loading} style={{width:"100%",marginTop:4}}>{loading?"Processing...":"Continue to Profile →"}</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <input className="inp" placeholder="Age" type="number" value={form.age} onChange={e=>set("age",e.target.value)}/>
              <input className="inp" placeholder="CIBIL Score (300–900)" type="number" value={form.cibil} onChange={e=>set("cibil",e.target.value)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <input className="inp" placeholder="Monthly Salary ₹" type="number" value={form.salary} onChange={e=>set("salary",e.target.value)}/>
              <input className="inp" placeholder="Number of EMIs" type="number" value={form.numEmis} onChange={e=>set("numEmis",e.target.value)}/>
            </div>
            {Number(form.numEmis)>0 && <input className="inp anim-in" placeholder="Total Monthly EMI ₹" type="number" value={form.currentEmi} onChange={e=>set("currentEmi",e.target.value)}/>}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:4}}>
              {goals.map(g=><button key={g} className={`chip ${form.goal===g?"on":""}`} onClick={()=>set("goal",g)} style={{fontSize:11,padding:"7px 8px"}}>{g}</button>)}
            </div>
            <button className="btn-p" onClick={submit} disabled={loading} style={{width:"100%",marginTop:4}}>{loading?"Creating Profile...":"Create Account →"}</button>
          </div>
        )}
        <p style={{textAlign:"center",marginTop:24,fontSize:13,color:T.textMuted}}>
          <span style={{cursor:"pointer",color:T.primary}} onClick={()=>{setMode(mode==="login"?"register":"login");setStep(1);setError("");}}>
            {mode==="login"?"New here? Create an account":"Have an account? Sign in"}
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
  const cibilPts = Math.round((Math.max(0,user.cibil-300)/600)*40);
  const foirPts = Math.round((1-Math.min(foir,1))*30);
  const netPts = net>0?Math.min(20,Math.round((net/user.salary)*40)):0;
  const agePts = user.age<30?10:user.age<40?8:5;
  const healthScore = Math.min(100,cibilPts+foirPts+netPts+agePts);

  const projection = Array.from({length:7},(_,i)=>({
    m:["Now","1M","2M","3M","4M","5M","6M"][i],
    wealth:Math.max(0,Math.round(net*i*1.007)),
    target:Math.round(user.salary*i*0.25),
  }));

  const expPie = [
    {name:"EMIs",value:user.currentEmi,color:T.danger},
    {name:"Living",value:expenses,color:T.blue},
    {name:"Free Cash",value:Math.max(0,net),color:T.primary},
  ];

  const cards = [
    {label:"Monthly Income",val:user.salary,color:T.primary,icon:"💰",note:"Total inflow"},
    {label:"Active EMIs",val:user.currentEmi,color:T.danger,icon:"📤",note:`${Math.round(foir*100)}% of income`},
    {label:"Free Cashflow",val:Math.abs(net),color:net>=0?T.primary:T.danger,icon:net>=0?"📈":"📉",note:net>=0?"Healthy surplus":"Deficit!"},
    {label:"CIBIL Score",val:user.cibil,color:user.cibil>=750?T.primary:user.cibil>=650?T.gold:T.danger,icon:"🏆",note:user.cibil>=750?"Excellent":user.cibil>=650?"Fair":"Needs work"},
  ];

  const tips = [
    net<0&&{t:"danger",i:"🚨",txt:"Your EMIs exceed safe FOIR limits (40%). Consider loan restructuring immediately."},
    user.cibil<700&&{t:"warn",i:"⚡",txt:"Pay every EMI on time for 6 months. Even one missed payment can drop CIBIL by 50+ pts."},
    foir>0.45&&{t:"warn",i:"⚠️",txt:`FOIR at ${Math.round(foir*100)}%. Most lenders cap at 40–50%. New loan approval risk is high.`},
    net>0&&user.cibil>=750&&{t:"good",i:"✅",txt:"Profile qualifies for premium rates. HDFC/SBI will likely offer sub-9% on home loans."},
    net>5000&&{t:"info",i:"💡",txt:`Investing ${fmtK(net*0.5)}/mo in Nifty 50 index funds could build ₹1Cr in ~${Math.round(100/(net*0.5/user.salary*2))} years.`},
  ].filter(Boolean).slice(0,3);

  const tipColors = {danger:T.danger,warn:T.gold,good:T.primary,info:T.blue};

  return (
    <div className="anim-in">
      <div className="page-header">
        <div>
          <p style={{fontSize:13,color:T.textSub,marginBottom:6}}>Good day,</p>
          <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.15}}>{user.name.split(" ")[0]}</h1>
          <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{color:T.textSub,fontSize:13}}>Goal:</span>
            <span className="tag" style={{background:T.blueDim,color:T.blue}}>{user.goal}</span>
          </div>
        </div>
        <div className="panel" style={{padding:"18px 24px",display:"flex",alignItems:"center",gap:20}}>
          <HealthRing score={healthScore} size={88}/>
          <div>
            <div style={{fontSize:11,color:T.textSub,textTransform:"uppercase",letterSpacing:1}}>Financial Health</div>
            <div style={{fontSize:18,fontWeight:700,marginTop:4,color:healthScore>72?T.primary:healthScore>48?T.gold:T.danger}}>{healthScore>72?"Strong":healthScore>48?"Moderate":"At Risk"}</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>Score out of 100</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((c,i)=>(
          <div key={i} className="panel anim-up" style={{padding:"20px 22px",animationDelay:`${i*0.07}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span style={{fontSize:11,color:T.textSub,textTransform:"uppercase",letterSpacing:0.6,fontWeight:500}}>{c.label}</span>
              <span style={{fontSize:22}}>{c.icon}</span>
            </div>
            <div className="mono" style={{fontSize:24,fontWeight:700,color:c.color,marginTop:14}}>₹<Counter to={c.val}/></div>
            <div style={{fontSize:12,color:T.textSub,marginTop:6}}>{c.note}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="panel" style={{padding:26}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:15,fontWeight:700}}>Wealth Projection</div>
              <div style={{fontSize:12,color:T.textSub,marginTop:3}}>6-month forecast at 8.4% annual returns</div>
            </div>
            <span className="tag" style={{background:T.primaryDim,color:T.primary}}>LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={projection} margin={{top:4,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.28}/><stop offset="100%" stopColor={T.primary} stopOpacity={0}/></linearGradient>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.2}/><stop offset="100%" stopColor={T.blue} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false}/>
              <XAxis dataKey="m" tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,n)=>[fmtK(v),n]} contentStyle={{background:"rgba(3,7,15,0.95)",border:`1px solid ${T.border}`,borderRadius:8,fontSize:13}}/>
              <Area type="monotone" dataKey="wealth" stroke={T.primary} fill="url(#wGrad)" strokeWidth={2.5} name="Projected"/>
              <Area type="monotone" dataKey="target" stroke={T.blue} fill="url(#tGrad)" strokeWidth={2} strokeDasharray="5 3" name="Target"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="panel" style={{padding:22,flex:1}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Cash Breakdown</div>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={expPie} cx="50%" cy="50%" innerRadius={30} outerRadius={46} dataKey="value" stroke="none">
                  {expPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={fmt} contentStyle={{background:"rgba(3,7,15,0.95)",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:6}}>
              {expPie.map((e,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:6,height:6,borderRadius:"50%",background:e.color}}/><span style={{color:T.textSub}}>{e.name}</span></div>
                  <span className="mono" style={{fontWeight:600}}>{fmt(e.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{padding:22,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:12,color:T.textSub,marginBottom:8,textTransform:"uppercase",letterSpacing:1,alignSelf:"flex-start"}}>CIBIL Score</div>
            <CibilGauge score={user.cibil}/>
          </div>
        </div>
      </div>

      <div className="three-col">
        {tips.map((t,i)=>(
          <div key={i} className="panel anim-up" style={{padding:18,borderLeft:`3px solid ${tipColors[t.t]}`,animationDelay:`${0.35+i*0.1}s`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0}}>{t.i}</span>
              <p style={{fontSize:13,color:T.textSub,lineHeight:1.55}}>{t.txt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMI CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
const EMICalc = ({ params, setParams, user }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [prepay, setPrepay] = useState(0);

  const calcEMI = (p,r,n) => {
    p=Number(p)||0; r=Number(r)||0; n=Number(n)||1;
    const mr=r/12/100;
    if(mr===0) return p/n;
    return (p*mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1);
  };

  const p=Number(params.principal)||0, r=Number(params.rate)||0, t=Number(params.tenure)||1;
  const cEmi=params.currentEmi!==undefined?Number(params.currentEmi):(Number(user.currentEmi)||0);
  const emi=calcEMI(p,r,t), totalPay=emi*t, totalInt=Math.max(0,totalPay-p);
  const currentFoir=cEmi/user.salary, foirAfter=(cEmi+emi)/user.salary;

  const amort = useMemo(()=>{
    const mr=r/12/100; let bal=p;
    return Array.from({length:Math.min(t,24)},(_,i)=>{
      const interest=bal*mr, principal=emi-interest;
      bal=Math.max(0,bal-principal);
      return {mo:i+1,emi:Math.round(emi),principal:Math.round(principal),interest:Math.round(interest),balance:Math.round(bal)};
    });
  },[p,r,t,emi]);

  const prepayResult = useMemo(()=>{
    if(!prepay||p<=0||r<=0||t<=0) return null;
    const mr=r/12/100; let bal=p,mos=0,ti=0;
    while(bal>1&&mos<1200){const int=bal*mr;const prin=Math.min(bal,emi-int+prepay);ti+=int;bal-=prin;mos++;}
    return {months:mos,saved:Math.max(0,Math.round(totalInt-ti)),savedMonths:Math.max(0,t-mos)};
  },[p,r,t,emi,prepay,totalInt]);

  const tenures=[{l:"5 Yr",n:60},{l:"10 Yr",n:120},{l:"15 Yr",n:180},{l:"20 Yr",n:240}];
  const cmpData=tenures.map(ten=>({label:ten.l,tenure:ten.n,emi:Math.round(calcEMI(p,r,ten.n)),total:Math.round(calcEMI(p,r,ten.n)*ten.n)}));
  const pieData=[{name:"Principal",value:Math.round(p)},{name:"Interest",value:Math.round(totalInt)}];

  const renderSlider=({label,k,min,max,step,colors,prefix="",suffix="",fallback})=>{
    const rawVal=params[k]!==undefined?params[k]:(fallback!==undefined?fallback:0);
    const val=Number(rawVal)||0;
    const pct=Math.max(0,Math.min(100,((val-min)/(max-min))*100));
    return (
      <div key={k} style={{marginBottom:26}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:13,color:T.textSub,fontWeight:500}}>{label}</span>
          <div style={{display:"flex",alignItems:"center",background:"rgba(0,0,0,0.45)",border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px"}}>
            {prefix&&<span style={{color:T.textSub,fontSize:14,marginRight:6}}>{prefix}</span>}
            <input type="number" value={rawVal} onChange={e=>setParams({...params,[k]:e.target.value===""?"":Number(e.target.value)})}
              className="mono" style={{background:"transparent",border:"none",outline:"none",color:T.primary,fontSize:15,fontWeight:700,width:(k==="principal"||k==="currentEmi")?85:55,textAlign:"right"}}/>
            {suffix&&<span style={{color:T.textSub,fontSize:13,marginLeft:6}}>{suffix}</span>}
          </div>
        </div>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:4,borderRadius:4,background:T.border,transform:"translateY(-50%)"}}>
            <div style={{width:`${pct}%`,height:"100%",borderRadius:4,background:colors||`linear-gradient(to right,${T.primary},${T.blue})`,transition:"width 0.1s"}}/>
          </div>
          <input className="range-sl" type="range" min={min} max={max} step={step} value={val} onChange={e=>setParams({...params,[k]:Number(e.target.value)})}/>
        </div>
      </div>
    );
  };

  const tabs=[{id:"basic",label:"Calculator"},{id:"amortize",label:"Schedule"},{id:"prepay",label:"Prepayment"},{id:"compare",label:"Compare"}];

  return (
    <div className="anim-in">
      <div className="page-header">
        <div>
          <h2 style={{fontSize:28,fontWeight:800}}>EMI Calculator</h2>
          <p style={{color:T.textSub,fontSize:13,marginTop:4}}>EMI · Amortization · Prepayment analysis</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {tabs.map(tb=><button key={tb.id} className={`chip ${activeTab===tb.id?"on":""}`} onClick={()=>setActiveTab(tb.id)}>{tb.label}</button>)}
        </div>
      </div>

      {activeTab==="basic"&&(
        <div className="two-col-eq">
          <div className="panel" style={{padding:32}}>
            {renderSlider({label:"Loan Amount",k:"principal",prefix:"₹",min:10000,max:5000000,step:10000})}
            {renderSlider({label:"Interest Rate (p.a.)",k:"rate",suffix:"%",min:5,max:30,step:0.1,colors:`linear-gradient(to right,${T.primary},${T.gold},${T.danger})`})}
            {renderSlider({label:"Loan Tenure",k:"tenure",suffix:"mo",min:3,max:360,step:3})}
            {renderSlider({label:"Existing EMIs",k:"currentEmi",prefix:"₹",min:0,max:user.salary,step:500,colors:`linear-gradient(to right,${T.blue},${T.primary})`,fallback:Number(user.currentEmi)||0})}
            <div className="panel-flat" style={{padding:16}}>
              {[{label:"Current FOIR",val:currentFoir,color:currentFoir>0.4?T.danger:T.primary},{label:"FOIR after loan",val:foirAfter,color:foirAfter>0.5?T.danger:T.primary}].map((item,i)=>(
                <div key={i} style={{marginBottom:i===0?14:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,color:T.textSub}}>{item.label}</span>
                    <span className="mono" style={{fontWeight:700,color:item.color,fontSize:13}}>{Math.round(item.val*100)}%</span>
                  </div>
                  <div style={{height:4,borderRadius:4,background:T.border}}>
                    <div style={{width:`${Math.min(item.val*100,100)}%`,height:"100%",borderRadius:4,background:item.color,transition:"width 0.3s"}}/>
                  </div>
                </div>
              ))}
              {foirAfter>0.5&&<p style={{fontSize:11,color:T.danger,marginTop:7}}>⚠ FOIR exceeds 50% — most lenders will reject</p>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="panel" style={{padding:26,textAlign:"center"}}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={66} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                    <Cell fill={T.blue}/><Cell fill={T.primary}/>
                  </Pie>
                  <Tooltip formatter={fmt} contentStyle={{background:"rgba(3,7,15,0.95)",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{fontSize:11,color:T.textSub,letterSpacing:1,textTransform:"uppercase"}}>Monthly EMI</div>
              <div className="mono" style={{fontSize:36,fontWeight:800,color:T.primary,marginTop:6}}>{fmt(emi)}</div>
            </div>
            <div className="panel" style={{padding:20}}>
              {[{l:"Total Payable",v:fmt(totalPay),c:T.text},{l:"Principal",v:fmt(p),c:T.blue},{l:"Total Interest",v:fmt(totalInt),c:T.primary},{l:"Interest Burden",v:`${p>0?Math.round((totalInt/p)*100):0}%`,c:T.gold}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<3?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:13,color:T.textSub}}>{r.l}</span>
                  <span className="mono" style={{fontWeight:700,color:r.c,fontSize:13}}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab==="amortize"&&(
        <div className="panel" style={{padding:28}}>
          <h3 style={{fontWeight:700,fontSize:17,marginBottom:4}}>Amortization Schedule</h3>
          <p style={{fontSize:13,color:T.textSub,marginBottom:20}}>Month-by-month breakdown (first 24 months)</p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["Mo","EMI","Principal","Interest","Balance"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"right",color:T.textSub,fontWeight:600,fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap",fontFamily:"DM Sans,sans-serif"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {amort.map(r=>(
                  <tr key={r.mo} className="table-row" style={{borderBottom:`1px solid rgba(255,255,255,0.025)`}}>
                    <td className="mono" style={{padding:"10px 16px",color:T.textMuted,textAlign:"right"}}>{r.mo}</td>
                    <td className="mono" style={{padding:"10px 16px",textAlign:"right"}}>{fmt(r.emi)}</td>
                    <td className="mono" style={{padding:"10px 16px",textAlign:"right",color:T.blue}}>{fmt(r.principal)}</td>
                    <td className="mono" style={{padding:"10px 16px",textAlign:"right",color:T.primary}}>{fmt(r.interest)}</td>
                    <td className="mono" style={{padding:"10px 16px",textAlign:"right",color:T.textSub}}>{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t>24&&<p style={{fontSize:12,color:T.textMuted,marginTop:14,textAlign:"center"}}>Showing first 24 of {t} months</p>}
        </div>
      )}

      {activeTab==="prepay"&&(
        <div className="two-col-eq">
          <div className="panel" style={{padding:32}}>
            <h3 style={{fontWeight:700,fontSize:17,marginBottom:6}}>Prepayment Simulator</h3>
            <p style={{fontSize:13,color:T.textSub,marginBottom:28,lineHeight:1.6}}>Pay extra each month to cut tenure and save interest.</p>
            <div style={{marginBottom:28}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,color:T.textSub}}>Extra Payment / Month</span>
                <span className="mono" style={{fontSize:15,fontWeight:700,color:T.gold}}>{fmt(prepay)}</span>
              </div>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",top:"50%",left:0,right:0,height:4,borderRadius:4,background:T.border,transform:"translateY(-50%)"}}>
                  <div style={{width:`${(prepay/50000)*100}%`,height:"100%",borderRadius:4,background:`linear-gradient(to right,${T.gold},${T.primary})`,transition:"width 0.1s"}}/>
                </div>
                <input className="range-sl" type="range" min={0} max={50000} step={500} value={prepay} onChange={e=>setPrepay(+e.target.value)}/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[0,2000,5000,10000,25000].map(v=>(
                <button key={v} className="btn-g" onClick={()=>setPrepay(v)} style={{borderColor:prepay===v?T.gold:T.border,color:prepay===v?T.gold:T.textSub}}>
                  {v===0?"No prepayment (baseline)":`+ ${fmt(v)} / month`}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="panel" style={{padding:26}}>
              <div style={{fontSize:12,color:T.textSub,marginBottom:16,fontWeight:500,textTransform:"uppercase",letterSpacing:0.8}}>Without Prepayment</div>
              {[{l:"Tenure",v:`${t} months`,c:T.text},{l:"Total Interest",v:fmt(totalInt),c:T.danger}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<1?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:13,color:T.textSub}}>{r.l}</span>
                  <span className="mono" style={{fontWeight:700,color:r.c}}>{r.v}</span>
                </div>
              ))}
            </div>
            {prepayResult?(
              <div className="panel" style={{padding:26,borderColor:"rgba(0,255,135,0.2)"}}>
                <div style={{fontSize:12,color:T.primary,marginBottom:16,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>With {fmt(prepay)}/mo Extra</div>
                {[{l:"New Tenure",v:`${prepayResult.months} months`,c:T.primary},{l:"Months Saved",v:`-${prepayResult.savedMonths} months`,c:T.blue},{l:"Interest Saved",v:fmt(prepayResult.saved),c:T.primary}].map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<2?`1px solid ${T.border}`:"none"}}>
                    <span style={{fontSize:13,color:T.textSub}}>{r.l}</span>
                    <span className="mono" style={{fontWeight:700,color:r.c,fontSize:i===2?18:13}}>{r.v}</span>
                  </div>
                ))}
              </div>
            ):(
              <div className="panel" style={{padding:26,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,fontSize:14,minHeight:120}}>← Drag slider to see savings</div>
            )}
          </div>
        </div>
      )}

      {activeTab==="compare"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <h3 style={{fontWeight:700,fontSize:17}}>Tenure Comparison</h3>
            <span style={{fontSize:13,color:T.textSub}}>— {fmtK(p)} at {r}% p.a.</span>
          </div>
          <div className="four-col">
            {cmpData.map((c,i)=>(
              <div key={i} onClick={()=>setParams({...params,tenure:c.tenure})} className="panel" style={{padding:22,textAlign:"center",cursor:"pointer",borderColor:t===c.tenure?T.primary:T.border}}>
                <div style={{fontSize:13,color:T.textSub,marginBottom:8}}>{c.label}</div>
                <div className="mono" style={{fontSize:22,fontWeight:800,color:T.primary}}>{fmt(c.emi)}</div>
                <div style={{fontSize:11,color:T.textSub,marginTop:4}}>per month</div>
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
                  <div style={{fontSize:12,color:T.textMuted}}>Total: {fmtK(c.total)}</div>
                  <div style={{fontSize:11,color:T.danger,marginTop:3}}>Interest: {fmtK(c.total-p)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="panel" style={{padding:24}}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cmpData} barGap={10}>
                <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false}/>
                <XAxis dataKey="label" tick={{fill:T.textMuted,fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmtK} tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={fmt} contentStyle={{background:"rgba(3,7,15,0.95)",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}}/>
                <Bar dataKey="total" name="Total Payable" fill={T.blue} radius={[6,6,0,0]} opacity={0.7}/>
                <Bar dataKey="emi" name="Monthly EMI" fill={T.primary} radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIP CALCULATOR — NEW
// ─────────────────────────────────────────────────────────────────────────────
const SIPCalc = ({ user }) => {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [activeTab, setActiveTab] = useState("calculator");

  const calcSIP = (p, r, y) => {
    const n = y * 12, mr = r / 12 / 100;
    return p * (((Math.pow(1 + mr, n) - 1) / mr) * (1 + mr));
  };

  const maturity = Math.round(calcSIP(monthly, rate, years));
  const invested = monthly * years * 12;
  const gains = maturity - invested;

  const yearData = Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    return {
      year: `Y${y}`,
      invested: monthly * y * 12,
      value: Math.round(calcSIP(monthly, rate, y)),
    };
  });

  const comparisons = [
    { label: "Savings Account", rate: 3.5, color: T.danger },
    { label: "Fixed Deposit", rate: 7.0, color: T.gold },
    { label: "Your SIP", rate, color: T.primary },
    { label: "Aggressive Equity", rate: 15, color: T.blue },
  ].map(c => ({ ...c, maturity: Math.round(calcSIP(monthly, c.rate, years)), gains: Math.round(calcSIP(monthly, c.rate, years)) - invested }));

  const milestones = [500000, 1000000, 2500000, 5000000, 10000000].map(target => {
    const mr = rate / 12 / 100;
    let bal = 0, months = 0;
    while (bal < target && months < 600) { bal = bal * (1 + mr) + monthly; months++; }
    return { label: fmtK(target), months, years: (months / 12).toFixed(1) };
  });

  const renderSlider = (label, val, setVal, min, max, step, suffix, color) => {
    const pct = ((val - min) / (max - min)) * 100;
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: T.textSub }}>{label}</span>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: color || T.primary }}>{val.toLocaleString("en-IN")}{suffix}</span>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, borderRadius: 4, background: T.border, transform: "translateY(-50%)" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: color || T.primary, transition: "width 0.1s" }} />
          </div>
          <input className="range-sl" type="range" min={min} max={max} step={step} value={val} onChange={e => setVal(+e.target.value)} />
        </div>
      </div>
    );
  };

  return (
    <div className="anim-in">
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>SIP Calculator</h2>
          <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Systematic Investment Plan · Wealth projection · Goal planning</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["calculator", "compare", "milestones"].map(t => <button key={t} className={`chip ${activeTab === t ? "on" : ""}`} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>

      {activeTab === "calculator" && (
        <div className="sip-grid">
          <div className="panel" style={{ padding: 32 }}>
            {renderSlider("Monthly SIP Amount", monthly, setMonthly, 500, 100000, 500, "", T.primary)}
            {renderSlider("Expected Annual Return", rate, setRate, 4, 30, 0.5, "% p.a.", rate < 8 ? T.danger : rate < 14 ? T.gold : T.blue)}
            {renderSlider("Investment Period", years, setYears, 1, 40, 1, " years", T.purple)}

            <div className="panel-flat" style={{ padding: 20, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: T.textSub, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Quick Presets</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[{ l: "Emergency Fund", m: 3000, r: 7, y: 3 }, { l: "Car in 5 years", m: 8000, r: 10, y: 5 }, { l: "₹1Cr Retirement", m: 5000, r: 12, y: 25 }, { l: "Child Education", m: 10000, r: 12, y: 15 }].map(p => (
                  <button key={p.l} className="chip" onClick={() => { setMonthly(p.m); setRate(p.r); setYears(p.y); }} style={{ fontSize: 11 }}>{p.l}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="panel" style={{ padding: 26, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: 1 }}>Maturity Value</div>
              <div className="mono" style={{ fontSize: 38, fontWeight: 800, color: T.primary, marginTop: 8, marginBottom: 4 }}>{fmtK(maturity)}</div>
              <div style={{ fontSize: 13, color: T.textSub }}>after {years} years</div>
              <div style={{ display: "flex", gap: 0, marginTop: 20, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ flex: invested, background: T.blueDim, padding: "10px 14px", textAlign: "center", borderRight: `1px solid ${T.border}` }}>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: T.blue }}>{fmtK(invested)}</div>
                  <div style={{ fontSize: 11, color: T.textSub, marginTop: 3 }}>Invested</div>
                </div>
                <div style={{ flex: gains, background: T.primaryDim, padding: "10px 14px", textAlign: "center" }}>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{fmtK(gains)}</div>
                  <div style={{ fontSize: 11, color: T.textSub, marginTop: 3 }}>Gains</div>
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: T.gold }}>
                Returns: {Math.round((gains / invested) * 100)}% on invested capital
              </div>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Growth Chart</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={yearData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sipGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={T.primary} stopOpacity={0} /></linearGradient>
                    <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.2} /><stop offset="100%" stopColor={T.blue} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(years / 5)} />
                  <YAxis tickFormatter={fmtK} tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v, n) => [fmtK(v), n]} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke={T.primary} fill="url(#sipGrad)" strokeWidth={2.5} name="Portfolio Value" />
                  <Area type="monotone" dataKey="invested" stroke={T.blue} fill="url(#invGrad)" strokeWidth={2} strokeDasharray="5 3" name="Amount Invested" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "compare" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>Investment Comparison</h3>
            <p style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{fmt(monthly)}/mo for {years} years</p>
          </div>
          <div className="stats-grid" style={{ marginBottom: 22 }}>
            {comparisons.map((c, i) => (
              <div key={i} className="panel" style={{ padding: 22, borderTop: `3px solid ${c.color}` }}>
                <div style={{ fontSize: 13, color: T.textSub, marginBottom: 8 }}>{c.label}</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{fmtK(c.maturity)}</div>
                <div style={{ fontSize: 12, color: T.textSub, marginTop: 6 }}>Gains: {fmtK(c.gains)}</div>
                <div style={{ fontSize: 11, color: c.color, marginTop: 4 }}>{c.rate}% p.a.</div>
              </div>
            ))}
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisons.map(c => ({ name: c.label.split(" ")[0], invested, gains: c.gains }))} barSize={40}>
                <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtK} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={fmtK} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="invested" name="Invested" fill={T.blue} radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="gains" name="Gains" fill={T.primary} radius={[6, 6, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "milestones" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>Wealth Milestones</h3>
            <p style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>At {fmt(monthly)}/mo SIP @ {rate}% p.a., you'll reach:</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {milestones.map((m, i) => (
              <div key={i} className="panel" style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.primaryDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {["🌱", "🌿", "🌳", "🏔️", "🚀"][i]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: T.textSub, marginTop: 3 }}>Wealth milestone</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: T.primary }}>{m.years} yrs</div>
                  <div style={{ fontSize: 12, color: T.textSub, marginTop: 3 }}>{m.months} months</div>
                </div>
              </div>
            ))}
          </div>
          <div className="panel" style={{ padding: 20, marginTop: 16, borderLeft: `3px solid ${T.blue}` }}>
            <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>
              💡 <strong style={{ color: T.text }}>Rule of 72:</strong> At {rate}% returns, your money doubles every {Math.round(72 / rate)} years. Increasing SIP by just 10% annually (step-up SIP) can cut your goal timeline by 20-30%.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE TRACKER — NEW
// ─────────────────────────────────────────────────────────────────────────────
const EXPENSE_CATS = [
  { label: "Food", icon: "🍔", color: T.gold, budget: 0.15 },
  { label: "Transport", icon: "🚗", color: T.blue, budget: 0.10 },
  { label: "Entertainment", icon: "🎬", color: T.purple, budget: 0.08 },
  { label: "Shopping", icon: "🛍️", color: "#FF6B9D", budget: 0.10 },
  { label: "Bills", icon: "💡", color: T.danger, budget: 0.12 },
  { label: "Medical", icon: "🏥", color: "#34D399", budget: 0.05 },
  { label: "Education", icon: "📚", color: T.primary, budget: 0.05 },
  { label: "Other", icon: "💰", color: T.textSub, budget: 0.05 },
];

const ExpenseTracker = ({ user }) => {
  const [expenses, setExpenses] = useState(() => Storage.getExpenses(user.email));
  const [form, setForm] = useState({ amount: "", category: "Food", note: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const saveAndUpdate = (newExpenses) => {
    setExpenses(newExpenses);
    Storage.saveExpenses(user.email, newExpenses);
  };

  const addExpense = () => {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) return;
    const expense = { id: Date.now(), amount: +form.amount, category: form.category, note: form.note, date: new Date().toISOString() };
    saveAndUpdate([expense, ...expenses]);
    setForm({ amount: "", category: "Food", note: "" });
  };

  const deleteExpense = (id) => saveAndUpdate(expenses.filter(e => e.id !== id));

  const monthExpenses = expenses.filter(e => e.date.slice(0, 7) === filterMonth);
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining = user.salary - user.currentEmi - totalSpent;

  const catSummary = EXPENSE_CATS.map(cat => {
    const total = monthExpenses.filter(e => e.category === cat.label).reduce((s, e) => s + e.amount, 0);
    const budget = Math.round(user.salary * cat.budget);
    return { ...cat, total, budget, over: total > budget };
  }).filter(c => c.total > 0);

  const pieData = catSummary.map(c => ({ name: c.label, value: c.total, color: c.color }));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("default", { month: "short" });
    const total = expenses.filter(e => e.date.slice(0, 7) === key).reduce((s, e) => s + e.amount, 0);
    return { label, total };
  });

  return (
    <div className="anim-in">
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>Expense Tracker</h2>
          <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Track spending · Budget alerts · Monthly trends</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["overview", "add", "history"].map(t => <button key={t} className={`chip ${activeTab === t ? "on" : ""}`} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>

      {activeTab === "add" && (
        <div style={{ maxWidth: 520 }}>
          <div className="panel" style={{ padding: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 24 }}>Add Expense</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input className="inp" placeholder="Amount ₹" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <select className="inp" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {EXPENSE_CATS.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
              </select>
              <input className="inp" placeholder="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} onKeyDown={e => e.key === "Enter" && addExpense()} />
              <button className="btn-p" onClick={addExpense} style={{ width: "100%" }}>Add Expense →</button>
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, color: T.textSub, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8 }}>Quick Add</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[{ l: "Lunch ₹150", a: 150, c: "Food" }, { l: "Uber ₹200", a: 200, c: "Transport" }, { l: "Netflix ₹499", a: 499, c: "Entertainment" }, { l: "Grocery ₹800", a: 800, c: "Food" }, { l: "Medicine ₹300", a: 300, c: "Medical" }].map(q => (
                  <button key={q.l} className="chip" style={{ fontSize: 11 }} onClick={() => { setForm({ amount: q.a, category: q.c, note: q.l }); setActiveTab("add"); }}>+ {q.l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, outline: "none" }} />
            <span style={{ fontSize: 13, color: T.textSub }}>{monthExpenses.length} transactions</span>
          </div>

          <div className="stats-grid" style={{ marginBottom: 20 }}>
            {[
              { label: "Total Spent", val: totalSpent, color: T.danger, icon: "💸" },
              { label: "Remaining", val: Math.abs(remaining), color: remaining >= 0 ? T.primary : T.danger, icon: remaining >= 0 ? "✅" : "⚠️" },
              { label: "Monthly Income", val: user.salary, color: T.blue, icon: "💰" },
              { label: "Spent %", val: null, display: `${user.salary > 0 ? Math.round((totalSpent / user.salary) * 100) : 0}%`, color: totalSpent / user.salary > 0.7 ? T.danger : T.primary, icon: "📊" },
            ].map((c, i) => (
              <div key={i} className="panel" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: 0.6 }}>{c.label}</span>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                </div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: c.color, marginTop: 12 }}>{c.display || fmt(c.val)}</div>
              </div>
            ))}
          </div>

          {monthExpenses.length === 0 ? (
            <div className="panel" style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No expenses this month</div>
              <p style={{ color: T.textSub, fontSize: 13, marginBottom: 20 }}>Start tracking to see insights and budget alerts.</p>
              <button className="btn-p" onClick={() => setActiveTab("add")}>Add First Expense →</button>
            </div>
          ) : (
            <div className="two-col">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="panel" style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Category Breakdown</div>
                  {catSummary.map((c, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{c.icon}</span>
                          <span style={{ fontSize: 13 }}>{c.label}</span>
                          {c.over && <span className="tag" style={{ background: T.dangerDim, color: T.danger, fontSize: 9 }}>OVER BUDGET</span>}
                        </div>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: c.over ? T.danger : T.text }}>{fmt(c.total)}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 4, background: T.border }}>
                        <div style={{ width: `${Math.min((c.total / (c.budget || 1)) * 100, 100)}%`, height: "100%", borderRadius: 4, background: c.over ? T.danger : c.color, transition: "width 0.4s" }} />
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>Budget: {fmt(c.budget)}</div>
                    </div>
                  ))}
                </div>

                <div className="panel" style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>6-Month Trend</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={last6Months}>
                      <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtK} tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={fmt} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="total" name="Spent" fill={T.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel" style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Spending Split</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={fmt} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {catSummary.slice(0, 5).map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                        <span style={{ fontSize: 12, color: T.textSub }}>{c.icon} {c.label}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>All Transactions</h3>
            <span style={{ fontSize: 13, color: T.textSub }}>{expenses.length} total</span>
          </div>
          {expenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>No transactions yet.</div>
          ) : (
            <div>
              {expenses.slice(0, 50).map(e => {
                const cat = EXPENSE_CATS.find(c => c.label === e.category) || EXPENSE_CATS[7];
                return (
                  <div key={e.id} className="exp-row">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{e.note || e.category}</div>
                      <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>{e.category} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 15, color: T.danger }}>-{fmt(e.amount)}</div>
                    <button onClick={() => deleteExpense(e.id)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 18, padding: "0 4px", marginLeft: 8 }}>×</button>
                  </div>
                );
              })}
              {expenses.length > 50 && <p style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 16 }}>Showing 50 of {expenses.length} transactions</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL GAME — ENHANCED
// ─────────────────────────────────────────────────────────────────────────────
const FinancialGame = ({ user }) => {
  const [difficulty, setDifficulty] = useState(null);
  const [gs, setGs] = useState(null);
  const [idx, setIdx] = useState(0);
  const [over, setOver] = useState(null);
  const [result, setResult] = useState(null);
  const [ach, setAch] = useState([]);
  const [investCount, setInvestCount] = useState(0);

  const getInit = (diff) => ({
    cash: diff === "easy" ? user.salary * 6 : diff === "hard" ? user.salary * 1.5 : user.salary * 3,
    credit: diff === "easy" ? Math.min(900, user.cibil + 50) : diff === "hard" ? Math.max(300, user.cibil - 50) : user.cibil,
    happy: 70, month: 1, streak: 0,
  });

  const scenarios = [
    { emoji:"📱",title:"iPhone Launch",cat:"Lifestyle",tip:"No-cost EMIs still increase your FOIR and reduce loan eligibility.",choices:[
      {label:"Take EMI ₹5K/mo",icon:"💳",cashΔ:-5000,creditΔ:+5,happyΔ:+18,isInvest:false,outcome:"EMI added to your profile. CIBIL benefits slightly if paid on time. But flexibility decreases."},
      {label:"Wait & Save",icon:"💰",cashΔ:+2000,creditΔ:0,happyΔ:-5,isInvest:false,outcome:"Delayed gratification is one of the most underrated wealth-building skills. ₹2K saved this month."},
    ]},
    { emoji:"🏥",title:"Medical Emergency",cat:"Crisis",tip:"A 6-month emergency fund is non-negotiable. Health insurance prevents this scenario entirely.",choices:[
      {label:"Pay from savings",icon:"💸",cashΔ:-40000,creditΔ:0,happyΔ:-12,isInvest:false,outcome:"Painful but responsible. This is exactly why emergency funds exist."},
      {label:"Credit card",icon:"💳",cashΔ:0,creditΔ:-28,happyΔ:-22,isInvest:false,outcome:"Utilization spikes. CIBIL drops hard. Revolving balance at 36% p.a. is financial quicksand."},
    ]},
    { emoji:"📉",title:"Nifty Crashes 8%",cat:"Investment",tip:"Market corrections are buying opportunities. Time in market beats timing the market every time.",choices:[
      {label:"Invest ₹20K",icon:"🚀",cashΔ:-20000,creditΔ:0,happyΔ:+10,isInvest:true,outcome:"Long-term thinking. Index funds recover. Statistically, buying dips outperforms waiting."},
      {label:"Stay sidelined",icon:"⏳",cashΔ:0,creditΔ:0,happyΔ:0,isInvest:false,outcome:"Valid if you have upcoming expenses. But missing 10 best market days can halve your returns."},
    ]},
    { emoji:"💳",title:"Credit Card Due",cat:"Debt",tip:"Full payment is the only right answer. Minimum payment means 36% p.a. on the balance.",choices:[
      {label:"Pay full ₹15,000",icon:"✅",cashΔ:-15000,creditΔ:+22,happyΔ:+6,isInvest:false,outcome:"Zero interest, CIBIL improves, no revolving debt trap. The only correct answer."},
      {label:"Pay minimum ₹750",icon:"😬",cashΔ:-750,creditΔ:-38,happyΔ:-8,isInvest:false,outcome:"₹14,250 at 36% p.a. — a debt spiral. CIBIL tanks. This single choice destroys wealth."},
    ]},
    { emoji:"🎁",title:"Year-End Bonus!",cat:"Windfall",tip:"Wealthy people spend windfalls on assets. Average people spend on liabilities.",choices:[
      {label:"Prepay home loan",icon:"🏠",cashΔ:-50000,creditΔ:+32,happyΔ:+8,isInvest:true,outcome:"Reduces principal aggressively. Significant interest savings. Wealth-maximizing move."},
      {label:"Vacation + gadgets",icon:"✈️",cashΔ:-60000,creditΔ:-5,happyΔ:+35,isInvest:false,outcome:"High present happiness, zero long-term value. The wealthy invest windfalls, not spend them."},
    ]},
    { emoji:"🏠",title:"Rent Hike Notice",cat:"Housing",tip:"EMI builds equity. Rent pays someone else's loan. The math favors buying if FOIR permits.",choices:[
      {label:"Explore home loan",icon:"🏡",cashΔ:-12000,creditΔ:+10,happyΔ:+22,isInvest:true,outcome:"EMI higher but you build equity. Long-term net worth increases significantly."},
      {label:"Negotiate / relocate",icon:"🤝",cashΔ:-1000,creditΔ:0,happyΔ:-8,isInvest:false,outcome:"Saves short-term cash. Valid if FOIR is already stressed or job stability is uncertain."},
    ]},
    { emoji:"📊",title:"Tax-Saving Window",cat:"Tax Planning",tip:"₹1.5L in ELSS saves up to ₹46,800 in taxes for 30% bracket. March deadline is real.",choices:[
      {label:"Invest ₹1.5L ELSS",icon:"📉",cashΔ:-150000,creditΔ:0,happyΔ:+16,isInvest:true,outcome:"Saves ~₹46K in taxes. 3-year lock-in builds discipline. Historical ELSS returns beat FD."},
      {label:"Skip this year",icon:"😴",cashΔ:0,creditΔ:0,happyΔ:-6,isInvest:false,outcome:"₹46K in tax savings permanently lost. Procrastination in tax planning = voluntary extra tax."},
    ]},
    { emoji:"👔",title:"Job Offer — 35% Hike",cat:"Career",tip:"Your salary is your biggest wealth-creation lever. Every 10% raise = years less to financial freedom.",choices:[
      {label:"Accept new offer",icon:"💼",cashΔ:+18000,creditΔ:+5,happyΔ:+28,isInvest:false,outcome:"Income surge improves all financial ratios. Higher salary = better loan eligibility and SIP capacity."},
      {label:"Stay for 12% hike",icon:"🤝",cashΔ:+6000,creditΔ:0,happyΔ:+12,isInvest:false,outcome:"Lower risk. But loyalty doesn't pay bills. The market values your skills, not your tenure."},
    ]},
    { emoji:"🎓",title:"Education Loan Offer",cat:"Education",tip:"ROI on education varies wildly. Calculate expected salary increase vs total loan cost before deciding.",choices:[
      {label:"Take loan for MBA",icon:"🎓",cashΔ:-20000,creditΔ:-10,happyΔ:+15,isInvest:true,outcome:"If the institute is top-tier, ROI is positive. EMI discipline also builds credit history."},
      {label:"Skip — self-learn",icon:"💻",cashΔ:+2000,creditΔ:0,happyΔ:+5,isInvest:false,outcome:"Free cash flow preserved. Online certifications can match MBA ROI at 1/10th the cost in tech."},
    ]},
    { emoji:"💊",title:"Health Insurance Decision",cat:"Insurance",tip:"Health insurance is not optional. One hospitalisation without cover can wipe 2+ years of savings.",choices:[
      {label:"Buy ₹10L health cover",icon:"🛡️",cashΔ:-15000,creditΔ:+5,happyΔ:+20,isInvest:false,outcome:"Annual premium ₹15K protects against ₹10L+ medical bills. Best ROI of any financial product."},
      {label:"Skip — I'm healthy",icon:"🤞",cashΔ:+1000,creditΔ:0,happyΔ:-5,isInvest:false,outcome:"Medical bills don't care about your health right now. One emergency ends this game."},
    ]},
    { emoji:"🏦",title:"FD vs Mutual Fund",cat:"Investment",tip:"At 7% FD vs 12% MF over 10 years: ₹1L becomes ₹1.97L vs ₹3.1L. Inflation erodes FD gains.",choices:[
      {label:"₹50K in Index Fund",icon:"📈",cashΔ:-50000,creditΔ:0,happyΔ:+12,isInvest:true,outcome:"Market risk exists but long-term equity beats every other asset class historically."},
      {label:"₹50K in FD at 7%",icon:"🏦",cashΔ:-50000,creditΔ:0,happyΔ:+8,isInvest:false,outcome:"Safe, predictable. But at 6% inflation, real return is just 1%. Safety has a hidden cost."},
    ]},
    { emoji:"🚗",title:"Car Upgrade Temptation",cat:"Lifestyle",tip:"Cars depreciate 15-20% per year. A ₹10L car is worth ₹5L in 3 years. It's a liability, not an asset.",choices:[
      {label:"Finance new car EMI",icon:"🚙",cashΔ:-12000,creditΔ:-15,happyΔ:+25,isInvest:false,outcome:"Depreciation + EMI interest = expensive. FOIR worsens. Loan eligibility for home reduces."},
      {label:"Keep current car",icon:"🛠️",cashΔ:+3000,creditΔ:0,happyΔ:-5,isInvest:false,outcome:"Smart. Redirect that ₹12K/mo to SIP instead. In 10 years you can buy the car outright."},
    ]},
    { emoji:"🌟",title:"IPO Allotment!",cat:"Investment",tip:"IPO listing gains average 20-30% but vary wildly. Long-term holding beats listing day flipping.",choices:[
      {label:"List & hold 1 year",icon:"📊",cashΔ:+15000,creditΔ:+5,happyΔ:+18,isInvest:true,outcome:"Long-term capital gains taxed at 10% vs 15% for short-term. Discipline pays."},
      {label:"Sell on listing day",icon:"💰",cashΔ:+8000,creditΔ:0,happyΔ:+12,isInvest:false,outcome:"Quick gains. But you pay 15% tax and miss potential long-term upside."},
    ]},
    { emoji:"👨‍👩‍👧",title:"Family Emergency Fund",cat:"Emergency",tip:"An emergency fund = 6 months of expenses in liquid form. This is non-negotiable.",choices:[
      {label:"Build ₹1L emergency fund",icon:"🛡️",cashΔ:-100000,creditΔ:+8,happyΔ:+15,isInvest:false,outcome:"Peace of mind has real financial value. Emergencies without a fund force credit card debt."},
      {label:"Invest everything in stocks",icon:"📈",cashΔ:-100000,creditΔ:0,happyΔ:+10,isInvest:true,outcome:"Higher returns but zero liquidity. If an emergency hits, you sell at the worst possible time."},
    ]},
    { emoji:"💡",title:"Side Business Idea",cat:"Income",tip:"A second income source is the fastest path to financial freedom. Asymmetric upside.",choices:[
      {label:"Invest ₹20K to start",icon:"🚀",cashΔ:-20000,creditΔ:0,happyΔ:+20,isInvest:true,outcome:"Side income diversifies your income risk. Even ₹10K/mo extra compounds into significant wealth."},
      {label:"Too risky — skip",icon:"😐",cashΔ:+1000,creditΔ:0,happyΔ:-8,isInvest:false,outcome:"Playing it safe is also a financial decision. But single income is the biggest financial risk."},
    ]},
  ];

  const handle = (choice) => {
    if (!gs) return;
    const ng = { ...gs, cash: gs.cash + choice.cashΔ, credit: Math.max(300, Math.min(900, gs.credit + choice.creditΔ)), happy: Math.max(0, Math.min(100, gs.happy + choice.happyΔ)), month: gs.month + 1, streak: choice.creditΔ >= 0 ? gs.streak + 1 : 0 };
    const newInvestCount = investCount + (choice.isInvest ? 1 : 0);
    setResult({ ...choice, tip: scenarios[idx].tip });
    const newAch = [...ach];
    if (ng.credit >= 800 && !ach.includes("🏆 Credit Master")) newAch.push("🏆 Credit Master");
    if (ng.streak >= 3 && !ach.includes("🔥 On a Roll")) newAch.push("🔥 On a Roll");
    if (ng.cash >= user.salary * 8 && !ach.includes("💰 Cash King")) newAch.push("💰 Cash King");
    if (ng.happy >= 90 && !ach.includes("😊 Happy Investor")) newAch.push("😊 Happy Investor");
    if (newInvestCount >= 3 && !ach.includes("📈 Smart Investor")) newAch.push("📈 Smart Investor");
    if (ng.credit >= 850 && !ach.includes("🌟 CIBIL Legend")) newAch.push("🌟 CIBIL Legend");
    setAch(newAch);
    setInvestCount(newInvestCount);
    setTimeout(() => {
      setResult(null); setGs(ng);
      if (ng.credit <= 300) { setOver({ win: false, reason: "Credit score collapsed. Consistent defaults destroy financial access and credibility permanently." }); return; }
      if (ng.cash < 0) { setOver({ win: false, reason: "You ran out of liquidity. Even high earners go insolvent without cash flow discipline." }); return; }
      if (idx + 1 >= scenarios.length) { setOver({ win: true, ...ng, achievements: newAch }); return; }
      setIdx(i => i + 1);
    }, 3000);
  };

  const reset = () => { setGs(null); setIdx(0); setOver(null); setResult(null); setAch([]); setInvestCount(0); setDifficulty(null); };

  const grade = () => {
    if (!over) return "";
    const s = over.credit + (over.cash / 8000) + over.happy + ach.length * 20;
    return s > 1200 ? "S" : s > 1000 ? "A" : s > 800 ? "B" : s > 650 ? "C" : "D";
  };

  if (!difficulty) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }} className="anim-in">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800 }}>Financial Crossroads</h2>
          <p style={{ color: T.textSub, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>15 real-life financial decisions. Real consequences. Choose your difficulty.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { id: "easy", label: "😊 Easy", desc: "Start with 6x salary · CIBIL +50 boost · Best for learning", color: T.primary },
            { id: "medium", label: "🎯 Medium", desc: "Start with 3x salary · Your actual CIBIL · Balanced challenge", color: T.gold },
            { id: "hard", label: "💀 Hard", desc: "Start with 1.5x salary · CIBIL -50 penalty · One mistake can end it", color: T.danger },
          ].map(d => (
            <button key={d.id} className="panel" onClick={() => { setDifficulty(d.id); setGs(getInit(d.id)); }} style={{ padding: 24, textAlign: "left", cursor: "pointer", borderColor: d.color, background: "transparent" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: d.color, marginBottom: 6 }}>{d.label}</div>
              <div style={{ fontSize: 13, color: T.textSub }}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const bars = [
    { label: "Cash", val: gs?.cash || 0, max: user.salary * 6, color: T.primary, display: fmtK(gs?.cash || 0) },
    { label: "CIBIL", val: gs?.credit || 0, max: 900, color: (gs?.credit || 0) >= 700 ? T.blue : T.danger, display: String(gs?.credit || 0) },
    { label: "Happiness", val: gs?.happy || 0, max: 100, color: T.gold, display: (gs?.happy || 0) + "%" },
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }} className="anim-in">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800 }}>Financial Crossroads</h2>
        <p style={{ color: T.textSub, fontSize: 14, marginTop: 6 }}>Difficulty: <span style={{ color: difficulty === "easy" ? T.primary : difficulty === "hard" ? T.danger : T.gold, fontWeight: 600, textTransform: "capitalize" }}>{difficulty}</span></p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        {bars.map((b, i) => (
          <div key={i} className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: 0.8 }}>{b.label}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.display}</span>
            </div>
            <div style={{ height: 5, borderRadius: 5, background: T.border }}>
              <div className="game-bar" style={{ width: `${Math.max(2, Math.min(100, (b.val / b.max) * 100))}%`, background: `linear-gradient(to right,${b.color}88,${b.color})` }} />
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
          <h2 style={{ fontSize: 28, fontWeight: 800, color: over.win ? T.primary : T.danger }}>{over.win ? "Year Complete!" : "Game Over"}</h2>
          {over.win ? (
            <>
              <div className="mono" style={{ fontSize: 80, fontWeight: 800, color: T.primary, margin: "12px 0", lineHeight: 1 }}>{grade()}</div>
              <p style={{ color: T.textSub, fontSize: 14 }}>CIBIL {over.credit} · Cash {fmtK(over.cash)} · Happiness {over.happy}%</p>
              {ach.length > 0 && <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>{ach.map(a => <span key={a} className="tag" style={{ background: T.goldDim, color: T.gold }}>{a}</span>)}</div>}
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
          <div style={{ marginTop: 16, padding: "12px 16px", background: T.blueDim, borderRadius: 10, border: `1px solid rgba(56,189,248,0.15)`, maxWidth: 460, margin: "16px auto 0" }}>
            <p style={{ fontSize: 12, color: T.blue, lineHeight: 1.6 }}>💡 <strong>Finance Tip:</strong> {result.tip}</p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
            {result.cashΔ !== 0 && <span className="tag" style={{ background: result.cashΔ > 0 ? T.primaryDim : T.dangerDim, color: result.cashΔ > 0 ? T.primary : T.danger }}>Cash {result.cashΔ > 0 ? "+" : ""}{fmtK(result.cashΔ)}</span>}
            {result.creditΔ !== 0 && <span className="tag" style={{ background: result.creditΔ > 0 ? T.blueDim : T.dangerDim, color: result.creditΔ > 0 ? T.blue : T.danger }}>CIBIL {result.creditΔ > 0 ? "+" : ""}{result.creditΔ}</span>}
            {result.happyΔ !== 0 && <span className="tag" style={{ background: T.goldDim, color: T.gold }}>Mood {result.happyΔ > 0 ? "+" : ""}{result.happyΔ}%</span>}
          </div>
        </div>
      ) : gs && (
        <div className="panel card-anim" style={{ overflow: "hidden" }}>
          <div style={{ height: 3, background: T.border }}>
            <div style={{ height: "100%", width: `${((idx + 1) / scenarios.length) * 100}%`, background: `linear-gradient(to right,${T.primary},${T.blue})`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ padding: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 8 }}>
              <span className="tag" style={{ background: T.primaryDim, color: T.primary }}>Month {gs.month} · Scenario {idx + 1}/{scenarios.length}</span>
              <span className="tag" style={{ background: T.blueDim, color: T.blue }}>{scenarios[idx].cat}</span>
            </div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 58, marginBottom: 12 }}>{scenarios[idx].emoji}</div>
              <h3 style={{ fontSize: 24, fontWeight: 800 }}>{scenarios[idx].title}</h3>
              <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.7, marginTop: 10, maxWidth: 480, margin: "10px auto 0" }}>{scenarios[idx].choices[0].outcome.split(".")[0]}...</p>
            </div>
            <div className="game-btn-row">
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
    { id:1,logo:"🏦",name:"HDFC Bank",type:"Personal",rate:10.5,max:4000000,speed:"24 hrs",minCibil:700,minSalary:25000,score:94 },
    { id:2,logo:"🏛",name:"SBI Home Loan",type:"Home",rate:8.4,max:50000000,speed:"5 days",minCibil:650,minSalary:30000,score:97 },
    { id:3,logo:"⚡",name:"Bajaj Finserv",type:"Personal",rate:11.9,max:2500000,speed:"2 hrs",minCibil:640,minSalary:15000,score:86 },
    { id:4,logo:"🔷",name:"ICICI Bank",type:"Personal",rate:10.75,max:3000000,speed:"48 hrs",minCibil:720,minSalary:30000,score:91 },
    { id:5,logo:"🏠",name:"LIC Housing",type:"Home",rate:8.65,max:30000000,speed:"7 days",minCibil:660,minSalary:35000,score:93 },
    { id:6,logo:"🔶",name:"Axis Bank",type:"Car",rate:9.2,max:2000000,speed:"24 hrs",minCibil:700,minSalary:20000,score:89 },
    { id:7,logo:"🚀",name:"KreditBee",type:"Personal",rate:17.0,max:400000,speed:"10 min",minCibil:580,minSalary:10000,score:71 },
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
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>Market Hub</h2>
          <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Compare lenders · Check eligibility · Find best rates</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", "Personal", "Home", "Car"].map(t => <button key={t} className={`chip ${filter === t ? "on" : ""}`} onClick={() => { setFilter(t); setSel(null); }}>{t}</button>)}
        </div>
      </div>

      <div className="mkt-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(l => {
            const e = getElig(l);
            return (
              <div key={l.id} onClick={() => setSel(l)} className="panel" style={{ padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, borderLeft: selected?.id === l.id ? `3px solid ${T.primary}` : "1px solid transparent" }}>
                <div style={{ fontSize: 26, width: 38, textAlign: "center" }}>{l.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                    <span className="tag hide-mobile" style={{ background: T.border, color: T.textSub, fontSize: 10 }}>{l.type}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: l.rate < 10 ? T.primary : l.rate < 13 ? T.gold : T.danger }}>{l.rate}%</span>
                    <span style={{ fontSize: 12, color: T.textSub, alignSelf: "center" }}>p.a. · {l.speed}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <div style={{ fontSize: 11, color: e.color, fontWeight: 600 }}>{e.label}</div>
                  <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: T.border }}>
                    <div style={{ width: `${e.pct}%`, height: "100%", borderRadius: 4, background: e.color, transition: "width 0.4s" }} />
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
              <div style={{ width: `${elig.pct}%`, height: "100%", borderRadius: 7, background: elig.color, transition: "width 0.6s", boxShadow: `0 0 8px ${elig.color}66` }} />
            </div>
          </div>
          <button className="btn-p" style={{ width: "100%", fontSize: 14 }}>Apply for Pre-Approval →</button>
        </div>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Interest Rate Comparison</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={rateData} barSize={30}>
            <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[6, 20]} tickFormatter={v => `${v}%`} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [`${v}%`, "Rate"]} contentStyle={{ background: "rgba(3,7,15,0.95)", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {rateData.map((e, i) => <Cell key={i} fill={e.rate < 10 ? T.primary : e.rate < 13 ? T.gold : T.danger} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI ADVISOR — GROQ
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
- If asked about loans, calculate FOIR impact`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...updated.slice(1).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))],
          max_tokens: 800,
        })
      });
      if (!res.ok) { const err = await res.json(); setMsgs([...updated, { role: "assistant", content: `Error: ${err.error?.message || "Something went wrong."}` }]); setLoading(false); return; }
      const data = await res.json();
      setMsgs([...updated, { role: "assistant", content: data.choices?.[0]?.message?.content || "No response received." }]);
    } catch (e) {
      setMsgs([...updated, { role: "assistant", content: "Network error. Please try again." }]);
    }
    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const renderMsg = (text) => text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    const isBullet = /^[-•*]/.test(line.trim());
    const isNum = /^\d+\./.test(line.trim());
    const clean = line.replace(/^\s*[-•*]\s*/, "").replace(/\*\*/g, "");
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
              {m.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><Logo size={18} /><span style={{ fontSize: 11, color: T.primary, fontWeight: 600, letterSpacing: 0.5 }}>WEALTH AI</span></div>}
              <div style={{ maxWidth: "82%", padding: "14px 18px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", background: m.role === "user" ? T.primaryDim : "rgba(255,255,255,0.03)", border: `1px solid ${m.role === "user" ? "rgba(0,255,135,0.18)" : T.border}` }}>
                {renderMsg(m.content)}
              </div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Logo size={18} /><span style={{ fontSize: 13, color: T.primary, animation: "pulse 1.4s infinite" }}>Analyzing your profile...</span></div>}
          <div ref={endRef} />
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 18px", display: "flex", gap: 10, background: "rgba(0,0,0,0.2)" }}>
          <input className="inp" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about your finances..." />
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

  if (!user) return <AuthScreen onLogin={(u) => { injectStyles(); setUser(u); }} />;

  const nav = [
    { id: "overview", icon: "⊞", label: "Dashboard" },
    { id: "emi", icon: "⌗", label: "EMI Calculator" },
    { id: "sip", icon: "📈", label: "SIP Calculator" },
    { id: "expenses", icon: "💸", label: "Expenses" },
    { id: "markets", icon: "📊", label: "Markets" },
    { id: "game", icon: "🃏", label: "Game" },
    { id: "ai", icon: "✦", label: "Wealth AI" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>
      <div className={`nav-overlay ${navOpen ? "show" : ""}`} onClick={() => setNavOpen(false)} />

      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 38 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={30} />
            <div>
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 17, fontWeight: 800 }}>CrediCoach</div>
              <div style={{ fontSize: 9, color: T.textSub, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Developed by Divakar</div>
            </div>
          </div>
          <button onClick={() => setNavOpen(false)} style={{ background: "none", border: "none", color: T.textSub, fontSize: 24, cursor: "pointer", display: "none" }} className="mobile-close-btn">×</button>
        </div>

        <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 8px", marginBottom: 10 }}>Navigation</div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {nav.map(n => (
            <div key={n.id} onClick={() => { setTab(n.id); setNavOpen(false); }} className={`nav-item ${tab === n.id ? "active" : ""}`}>
              <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>{n.icon}</span>
              <span>{n.label}</span>
              {tab === n.id && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: T.primary, boxShadow: `0 0 6px ${T.primary}` }} />}
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
            <div style={{ width: 1, background: T.border }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: T.blue }}>{fmtK(user.salary)}</div>
              <div style={{ fontSize: 9, color: T.textSub, letterSpacing: 0.5 }}>SALARY</div>
            </div>
          </div>
          <button onClick={() => setUser(null)} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 8px", display: "block", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = T.danger} onMouseOut={e => e.target.style.color = T.textMuted}>← Sign Out</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="mobile-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={24} />
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800 }}>CrediCoach</div>
          </div>
          <button onClick={() => setNavOpen(true)} style={{ background: "none", border: "none", color: T.text, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}>☰</button>
        </div>

        <div className="main-area">
          {tab === "overview" && <Overview user={user} />}
          {tab === "emi" && <EMICalc params={emiParams} setParams={setEmiParams} user={user} />}
          {tab === "sip" && <SIPCalc user={user} />}
          {tab === "expenses" && <ExpenseTracker user={user} />}
          {tab === "markets" && <Markets user={user} />}
          {tab === "game" && <FinancialGame user={user} />}
          {tab === "ai" && <AIAdvisor user={user} />}
        </div>
      </div>
    </div>
  );
}