import { useState } from "react"
import { AnalysisForm, AnalysisResult } from "../../types/analysis"
import { C, TIPO_GRUPO } from "../../constants/analysis"
import { Card } from "../ui"
import { MapView } from "./MapView"
import { User } from "@supabase/supabase-js"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts"

interface ResultsProps {
  form: AnalysisForm
  result: AnalysisResult
  onReset: () => void
  saved: boolean
  user: User | null
  onDashboard: () => void
}

export const Results = ({ form, result, onReset, user, onDashboard }: ResultsProps) => {
  const [tab, setTab] = useState("resumen")
  const area = parseFloat(form.areaConstruida) || 90
  const comps = (result.comparables || []).map(c => ({ ...c, precioM2: Math.round(c.precio / c.area) }))
  const TABS = [{ id: "resumen", l: "📊 Resumen" }, { id: "comparables", l: "🏘️ Comparables" }, { id: "graficos", l: "📈 Gráficos" }, { id: "mapa", l: "🗺️ Mapa" }, { id: "precios", l: "💎 Precios" }]
  const tooltipStyle = { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12, color: C.white }

  const fmt = (n: number): string =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
  const fmtM2 = (n: number): string =>
    `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n)} /m²`

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${C.bg2} 0%, ${C.bg3} 100%)`, borderRadius: 16, padding: "28px 24px", marginBottom: 18, border: `1px solid ${C.green}30`, boxShadow: `0 0 40px ${C.greenGlow}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C.green}08, transparent)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>✦ Análisis Comparativo de Mercado · IA</div>
          {(user?.user_metadata?.logo_url || user?.user_metadata?.company_name) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.user_metadata.logo_url && <img src={user.user_metadata.logo_url as string} alt="logo" style={{ height: 28, borderRadius: 4 }} />}
              {user.user_metadata.company_name && <span style={{ fontSize: 11, color: C.gray }}>{user.user_metadata.company_name as string}</span>}
            </div>
          )}
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, color: C.white, fontWeight: 800 }}>{form.tipo} · {form.barrio}, {form.ciudad}{form.pais && form.pais !== "Colombia" ? `, ${form.pais}` : ""}</h1>
        <div style={{ fontSize: 12.5, color: C.gray, marginBottom: 20 }}>
          {form.areaConstruida || form.areaTerreno || "?"}m²
          {TIPO_GRUPO[form.tipo] === "residencial" && <> · {form.dormitorios || 2} hab · {form.banosC || 1} baños</>}
          {TIPO_GRUPO[form.tipo] !== "terreno" && form.antiguedad && <> · {form.antiguedad} años</>}
          {" · "}{new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "rgba(0,208,132,.08)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.green}20` }}>
            <div style={{ fontSize: 10, color: C.gray, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>Precio de Mercado</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{fmt(result.precio_mercado)}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{fmtM2(result.precio_m2_base)}</div>
          </div>
          <div style={{ background: C.bg3, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.gray, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>Rango</div>
            <div style={{ fontSize: 12, color: C.white, fontWeight: 600, marginTop: 2 }}>{fmt(result.precio_oportunidad)}</div>
            <div style={{ fontSize: 10, color: C.gray }}>hasta {fmt(result.precio_aspiracion)}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: `${C.green}15`, border: `1px solid ${C.green}40`, borderRadius: 20, padding: "3px 12px", fontSize: 10, color: C.green }}>✅ Válido 90 días</span>
          {result._meta?.fuentes && <span style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 10, color: C.gray }}>📊 Fuentes: {result._meta.fuentes}</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 18, background: C.bg2, borderRadius: 12, padding: 4, border: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "9px 4px", borderRadius: 8, border: "none", cursor: "pointer",
            background: tab === t.id ? C.green + "20" : "transparent",
            color: tab === t.id ? C.green : C.gray,
            fontWeight: tab === t.id ? 700 : 400, fontSize: 12,
            borderBottom: tab === t.id ? `2px solid ${C.green}` : "2px solid transparent",
            transition: "all .18s"
          }}>{t.l}</button>
        ))}
      </div>

      {tab === "resumen" && <div style={{ display: "grid", gap: 14 }}>
        <Card glow>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Resumen Ejecutivo</div>
          <p style={{ margin: 0, fontSize: 14.5, color: C.grayL, lineHeight: 1.75 }}>{result.resumen_ejecutivo}</p>
        </Card>
        <Card>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>⚖️ Factores de Valorización</div>
          <div style={{ display: "grid", gap: 8 }}>
            {(result.factores || []).map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 9, background: f.positivo ? "#00D08410" : "#FF444410", borderLeft: `2px solid ${f.positivo ? C.green : C.red}` }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{f.positivo ? "✅" : "⚠️"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{f.factor}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: f.positivo ? C.green : C.red }}>{f.impacto}</span>
                  </div>
                  {f.descripcion && <div style={{ fontSize: 11.5, color: C.gray, marginTop: 3 }}>{f.descripcion}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        {result.recomendaciones && <Card>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🎯 Recomendaciones Estratégicas</div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { icon: "💡", t: "Precio inicial recomendado", v: result.recomendaciones.precio_inicial },
              { icon: "🤝", t: "Estrategia de negociación", v: result.recomendaciones.estrategia },
              { icon: "📣", t: "Atributos a destacar", v: result.recomendaciones.atributos },
              { icon: "⚠️", t: "Posibles objeciones", v: result.recomendaciones.objeciones },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: 14, background: C.bg3, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.white, marginBottom: 4 }}>{r.t}</div>
                  <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{r.v}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>}
      </div>}

      {tab === "comparables" && <Card>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>🏘️ Propiedades Comparables</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Propiedad", "Zona", "Área", "Precio", "$/m²", "Hab", "Años", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 10px", textAlign: "left", color: C.gray, fontWeight: 700, whiteSpace: "nowrap", fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comps.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: C.white }}>{c.nombre}</td>
                  <td style={{ padding: "12px 10px", color: C.gray }}>{c.zona}</td>
                  <td style={{ padding: "12px 10px", color: C.grayL }}>{c.area}m²</td>
                  <td style={{ padding: "12px 10px", fontWeight: 600, color: C.white, fontSize: 12 }}>{fmt(c.precio)}</td>
                  <td style={{ padding: "12px 10px", color: C.green, fontWeight: 700 }}>{new Intl.NumberFormat("es-CO").format(c.precioM2)}</td>
                  <td style={{ padding: "12px 10px", color: C.grayL }}>{c.dormitorios}H/{c.banos}B</td>
                  <td style={{ padding: "12px 10px", color: C.grayL }}>{c.antiguedad}a</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: c.estado === "Excelente" ? "#00D08420" : c.estado === "Bueno" ? "#3B82F620" : "#F59E0B20", color: c.estado === "Excelente" ? C.green : c.estado === "Bueno" ? "#60A5FA" : "#F59E0B" }}>{c.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: C.bg3, borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 12.5, color: C.gray }}>
          <strong style={{ color: C.grayL }}>Promedio:</strong> {fmtM2(Math.round(comps.reduce((a, c) => a + c.precioM2, 0) / Math.max(comps.length, 1)))} &nbsp;·&nbsp; <strong style={{ color: C.green }}>Tu propiedad:</strong> {fmtM2(result.precio_m2_base)}
        </div>
      </Card>}

      {tab === "graficos" && <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <div style={{ fontWeight: 800, color: C.white, marginBottom: 4, fontSize: 15 }}>📈 Tendencia Precio/m² · 12 meses</div>
          <div style={{ fontSize: 12, color: C.gray, marginBottom: 18 }}>Zona {form.barrio}, {form.ciudad}</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={result.tendencia || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="mes" tick={{ fontSize: 9, fill: C.gray }} />
              <YAxis tickFormatter={v => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 9, fill: C.gray }} width={45} />
              <Tooltip formatter={(v: number) => fmtM2(v)} contentStyle={tooltipStyle} labelStyle={{ color: C.green }} />
              <Line type="monotone" dataKey="precio" stroke={C.green} strokeWidth={2.5} dot={{ fill: C.green, r: 3 }} activeDot={{ r: 6, fill: C.green }} />
              <ReferenceLine y={result.precio_m2_base} stroke={C.green} strokeDasharray="5 3" strokeOpacity={.5} label={{ value: "Tu prop.", position: "insideTopRight", fontSize: 9, fill: C.green }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontWeight: 800, color: C.white, marginBottom: 4, fontSize: 15 }}>🏙️ Precio/m² por Zona</div>
          <div style={{ fontSize: 12, color: C.gray, marginBottom: 18 }}>Comparación con zonas aledañas</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={result.zonas_precio || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tickFormatter={v => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 9, fill: C.gray }} />
              <YAxis type="category" dataKey="zona" tick={{ fontSize: 10, fill: C.gray }} width={110} />
              <Tooltip formatter={(v: number) => fmtM2(v)} contentStyle={tooltipStyle} />
              <Bar dataKey="precio" radius={[0, 6, 6, 0]}>
                {(result.zonas_precio || []).map((entry, i) => (
                  <Cell key={i} fill={entry.zona === form.barrio ? C.green : C.bg3} stroke={entry.zona === form.barrio ? C.green : C.border} strokeWidth={1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>}

      {tab === "precios" && <div style={{ display: "grid", gap: 12 }}>
        {[
          { tipo: "Inmediato", precio: result.precio_oportunidad, plazo: result.plazo_oportunidad || "< 30 días", desc: "Precio para cerrar rápido. Genera urgencia y atrae compradores activos.", color: "#60A5FA", border: "#3B82F630", icon: "🔥", rec: false },
          { tipo: "Mercado", precio: result.precio_mercado, plazo: result.plazo_mercado || "1–6 meses", desc: "Precio justo según el mercado actual. Máxima probabilidad de cierre.", color: C.green, border: `${C.green}40`, icon: "⚖️", rec: true },
          { tipo: "Óptimo", precio: result.precio_aspiracion, plazo: result.plazo_aspiracion || "6–12 meses", desc: "Precio máximo. Para quien no tiene prisa y quiere capitalizar al máximo.", color: "#A78BFA", border: "#7C3AED30", icon: "💎", rec: false },
        ].map(p => (
          <div key={p.tipo} style={{ background: C.bg2, borderRadius: 14, padding: "22px 24px", border: `1px solid ${p.border}`, boxShadow: p.rec ? `0 0 20px ${C.greenGlow}` : "none", position: "relative" }}>
            {p.rec && <div style={{ position: "absolute", top: -12, right: 18, background: C.green, color: C.bg, padding: "3px 14px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>⭐ RECOMENDADO</div>}
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 5 }}>{p.icon} Precio de {p.tipo}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: p.color }}>{fmt(p.precio)}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}>{fmtM2(Math.round(p.precio / area))} · {p.plazo}</div>
            <div style={{ marginTop: 10, fontSize: 13.5, color: C.gray, lineHeight: 1.6 }}>{p.desc}</div>
          </div>
        ))}
        {form.precioRef && (() => {
          const ref = parseInt(form.precioRef), diff = ref - result.precio_mercado, pct = ((diff / result.precio_mercado) * 100).toFixed(1)
          return (
            <Card>
              <div style={{ fontWeight: 700, color: C.white, marginBottom: 8, fontSize: 14 }}>📊 Tu precio de referencia vs. mercado</div>
              <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>
                Tu precio <strong style={{ color: C.white }}>{fmt(ref)}</strong> está{" "}
                {diff > 0 ? <span style={{ color: "#A78BFA" }}><strong>{pct}% por encima</strong> del mercado</span> : <span style={{ color: C.green }}><strong>{Math.abs(parseFloat(pct))}% por debajo</strong> del mercado</span>}.{" "}
                {Math.abs(parseFloat(pct)) > 15 ? "Considera ajustarlo para mayor competitividad." : "Está en un rango razonable."}
              </div>
            </Card>
          )
        })()}
      </div>}

      {tab === "mapa" && (
        <Card>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>🗺️ Ubicación y Precios por Zona</div>
          <MapView form={form} result={result} />
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button onClick={() => window.print()} style={{ flex: 2, padding: "14px", borderRadius: 12, border: `1px solid ${C.green}`, background: `${C.green}15`, color: C.green, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>📄 Imprimir / PDF</button>
        {onDashboard && <button onClick={onDashboard} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.gray, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>📊 Dashboard</button>}
        <button onClick={onReset} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.gray, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 Nuevo</button>
      </div>
    </div>
  )
}
