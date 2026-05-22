import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, fmt, fmtK } from '../utils/theme';

export default function CrediEmpire({ user }) {
  // --- DYNAMIC SCALING BASED ON USER SALARY ---
  // If salary is ₹50,000, base tap is ₹500.
  const baseTap = Math.max(50, Math.floor(user.salary / 100)); 

  const initialAssets = useMemo(() => [
    { id: 'fd', name: 'High-Yield FD', icon: '🏦', baseCost: user.salary * 0.5, baseYield: user.salary * 0.005, count: 0 },
    { id: 'sip', name: 'Index Fund SIP', icon: '📈', baseCost: user.salary * 2, baseYield: user.salary * 0.03, count: 0 },
    { id: 'realestate', name: 'Commercial Property', icon: '🏢', baseCost: user.salary * 10, baseYield: user.salary * 0.18, count: 0 },
    { id: 'startup', name: 'Tech Angel Investment', icon: '🚀', baseCost: user.salary * 50, baseYield: user.salary * 1.2, count: 0 },
  ], [user.salary]);

  const initialUpgrades = useMemo(() => [
    { id: 'u1', name: 'Upskill Certification', cost: user.salary * 0.8, boost: baseTap * 1.5, bought: false },
    { id: 'u2', name: 'Freelance Side Hustle', cost: user.salary * 3, boost: baseTap * 4, bought: false },
    { id: 'u3', name: 'Senior Promotion', cost: user.salary * 8, boost: baseTap * 10, bought: false },
  ], [user.salary, baseTap]);

  // --- CORE GAME STATE ---
  const [cash, setCash] = useState(0);
  const [clickPower, setClickPower] = useState(baseTap);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [particles, setParticles] = useState([]);
  const [assets, setAssets] = useState(initialAssets);
  const [upgrades, setUpgrades] = useState(initialUpgrades);
  
  const lastUpdateRef = useRef(performance.now());
  const reqRef = useRef();

  // --- GAME LOOP ---
  const updateLoop = useCallback((time) => {
    const deltaTime = (time - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = time;

    setCash((prev) => prev + (passiveIncome * deltaTime));
    setParticles((prev) => prev.filter(p => time - p.createdAt < 1000));
    
    reqRef.current = requestAnimationFrame(updateLoop);
  }, [passiveIncome]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [updateLoop]);

  // --- ACTIONS ---
  const handleTap = (e) => {
    setCash(c => c + clickPower);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;

    setParticles(prev => [
      ...prev, 
      { id: Date.now() + Math.random(), x, y, val: clickPower, createdAt: performance.now() }
    ]);
  };

  const buyAsset = (index) => {
    const asset = assets[index];
    const cost = Math.floor(asset.baseCost * Math.pow(1.15, asset.count));
    
    if (cash >= cost) {
      setCash(c => c - cost);
      setPassiveIncome(p => p + asset.baseYield);
      
      setAssets(prev => {
        const newAssets = [...prev];
        newAssets[index].count += 1;
        return newAssets;
      });
    }
  };

  const buyUpgrade = (index) => {
    const upg = upgrades[index];
    if (cash >= upg.cost && !upg.bought) {
      setCash(c => c - upg.cost);
      setClickPower(cp => cp + upg.boost);
      
      setUpgrades(prev => {
        const newUpg = [...prev];
        newUpg[index].bought = true;
        return newUpg;
      });
    }
  };

  // --- CALCULATIONS ---
  const targetWealth = 10000000; // ₹1 Crore Target
  const progressPct = Math.min(100, (cash / targetWealth) * 100);

  return (
    <div className="anim-in" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* HEADER / SCOREBOARD */}
      <div style={{ textAlign: "center", marginBottom: 30, position: 'sticky', top: 0, background: T.bg, zIndex: 50, padding: '20px 0', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 13, color: T.textSub, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 8 }}>Net Worth</div>
        
        <div className="mono" style={{ fontSize: 52, fontWeight: 800, color: T.primary, textShadow: `0 0 20px ${T.primaryGlow}`, lineHeight: 1 }}>
          {fmt(cash)}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: 20, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: T.textSub }}>Tap Power: </span>
            <span className="mono" style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>+{fmt(clickPower)}</span>
          </div>
          <div style={{ background: T.primaryDim, padding: '6px 14px', borderRadius: 20, border: `1px solid rgba(0,255,135,0.2)` }}>
            <span style={{ fontSize: 12, color: T.primary }}>Passive: </span>
            <span className="mono" style={{ fontSize: 14, color: T.primary, fontWeight: 700 }}>+{fmt(passiveIncome)}/sec</span>
          </div>
        </div>

        {/* Milestone Bar */}
        <div style={{ maxWidth: 400, margin: "20px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textSub, marginBottom: 6 }}>
            <span>Road to ₹1 Crore</span>
            <span>{progressPct.toFixed(2)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: T.border, overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: `linear-gradient(90deg, ${T.blue}, ${T.primary})`, transition: "width 0.1s linear" }} />
          </div>
        </div>
      </div>

      <div className="two-col-eq">
        
        {/* LEFT COLUMN: THE CLICKER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ position: 'relative' }}>
            
            <button 
              onPointerDown={handleTap}
              style={{
                width: 200, height: 200, borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.primary}, ${T.blue})`,
                border: 'none', cursor: 'pointer', outline: 'none',
                boxShadow: `0 10px 30px ${T.primaryGlow}, inset 0 -10px 20px rgba(0,0,0,0.3)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.05s',
                transform: 'scale(1)',
                userSelect: 'none'
              }}
              onPointerDownCapture={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onPointerUpCapture={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onPointerLeaveCapture={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 60 }}>💼</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#000', marginTop: 10 }}>HUSTLE</span>
            </button>

            {/* Floating Particles */}
            {particles.map(p => (
              <div 
                key={p.id} 
                className="mono"
                style={{
                  position: 'absolute', left: p.x - 20, top: p.y - 20,
                  color: '#fff', fontWeight: 800, fontSize: 22, textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  pointerEvents: 'none', zIndex: 100,
                  animation: 'floatUp 1s ease-out forwards'
                }}
              >
                +{fmtK(p.val)}
              </div>
            ))}
          </div>

          {/* Upgrades Section */}
          <div style={{ width: '100%', marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: T.textSub, textTransform: 'uppercase', letterSpacing: 1 }}>Career Upgrades</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upgrades.map((upg, i) => (
                <button 
                  key={upg.id} 
                  onClick={() => buyUpgrade(i)}
                  disabled={upg.bought || cash < upg.cost}
                  className="panel"
                  style={{
                    padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: upg.bought ? T.primaryDim : 'rgba(0,0,0,0.3)',
                    borderColor: upg.bought ? T.primary : T.border,
                    opacity: upg.bought ? 0.6 : (cash < upg.cost ? 0.4 : 1),
                    cursor: upg.bought ? 'default' : (cash < upg.cost ? 'not-allowed' : 'pointer')
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: upg.bought ? T.primary : T.text, textDecoration: upg.bought ? 'line-through' : 'none' }}>{upg.name}</div>
                    <div style={{ fontSize: 11, color: T.textSub }}>+{fmt(upg.boost)} per tap</div>
                  </div>
                  {!upg.bought && <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>{fmtK(upg.cost)}</div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PASSIVE ASSETS */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: T.textSub, textTransform: 'uppercase', letterSpacing: 1 }}>Investment Portfolio</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assets.map((asset, i) => {
              const currentCost = Math.floor(asset.baseCost * Math.pow(1.15, asset.count));
              const canAfford = cash >= currentCost;
              
              return (
                <div key={asset.id} className="panel" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', borderColor: asset.count > 0 ? T.blueDim : T.border }}>
                  <div style={{ fontSize: 32, background: 'rgba(255,255,255,0.05)', width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {asset.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{asset.name}</div>
                      <div className="tag" style={{ background: T.border, color: T.text }}>Owned: {asset.count}</div>
                    </div>
                    <div style={{ fontSize: 12, color: T.blue, marginBottom: 10 }}>Yields +{fmtK(asset.baseYield)}/sec</div>
                    
                    <button 
                      onClick={() => buyAsset(i)}
                      disabled={!canAfford}
                      style={{
                        width: '100%', padding: '10px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13,
                        background: canAfford ? T.text : 'rgba(255,255,255,0.1)',
                        color: canAfford ? '#000' : T.textMuted,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                      }}
                    >
                      Buy for {fmtK(currentCost)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(1.5); opacity: 0; }
        }
      `}} />
    </div>
  );
}