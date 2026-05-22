import { useState, useEffect } from "react"
import { C } from "../../constants/analysis"

export const Loading = () => {
  const [step, setStep] = useState(0)
  const steps = ["Procesando datos de la propiedad...", "Consultando mercado colombiano 2025...", "Calculando comparables en la zona...", "Generando valoración profesional...", "Finalizando análisis..."]
  useEffect(() => { const iv = setInterval(() => setStep(s => Math.min(s + 1, 4)), 1400); return () => clearInterval(iv) }, [])
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 28px" }}>
        <div style={{ width: 80, height: 80, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.green}`, borderRadius: "50%", animation: "spin .8s linear infinite", boxShadow: `0 0 20px ${C.greenGlow}` }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 28 }}>🏠</div>
      </div>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, color: C.white, fontWeight: 800 }}>Analizando el mercado</h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: C.gray }}>Generando tu análisis profesional de mercado...</p>
      <div style={{ display: "grid", gap: 8, maxWidth: 300, margin: "0 auto" }}>
        {steps.map((st, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 9, background: i <= step ? C.bg3 : "transparent", border: `1px solid ${i <= step ? C.border : "transparent"}` }}>
            <span style={{ fontSize: 14 }}>{i < step ? "✅" : i === step ? "⏳" : "○"}</span>
            <span style={{ fontSize: 13, color: i === step ? C.green : i < step ? C.grayL : C.gray, fontWeight: i === step ? 700 : 400 }}>{st}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
