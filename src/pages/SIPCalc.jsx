import React, { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { T, fmt, fmtK } from "../utils/theme";

export default function SIPCalc({ user }) {
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
    return { year: `Y${y}`, invested: monthly * y * 12, value: Math.round(calcSIP(monthly, rate, y)) };
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
}