import React from "react"

const L: Record<string, string> = {
  surface: "#f7f9fb", "container-lowest": "#ffffff", "container-low": "#f2f4f6",
  container: "#eceef0", "container-high": "#e6e8ea",
  "on-surface": "#191c1e", "on-surface-variant": "#45464d",
  primary: "#000000", "on-primary": "#ffffff", "primary-container": "#131b2e",
  secondary: "#006c49", "on-secondary": "#ffffff",
  "secondary-container": "#6cf8bb", "outline-variant": "#c6c6cd",
}

export function LandingPage({ onStart }: { onStart: () => void }) {
  const container: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%" }
  const card: React.CSSProperties = { background: L["container-lowest"], borderRadius: 10, boxShadow: "0px 4px 20px rgba(15,23,42,0.05)", border: `1px solid ${L["outline-variant"]}` }

  return (
    <div style={{ background: L.surface, minHeight: "100vh", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: L["container-lowest"], boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: L.primary, letterSpacing: "-0.02em" }}>EstateAnalytix</span>
            <nav style={{ display: "flex", gap: 20, color: L["on-surface-variant"], fontSize: 13, fontWeight: 500 }}>
              {["Dashboard", "Mercado", "Portafolio", "Reportes"].map(l => (
                <span key={l} style={{ cursor: "pointer" }}>{l}</span>
              ))}
            </nav>
          </div>
          <button onClick={onStart} style={{ background: L.secondary, color: L["on-secondary"], border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Nuevo Análisis
          </button>
        </div>
      </header>

      <main style={{ paddingTop: 60 }}>
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", textAlign: "center", padding: "40px 24px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
            <h1 style={{ fontSize: 44, fontWeight: 700, color: L.primary, lineHeight: 1.15, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              Transforme Datos en <span style={{ color: L.secondary }}>Decisiones Inmobiliarias</span> de Alto Impacto
            </h1>
            <p style={{ fontSize: 16, color: L["on-surface-variant"], lineHeight: 1.6, maxWidth: 560, margin: "0 auto 28px" }}>
              Análisis de mercado en tiempo real con Machine Learning, proyecciones de rentabilidad y tendencias locales para profesionales inmobiliarios en Colombia.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              <div style={{ flex: "1 1 180px", display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: L["container-lowest"], borderRadius: 8, border: `1px solid ${L["outline-variant"]}`, maxWidth: 220, minWidth: 140 }}>
                <span>📍</span><input placeholder="Ciudad" style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent" }} />
              </div>
              <div style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: L["container-lowest"], borderRadius: 8, border: `1px solid ${L["outline-variant"]}`, maxWidth: 200, minWidth: 120 }}>
                <span>🏘️</span><input placeholder="Barrio" style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent" }} />
              </div>
              <div style={{ flex: "1 1 130px", display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: L["container-lowest"], borderRadius: 8, border: `1px solid ${L["outline-variant"]}`, maxWidth: 170, minWidth: 100 }}>
                <span>🏷️</span>
                <select style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent", color: L["on-surface-variant"] }}>
                  <option>Tipo</option><option>Residencial</option><option>Comercial</option><option>Industrial</option>
                </select>
              </div>
              <button onClick={onStart} style={{ background: L.primary, color: L["on-primary"], border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                🔍 Analizar
              </button>
            </div>
          </div>
        </section>

        <section style={{ ...container, paddingBottom: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
            <div style={{ ...card, gridColumn: "span 8", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Tendencias de Precio</h3>
                <span style={{ color: L.secondary, fontSize: 11, fontWeight: 600, background: L["secondary-container"], padding: "3px 8px", borderRadius: 20 }}>+9.8% Anual</span>
              </div>
              <div style={{ height: 180, background: L["container-low"], borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: L["on-surface-variant"], fontSize: 14 }}>📈 Tendencia de precios en Colombia</div>
            </div>
            <div style={{ gridColumn: "span 4", background: L.primary, color: L["on-primary"], borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: "#fff" }}>Confianza del Mercado</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>Sectores prime muestran alta demanda en Medellín y Bogotá.</p>
              </div>
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${L["primary-container"]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>76/100</div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "3px 0 0" }}>Score de Confianza</p>
                  </div>
                  <span style={{ fontSize: 20 }}>📈</span>
                </div>
              </div>
            </div>
            <div style={{ ...card, gridColumn: "span 4", padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 600 }}>Zonas Hotspot</h3>
              {[{ n: "El Poblado, Medellín", r: "6.2%" }, { n: "Usaquén, Bogotá", r: "5.1%" }, { n: "El Cabrero, Cartagena", r: "7.4%" }].map((z, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, background: i === 0 ? L["secondary-container"] : "#e0e3e5", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i === 0 ? L.secondary : L["on-surface"] }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{z.n}</div>
                      <div style={{ fontSize: 11, color: L["on-surface-variant"] }}>Rentabilidad {z.r}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 16 }}>↗️</span>
                </div>
              ))}
            </div>
            <div style={{ ...card, gridColumn: "span 8", padding: 0, overflow: "hidden", position: "relative", minHeight: 200 }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${L.primary}E6, transparent)`, zIndex: 1 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: 20 }}>
                <span style={{ background: L.secondary, color: L["on-secondary"], padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, display: "inline-block", marginBottom: 6 }}>🏆 PROPIEDAD DESTACADA</span>
                <h3 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 600, color: "#fff" }}>Rancho Santa Isabel</h3>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 13, maxWidth: 360, lineHeight: 1.5 }}>Análisis de rentabilidad proyectada en la vía Medellín–Rionegro.</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: L["container-low"], padding: "48px 0" }}>
          <div style={{ ...container, textAlign: "center" }}>
            <h2 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Potencia tu estrategia con Machine Learning</h2>
            <p style={{ fontSize: 15, color: L["on-surface-variant"], maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.5 }}>Nuestro motor procesa datos de múltiples fuentes para darte una visión clara del mercado inmobiliario colombiano.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { icon: "🕸️", title: "Recopilación en Vivo", desc: "Scraping de Metrocuadrado, FincaRaíz + datos de Supabase." },
                { icon: "🧠", title: "Análisis con IA", desc: "Machine Learning calcula precio de oportunidad, mercado y aspiración." },
                { icon: "📋", title: "Reporte Completo", desc: "Gráficos, mapa de calor, comparables y recomendaciones." },
              ].map((item, i) => (
                <div key={i} style={{ ...card, padding: 20, textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, background: L.primary, color: L["on-primary"], borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, margin: "0 auto 12px" }}>{item.icon}</div>
                  <h4 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{item.title}</h4>
                  <p style={{ fontSize: 13, color: L["on-surface-variant"], margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...container, padding: "40px 0", textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Cobertura en Colombia</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {["Medellín", "Bogotá", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Cúcuta", "Ibagué", "Villavicencio"].map(c => (
              <span key={c} style={{ background: L["container-lowest"], borderRadius: 16, padding: "5px 14px", fontSize: 12, fontWeight: 500, border: `1px solid ${L["outline-variant"]}` }}>{c}</span>
            ))}
          </div>
        </section>

        <section style={{ ...container, paddingBottom: 40 }}>
          <div style={{ background: L.primary, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", color: "#fff" }}>¿Listo para tasar tu propiedad?</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 20px", lineHeight: 1.5 }}>Obtén el valor real de mercado con datos actualizados al instante.</p>
            <button onClick={onStart} style={{ background: L.secondary, color: L["on-secondary"], border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Comenzar Análisis Gratis</button>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${L["outline-variant"]}`, padding: "14px 0" }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: L["on-surface-variant"] }}>EstateAnalytix © 2025</span>
          <span style={{ fontSize: 12, color: L["on-surface-variant"] }}>Hecho en 🇨🇴</span>
        </div>
      </footer>
    </div>
  )
}
