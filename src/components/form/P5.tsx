import { PhaseProps } from "../../types/analysis"
import { PhaseTitle, Counter, GridSel, Label } from "../ui"

export const P5 = ({ f, s }: PhaseProps) => (
  <div>
    <PhaseTitle icon="🚗" title="Parqueaderos" sub="Puede representar hasta el 8% del valor total." />
    <div style={{ display: "grid", gap: 22 }}>
      <div><Label>Número de parqueaderos incluidos</Label><Counter value={f.parqueaderos || 0} onChange={v => s({ ...f, parqueaderos: v })} min={0} max={5} /></div>
      {(f.parqueaderos || 0) > 0 && <>
        <GridSel label="Tipo de parqueadero" value={f.parqT} onChange={v => s({ ...f, parqT: v })} cols={3} items={[
          { v: "cubierto", l: "Garaje cubierto" }, { v: "paralelo", l: "Paralelo" }, { v: "descubierto", l: "Descubierto" }
        ]} />
        <GridSel label="¿Asignados o zona común?" value={f.parqAsig} onChange={v => s({ ...f, parqAsig: v })} cols={2} items={[
          { v: "asignados", l: "✅ Asignados" }, { v: "comun", l: "🔄 Zona común" }
        ]} />
      </>}
    </div>
  </div>
)
