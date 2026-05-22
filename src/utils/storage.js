export const Storage = {
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

export const injectStyles = () => {
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