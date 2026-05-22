import { PhaseProps } from "../../types/analysis"
import { PhaseTitle, Label, Inp, GridSel, Toggle, Chip } from "../ui"
import { TIPO_GRUPO, C } from "../../constants/analysis"

export function P2({ f, s }: PhaseProps) {
  const grupo = TIPO_GRUPO[f.tipo] || "residencial"
  const esFinca = f.tipo === "Finca"

  if (grupo === "terreno") return (
    <div>
      <PhaseTitle icon="📐" title="Datos del Terreno" sub="Las variables que determinan el valor del lote o finca." />
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: esFinca ? "1fr 1fr" : "1fr", gap: 12 }}>
          <div><Label req>Área del terreno</Label><Inp type="number" value={f.areaTerreno} onChange={v => s({ ...f, areaTerreno: v })} placeholder="Ej: 300" unit="m²" /></div>
          {esFinca && <div><Label>Área construida</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({ ...f, areaConstruida: v })} placeholder="Si tiene casa" unit="m²" /></div>}
        </div>
        <GridSel label="Topografía" value={f.topografia} onChange={v => s({ ...f, topografia: v })} cols={3} items={[
          { v: "plano", l: "⬜ Plano" }, { v: "ondulado", l: "〰️ Ondulado" }, { v: "inclinado", l: "📐 Inclinado" }
        ]} />
        {(f.tipo === "Lote urbano" || f.tipo === "Lote en condominio" || f.tipo === "Lote industrial") && (
          <div><Label>Frente a vía (metros lineales)</Label><Inp type="number" value={f.frenteVia} onChange={v => s({ ...f, frenteVia: v })} placeholder="Ej: 12" unit="m" /></div>
        )}
        <div>
          <Label>Servicios disponibles</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
            {["Agua", "Luz", "Gas", "Alcantarillado", "Internet", "Vías pavimentadas"].map(sv => {
              const sel = (f.servicios || []).includes(sv)
              return <Chip key={sv} label={sv} active={sel} onClick={() => {
                const arr = f.servicios || []
                s({ ...f, servicios: sel ? arr.filter(x => x !== sv) : [...arr, sv] })
              }} />
            })}
          </div>
        </div>
        {esFinca && (
          <GridSel label="Estado de la finca" value={f.estado} onChange={v => s({ ...f, estado: v })} cols={2} items={[
            { v: "Excelente", l: "✨ Excelente" }, { v: "Bueno", l: "👍 Bueno" },
            { v: "Regular", l: "⚠️ Regular" }, { v: "Para remodelar", l: "🔨 Para remodelar" }
          ]} />
        )}
      </div>
    </div>
  )

  return (
    <div>
      <PhaseTitle icon="🏗️" title="Detalles Básicos" sub="Área, antigüedad y estado de la propiedad." />
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><Label req>Área construida</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({ ...f, areaConstruida: v })} placeholder="Ej: 90" unit="m²" /></div>
          <div><Label>Área terreno</Label><Inp type="number" value={f.areaTerreno} onChange={v => s({ ...f, areaTerreno: v })} placeholder="Si aplica" unit="m²" /></div>
        </div>
        <div><Label req>Antigüedad</Label><Inp type="number" value={f.antiguedad} onChange={v => s({ ...f, antiguedad: v })} placeholder="Años desde construcción" unit="años" /></div>
        <GridSel label="Estado actual *" value={f.estado} onChange={v => s({ ...f, estado: v })} cols={2} items={[
          { v: "Excelente", l: "✨ Excelente" }, { v: "Bueno", l: "👍 Bueno" },
          { v: "Regular", l: "⚠️ Regular" }, { v: "Para remodelar", l: "🔨 Para remodelar" }
        ]} />
        <div>
          <Toggle label="¿Ha sido remodelado?" value={f.remodelado === "si"} onChange={v => s({ ...f, remodelado: v ? "si" : "no" })} />
          {f.remodelado === "si" && (
            <div style={{ marginTop: 14, paddingLeft: 14, borderLeft: `2px solid ${C.green}`, display: "grid", gap: 12 }}>
              <div><Label>¿Hace cuántos años?</Label><Inp type="number" value={f.remodelAnios} onChange={v => s({ ...f, remodelAnios: v })} placeholder="Años" unit="años" /></div>
              <div>
                <Label>Áreas remodeladas</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
                  {["Cocina", "Baños", "Pisos", "Fachada", "Eléctrico", "Completo"].map(a => {
                    const sel = (f.remodelAreas || []).includes(a)
                    return <Chip key={a} label={a} active={sel} onClick={() => {
                      const arr = f.remodelAreas || []
                      s({ ...f, remodelAreas: sel ? arr.filter(x => x !== a) : [...arr, a] })
                    }} />
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
