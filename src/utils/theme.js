export const T = {
  bg: "#03070F",
  surface: "rgba(13,22,38,0.75)",
  card: "rgba(16,26,44,0.5)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.13)",
  primary: "#00FF87",
  primaryDim: "rgba(0,255,135,0.1)",
  primaryGlow: "rgba(0,255,135,0.35)",
  blue: "#38BDF8",
  blueDim: "rgba(56,189,248,0.1)",
  purple: "#A78BFA",
  purpleDim: "rgba(167,139,250,0.1)",
  gold: "#FBBF24",
  goldDim: "rgba(251,191,36,0.1)",
  danger: "#F87171",
  dangerDim: "rgba(248,113,113,0.1)",
  text: "#EEF2FF",
  textSub: "#8892A4",
  textMuted: "#404C5E",
};

export const fmt = (v) => "₹" + Math.abs(Math.round(v)).toLocaleString("en-IN");

export const fmtK = (v) => 
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr` : 
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : 
  v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : fmt(v);