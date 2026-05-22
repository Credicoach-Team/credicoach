import React, { useState, useEffect } from "react";
import { injectStyles } from "./utils/storage";
import AppShell from "./components/AppShell";

// Import your Pages
import AuthScreen from "./pages/AuthScreen";
import Overview from "./pages/Overview";
import EMICalc from "./pages/EMICalc";
import SIPCalc from "./pages/SIPCalc";
import ExpenseTracker from "./pages/ExpenseTracker";
import Markets from "./pages/Markets"; 
import AIAdvisor from "./pages/AIAdvisor";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [emiParams, setEmiParams] = useState({ principal: 500000, rate: 10.5, tenure: 60 });

  useEffect(() => { 
    injectStyles(); 
  }, []);

  if (!user) {
    return <AuthScreen onLogin={(u) => { injectStyles(); setUser(u); }} />;
  }

  return (
    <AppShell user={user} setUser={setUser} tab={tab} setTab={setTab}>
      {tab === "overview" && <Overview user={user} />}
      {tab === "emi" && <EMICalc params={emiParams} setParams={setEmiParams} user={user} />}
      {tab === "sip" && <SIPCalc user={user} />}
      {tab === "expenses" && <ExpenseTracker user={user} />}
      {tab === "markets" && <Markets user={user} />}
      {tab === "game" && <FinancialGame user={user} />}
      {tab === "ai" && <AIAdvisor user={user} />}
    </AppShell>
  );
}