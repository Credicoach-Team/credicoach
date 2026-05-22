import React, { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { T, fmt, fmtK } from "../utils/theme";
import { Storage } from "../utils/storage";

const EXPENSE_CATS = [
  { label: "Food", icon: "🍔", color: "#FBBF24", budget: 0.15 },
  { label: "Transport", icon: "🚗", color: "#38BDF8", budget: 0.10 },
  { label: "Entertainment", icon: "🎬", color: "#A78BFA", budget: 0.08 },
  { label: "Shopping", icon: "🛍️", color: "#FF6B9D", budget: 0.10 },
  { label: "Bills", icon: "💡", color: "#F87171", budget: 0.12 },
  { label: "Medical", icon: "🏥", color: "#34D399", budget: 0.05 },
  { label: "Education", icon: "📚", color: "#00FF87", budget: 0.05 },
  { label: "Other", icon: "💰", color: "#8892A4", budget: 0.05 },
];

export default function ExpenseTracker({ user }) {
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
}