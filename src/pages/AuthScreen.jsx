import React, { useState, useEffect } from "react";
import { T } from "../utils/theme";
import { Storage, injectStyles } from "../utils/storage";
import { Logo } from "../components/SharedUI";

export default function AuthScreen({ onLogin }) {
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
}