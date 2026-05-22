import { PhaseProps } from "../../types/analysis"
import { PhaseTitle, Label, Sel, Inp } from "../ui"
import { PAISES, TIPOS_PROPIEDAD } from "../../constants/analysis"
import { LocationMap } from "../ui"

export const P1 = ({ f, s }: PhaseProps) => (
  <div>
    <PhaseTitle icon="📍" title="Ubicación y Tipo de Propiedad" sub="¿Dónde está y qué tipo de propiedad es?" />
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <Label req>País</Label>
        <Sel value={f.pais || "Colombia"} onChange={v => s({ ...f, pais: v, ciudad: "", barrio: "" })} options={PAISES} placeholder="Selecciona país" />
      </div>
      <div>
        <Label req>Ciudad</Label>
        <Inp value={f.ciudad} onChange={v => s({ ...f, ciudad: v })} placeholder="Ej: Medellín, Bogotá, Ciudad de México..." />
      </div>
      <div>
        <Label req>Barrio</Label>
        <Inp value={f.barrio} onChange={v => s({ ...f, barrio: v })} placeholder="Ej: El Poblado, Usaquén, Laureles..." />
      </div>
      <div>
        <Label>Dirección <span style={{ color: "#888888", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></Label>
        <Inp value={f.direccion || ""} onChange={v => s({ ...f, direccion: v })} placeholder="Ej: Cra 43A #7-50, Torre 2 Apto 301" />
      </div>
      <LocationMap form={f} />
      <div>
        <Label req>Tipo de propiedad</Label>
        <Sel value={f.tipo} onChange={v => s({ ...f, tipo: v })} options={TIPOS_PROPIEDAD} placeholder="Selecciona tipo de propiedad" />
      </div>
    </div>
  </div>
)
