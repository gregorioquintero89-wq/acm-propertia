import { PhaseProps } from "../../types/analysis"
import { PhaseTitle, GridSel, MoneyInp, Counter, Label, Chip } from "../ui"
import { TIPO_GRUPO, C } from "../../constants/analysis"

export function P3({ f, s }: PhaseProps) {
  const grupo = TIPO_GRUPO[f.tipo] || "residencial"

  if (grupo === "terreno") return (
    <div>
      <PhaseTitle icon="🌱" title="Características del Terreno" sub="Área y ubicación son los factores principales para valorar." />
      <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: "center", color: C.grayL, lineHeight: 1.7 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
        <p style={{ margin: 0, fontWeight: 600, color: C.white }}>Los datos básicos son suficientes para este tipo.</p>
        <p style={{ margin: "8px 0 0", fontSize: 13 }}>Para lotes y fincas el valor depende del área, ubicación y zonificación. Continúa al siguiente paso.</p>
      </div>
    </div>
  )

  if (grupo === "comercial") return (
    <div>
      <PhaseTitle icon="🏢" title="Detalles Comerciales" sub="Acabados y administración definen el valor de una propiedad comercial." />
      <div style={{ display: "grid", gap: 22 }}>
        <GridSel label="Estado de los acabados" value={f.acabados} onChange={v => s({ ...f, acabados: v })} cols={2} items={[
          { v: "basicos", l: "Básicos", icon: "🔧" }, { v: "estandar", l: "Estándar", icon: "🏠" },
          { v: "premium", l: "Premium", icon: "✨" }, { v: "lujo", l: "Lujo", icon: "💎" }
        ]} />
        <div><Label>Administración mensual</Label><MoneyInp value={f.adminM} onChange={v => s({ ...f, adminM: v })} placeholder="Ej: 450.000 — 0 si no aplica" /></div>
      </div>
    </div>
  )

  if (grupo === "industrial") return (
    <div>
      <PhaseTitle icon="🏭" title="Detalles de la Bodega" sub="Estado y características operativas de la bodega." />
      <div style={{ display: "grid", gap: 22 }}>
        <GridSel label="Estado actual" value={f.estado} onChange={v => s({ ...f, estado: v })} cols={2} items={[
          { v: "Excelente", l: "✨ Excelente" }, { v: "Bueno", l: "👍 Bueno" },
          { v: "Regular", l: "⚠️ Regular" }, { v: "Para remodelar", l: "🔨 Para remodelar" }
        ]} />
        <GridSel label="Altura libre de la bodega" value={f.altBodega} onChange={v => s({ ...f, altBodega: v })} cols={3} items={[
          { v: "hasta6m", l: "Hasta 6m" }, { v: "6a10m", l: "6 – 10m" }, { v: "mas10m", l: "Más de 10m" }
        ]} />
        <div>
          <Label>Muelles de cargue</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
            {["Muelle cubierto", "Muelle a nivel", "Sin muelle"].map(m => (
              <Chip key={m} label={m} active={f.muellesT === m} onClick={() => s({ ...f, muellesT: m })} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )

  type CounterKey = "dormitorios" | "banosC" | "banosS"
  const counterFields: Array<{ l: string; k: CounterKey; min: number; max: number }> = [
    { l: "Dormitorios", k: "dormitorios", min: 1, max: 8 },
    { l: "Baños completos", k: "banosC", min: 0, max: 6 },
    { l: "Baños sociales", k: "banosS", min: 0, max: 3 },
  ]

  return (
    <div>
      <PhaseTitle icon="🛋️" title="Distribución y Acabados" sub="Los interiores que determinan el valor." />
      <div style={{ display: "grid", gap: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {counterFields.map(({ l, k, min, max }) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              <Counter value={f[k] ?? min} onChange={v => s({ ...f, [k]: v })} min={min} max={max} />
            </div>
          ))}
        </div>
        <GridSel label="Nivel de acabados *" value={f.acabados} onChange={v => s({ ...f, acabados: v })} cols={2} items={[
          { v: "basicos", l: "Básicos", icon: "🔧" }, { v: "estandar", l: "Estándar", icon: "🏠" },
          { v: "premium", l: "Premium", icon: "✨" }, { v: "lujo", l: "Lujo", icon: "💎" }
        ]} />
      </div>
    </div>
  )
}
