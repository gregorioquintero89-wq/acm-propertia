import { PhaseProps } from "../../types/analysis"
import { PhaseTitle, Toggle, Sel, Chip, Label, MoneyInp } from "../ui"
import { TIPO_GRUPO } from "../../constants/analysis"

export function P4({ f, s }: PhaseProps) {
  const grupo = TIPO_GRUPO[f.tipo] || "residencial"
  const esResidencial = grupo === "residencial"
  return (
    <div>
      <PhaseTitle
        icon={esResidencial ? "🏊" : "🔒"}
        title={esResidencial ? "Amenidades y Servicios" : "Servicios del Inmueble"}
        sub={esResidencial ? "Pueden aumentar el valor entre 8% y 20%." : "Servicios que inciden en el valor comercial."}
      />
      <div style={{ display: "grid", gap: 2 }}>
        {esResidencial && <>
          <Toggle label="🏊 Piscina" value={!!f.piscina} onChange={v => s({ ...f, piscina: v })} />
          <Toggle label="💪 Gimnasio" value={!!f.gimnasio} onChange={v => s({ ...f, gimnasio: v })} />
          <Toggle label="🎉 Salón social / Eventos" value={!!f.salon} onChange={v => s({ ...f, salon: v })} />
          <Toggle label="🧒 Parque infantil" value={!!f.parque} onChange={v => s({ ...f, parque: v })} />
          <Toggle label="🧖 Sauna / Turco" value={!!f.sauna} onChange={v => s({ ...f, sauna: v })} />
        </>}
        <Toggle label="🛗 Ascensor" value={!!f.ascensor} onChange={v => s({ ...f, ascensor: v })} />
        <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
          <div><Label>Planta eléctrica</Label><Sel value={f.plantaElec} onChange={v => s({ ...f, plantaElec: v })} options={["Total", "Parcial", "No tiene"]} placeholder="Seleccionar..." /></div>
          <div>
            <Label>Seguridad</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
              {["Portería 24/7", "Acceso inteligente", "Sin seguridad"].map(sg => (
                <Chip key={sg} label={sg} active={f.seguridad === sg} onClick={() => s({ ...f, seguridad: sg })} />
              ))}
            </div>
          </div>
          {grupo !== "comercial" && (
            <div><Label>Administración mensual</Label><MoneyInp value={f.adminM} onChange={v => s({ ...f, adminM: v })} placeholder="Ej: 350.000" /></div>
          )}
        </div>
      </div>
    </div>
  )
}
