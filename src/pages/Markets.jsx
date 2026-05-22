import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { T, fmt, fmtK } from "../utils/theme";

export default function Markets({ user }) {
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
}