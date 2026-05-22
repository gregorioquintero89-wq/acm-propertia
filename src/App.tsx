import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import AuthPage from "./components/pages/AuthPage"
import OnboardingPage from "./components/pages/OnboardingPage"
import DashboardPage from "./components/pages/DashboardPage"
import type { User, Session } from "@supabase/supabase-js"

import { AppView, AnalysisForm, AnalysisResult } from "./types/analysis"
import { C, INITIAL_FORM_STATE, API_BASE } from "./constants/analysis"
import { LandingPage } from "./components/LandingPage"
import { Card, ProgressBar, Loading } from "./components/ui"
import { P1 } from "./components/form/P1"
import { P2 } from "./components/form/P2"
import { P3 } from "./components/form/P3"
import { P4 } from "./components/form/P4"
import { P5 } from "./components/form/P5"
import { P7 } from "./components/form/P7"
import { Results } from "./components/results/Results"

export default function App() {
  const [view, setView] = useState<AppView>("landing")
  const [phase, setPhase] = useState(1)
  const [form, setForm] = useState<AnalysisForm>({ ...INITIAL_FORM_STATE } as AnalysisForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) { setSession(s); setUser(s.user) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s); setUser(s?.user ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const PHASES = [
    <P1 f={form} s={setForm} />, 
    <P2 f={form} s={setForm} />, 
    <P3 f={form} s={setForm} />,
    <P4 f={form} s={setForm} />, 
    <P5 f={form} s={setForm} />, 
    <P7 f={form} s={setForm} />,
  ]

  const next = async () => {
    if (phase < 6) { setPhase(p => p + 1); return }
    setLoading(true); setError(null); setSaved(false)
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form }),
      })
      if (!res.ok) throw new Error("Error del servidor")
      const data = await res.json() as AnalysisResult
      setResult(data)
      fetch(`${API_BASE}/api/save-analysis`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form, result: data, userId: user?.id }),
      }).then(r => r.ok && setSaved(true)).catch(console.warn)
    } catch (_) {
      setError("Error al generar el análisis. Por favor intenta de nuevo.")
    } finally { setLoading(false) }
  }

  const reset = () => { setPhase(1); setForm({ ...INITIAL_FORM_STATE } as AnalysisForm); setResult(null); setError(null); setSaved(false) }
  const startAnalysis = () => { setView("analysis"); setPhase(1) }

  const handleAuthSuccess = () => {
    if (user?.user_metadata?.company_name) { setView("dashboard") } else { setView("onboarding") }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); setView("auth") }

  if (view === "landing") return <LandingPage onStart={() => setView("auth")} />
  if (view === "auth") return <AuthPage onAuthSuccess={handleAuthSuccess} />
  if (view === "onboarding") return <OnboardingPage user={user!} onComplete={() => setView("dashboard")} />
  if (view === "dashboard") return <DashboardPage user={user!} onNewAnalysis={startAnalysis} onLogout={handleLogout} />

  return (
    <>
      <style>{`
        * { box-sizing:border-box; -webkit-font-smoothing:antialiased; }
        body { margin:0; background:${C.bg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:${C.white}; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        select option { background:${C.bg3}; color:${C.white}; }
        input::placeholder, textarea::placeholder { color:${C.gray}; }
        select:focus, input:focus, textarea:focus { border-color:${C.green}!important; box-shadow:0 0 0 3px ${C.greenGlow}; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:${C.green}60; border-radius:2px; }
        @media print { body { background:white; color:black; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, padding: "20px 14px 40px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, background: `linear-gradient(135deg,${C.green},${C.greenD})`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 16px ${C.greenGlow}` }}>🏠</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.white, lineHeight: 1, letterSpacing: -.5 }}>Análisis Comparativo de Mercado</div>
                <div style={{ fontSize: 10, color: C.green, letterSpacing: 2, textTransform: "uppercase" }}>Propertia Realty · ACM Profesional</div>
              </div>
            </div>
            {!result && !loading && (
              <div style={{ fontSize: 11.5, color: C.gray, background: C.bg2, padding: "5px 14px", borderRadius: 20, border: `1px solid ${C.border}` }}>Fase {phase} / 6</div>
            )}
          </div>

          {error && <div style={{ background: "#FF444415", border: "1px solid #FF444440", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: C.red, fontSize: 13 }}>⚠️ {error}</div>}

          {loading && <Card><Loading /></Card>}
          {result && !loading && <Results form={form} result={result} onReset={reset} saved={saved} user={user} onDashboard={() => { setView("dashboard"); setResult(null) }} />}

          {!loading && !result && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <ProgressBar current={phase} />
              <Card>
                {PHASES[phase - 1]}
                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  {phase > 1 && (
                    <button onClick={() => setPhase(p => p - 1)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.gray, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Atrás</button>
                  )}
                  <button onClick={next} style={{
                    flex: 3, padding: "14px", borderRadius: 12, border: "none",
                    background: `linear-gradient(135deg,${C.green},${C.greenD})`,
                    color: C.bg, fontWeight: 800, fontSize: 15, cursor: "pointer",
                    boxShadow: `0 4px 20px ${C.greenGlow}`, letterSpacing: .3
                  }}>
                    {phase === 6 ? "✦ Generar Análisis con IA" : "Continuar →"}
                  </button>
                </div>
              </Card>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 11.5, color: C.gray }}>💾 Tus respuestas se guardan automáticamente · Puedes volver atrás en cualquier momento</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
