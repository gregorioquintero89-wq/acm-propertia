import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import type { User } from "@supabase/supabase-js"

const S: Record<string, string> = {
  surface: "#f7f9fb",
  "surface-dim": "#d8dadc",
  "container-lowest": "#ffffff",
  "container-low": "#f2f4f6",
  container: "#eceef0",
  "container-high": "#e6e8ea",
  "container-highest": "#e0e3e5",
  "on-surface": "#191c1e",
  "on-surface-variant": "#45464d",
  primary: "#000000",
  "on-primary": "#ffffff",
  secondary: "#006c49",
  "on-secondary": "#ffffff",
  "secondary-container": "#6cf8bb",
  outline: "#76777d",
  "outline-variant": "#c6c6cd",
}

interface Analysis {
  id: string
  created_at: string
  user_id: string | null
  ciudad: string
  barrio: string
  tipo: string
  estrato: number | null
  area_construida: number | null
  precio_mercado: number | null
}

const fmt = (n: number | null | undefined): string => {
  if (!n) return "$0"
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

const fmtDate = (d: string): string =>
  new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })

interface HeatmapProps {
  analyses: Analysis[]
}

function Heatmap({ analyses }: HeatmapProps) {
  const counts: Record<string, number> = {}
  analyses.forEach(a => {
    const key = `${a.ciudad} - ${a.barrio}`
    counts[key] = (counts[key] ?? 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...sorted.map(([, c]) => c), 1)

  return (
    <div style={{ background: S["container-lowest"], borderRadius: 12, padding: 24, border: `1px solid ${S["outline-variant"]}` }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>📍 Zonas Analizadas</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {sorted.map(([key, count]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, minWidth: 160, color: S["on-surface"] }}>{key}</span>
            <div style={{ flex: 1, height: 24, background: S["container-low"], borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(count / maxCount) * 100}%`,
                background: `linear-gradient(90deg, ${S.secondary}44, ${S.secondary})`,
                borderRadius: 6, transition: "width .5s",
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: S.secondary, minWidth: 24, textAlign: "right" }}>{count}</span>
          </div>
        ))}
        {sorted.length === 0 && (
          <p style={{ color: S["on-surface-variant"], fontSize: 14 }}>Aún no has realizado análisis.</p>
        )}
      </div>
    </div>
  )
}

interface DashboardPageProps {
  user: User
  onNewAnalysis: () => void
  onLogout: () => void
}

export default function DashboardPage({ user, onNewAnalysis, onLogout }: DashboardPageProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from("analisis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data) setAnalyses(data as Analysis[])
        setLoadingAnalyses(false)
      })
  }, [user])

  const stats = analyses.length > 0 ? {
    total: analyses.length,
    avg: Math.round(analyses.reduce((s, a) => s + (a.precio_mercado ?? 0), 0) / analyses.length),
    cities: [...new Set(analyses.map(a => a.ciudad))].length,
  } : null

  return (
    <div style={{ minHeight: "100vh", background: S.surface, fontFamily: "Inter, -apple-system, sans-serif" }}>
      <header style={{ background: S["container-lowest"], borderBottom: `1px solid ${S["outline-variant"]}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: S.primary, letterSpacing: "-0.02em" }}>EstateAnalytix</span>
            {user?.user_metadata?.logo_url && (
              <img src={user.user_metadata.logo_url as string} alt="" style={{ height: 24, borderRadius: 4 }} />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {user?.user_metadata?.company_name && (
              <span style={{ fontSize: 13, color: S["on-surface-variant"] }}>{user.user_metadata.company_name as string}</span>
            )}
            <button onClick={onLogout} style={{ background: "transparent", border: `1px solid ${S["outline-variant"]}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, color: S["on-surface-variant"], cursor: "pointer" }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: S.primary, margin: "0 0 4px" }}>
              {user?.user_metadata?.company_name ? `${user.user_metadata.company_name as string}` : "Dashboard"}
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: S["on-surface-variant"] }}>
              {analyses.length > 0
                ? `${analyses.length} análisis${analyses.length === 1 ? "" : "s"} realizados`
                : "Bienvenido, realiza tu primer análisis"}
            </p>
          </div>
          <button onClick={onNewAnalysis} style={{
            background: S.secondary, color: S["on-secondary"], border: "none",
            borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            + Nuevo Análisis
          </button>
        </div>

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Análisis Totales", value: stats.total, icon: "📊" },
              { label: "Precio Promedio", value: fmt(stats.avg), icon: "💰" },
              { label: "Ciudades", value: stats.cities, icon: "🏙️" },
            ].map((s, i) => (
              <div key={i} style={{ background: S["container-lowest"], borderRadius: 12, padding: "20px 24px", border: `1px solid ${S["outline-variant"]}` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: S.primary, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: S["on-surface-variant"] }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: S.primary, margin: "0 0 16px" }}>Análisis Recientes</h2>
            {loadingAnalyses ? (
              <p style={{ color: S["on-surface-variant"] }}>Cargando...</p>
            ) : analyses.length === 0 ? (
              <div style={{ background: S["container-lowest"], borderRadius: 12, padding: 40, textAlign: "center", border: `1px solid ${S["outline-variant"]}` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Sin análisis aún</h3>
                <p style={{ fontSize: 14, color: S["on-surface-variant"], margin: "0 0 20px" }}>Realiza tu primer análisis de mercado para tu próxima propiedad.</p>
                <button onClick={onNewAnalysis} style={{ background: S.secondary, color: S["on-secondary"], border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Comenzar Análisis
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {analyses.map(a => (
                  <div key={a.id} style={{ background: S["container-lowest"], borderRadius: 12, padding: "16px 20px", border: `1px solid ${S["outline-variant"]}`, cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{a.tipo} · {a.barrio}</span>
                      <span style={{ fontSize: 12, color: S["on-surface-variant"] }}>{fmtDate(a.created_at)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: S["on-surface-variant"] }}>
                      <span>{a.ciudad}</span>
                      {a.area_construida && <span>{a.area_construida} m²</span>}
                      <span style={{ fontWeight: 700, color: S.secondary }}>{fmt(a.precio_mercado)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {analyses.length > 0 && <Heatmap analyses={analyses} />}
        </div>
      </main>
    </div>
  )
}
