import React, { useState } from "react";
import { Logo } from "./SharedUI";
import { T, fmtK } from "../utils/theme";

export default function AppShell({ user, setUser, tab, setTab, children }) {
  const [navOpen, setNavOpen] = useState(false);

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
          {children}
        </div>
      </div>
    </div>
  );
}