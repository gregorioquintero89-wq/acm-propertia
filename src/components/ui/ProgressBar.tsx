import { C } from "../../constants/analysis"

const PHASE_LABELS = ["Ubicación", "Detalles", "Interiores", "Amenidades", "Parqueadero", "Financiero"]

export const ProgressBar = ({ current }: { current: number }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
      <div style={{ position: "absolute", top: 14, left: "5%", right: "5%", height: 1, background: C.border, zIndex: 0 }} />
      <div style={{
        position: "absolute", top: 14, left: "5%", height: 1, zIndex: 1,
        width: `${Math.min(100, ((current - 1) / 5) * 100)}%`,
        background: `linear-gradient(90deg,${C.green},${C.greenD})`,
        transition: "width .4s ease", boxShadow: `0 0 8px ${C.green}`
      }} />
      {PHASE_LABELS.map((lbl, i) => {
        const done = i + 1 < current, active = i + 1 === current
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: done ? C.green : active ? C.bg : C.bg3,
              border: `1px solid ${done || active ? C.green : C.border}`,
              color: done ? C.bg : active ? C.green : C.gray,
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: active ? `0 0 12px ${C.green}` : "none", transition: "all .25s"
            }}>
              {done ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 9, color: active ? C.green : C.gray, marginTop: 5, fontWeight: active ? 700 : 400 }}>{lbl}</span>
          </div>
        )
      })}
    </div>
  </div>
)
