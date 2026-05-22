import React, { useState, useEffect } from "react";
import { T } from "../utils/theme";

export const Logo = ({ size = 34 }) => (
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

export const Counter = ({ to, prefix = "", suffix = "" }) => {
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

export const CibilGauge = ({ score }) => {
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

export const HealthRing = ({ score, size = 80 }) => {
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