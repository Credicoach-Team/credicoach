import React, { useState, useRef } from "react";
import { T, fmt } from "../utils/theme";
import { Logo } from "../components/SharedUI";

export default function AIAdvisor({ user }) {
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
}