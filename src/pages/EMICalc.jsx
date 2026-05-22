import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { T, fmt, fmtK } from "../utils/theme";

export default function EMICalc({ params, setParams, user }) {
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
}