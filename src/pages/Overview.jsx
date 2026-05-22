import React from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { T, fmt, fmtK } from "../utils/theme";
import { HealthRing, CibilGauge, Counter } from "../components/SharedUI";

export default function Overview({ user }) {
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
}