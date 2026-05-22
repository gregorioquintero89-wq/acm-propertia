import { PhaseProps } from "../../types/analysis"
import { PhaseTitle, MoneyInp, Label } from "../ui"
import { C } from "../../constants/analysis"

export const P7 = ({ f, s }: PhaseProps) => (
  <div>
    <PhaseTitle icon="💰" title="Datos Financieros" sub="Opcional — personaliza la recomendación de precio." />
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <Label>Precio de referencia en mente</Label>
        <MoneyInp value={f.precioRef} onChange={v => s({ ...f, precioRef: v })} placeholder="Ej: 750.000.000" />
        {f.precioRef && <div style={{ marginTop: 6, fontSize: 12, color: C.green, fontWeight: 700 }}>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(parseInt(f.precioRef))}</div>}
      </div>
      <div>
        <Label>Notas adicionales</Label>
        <textarea value={f.notas} onChange={e => s({ ...f, notas: e.target.value })}
          placeholder="Ej: ático con terraza privada, bodega adicional, vista panorámica única..."
          style={{ width: "100%", minHeight: 80, padding: "11px 14px", borderRadius: 8, border: `1px solid ${f.notas ? C.green + "60" : C.border}`, fontSize: 13, color: C.white, resize: "vertical", outline: "none", boxSizing: "border-box", background: C.bg3 }} />
      </div>
    </div>
  </div>
)
