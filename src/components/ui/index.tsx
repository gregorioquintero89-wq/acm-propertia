import React from "react"
import { C } from "../../constants/analysis"

export const Card = ({ children, style = {}, glow = false }: { children: React.ReactNode; style?: React.CSSProperties; glow?: boolean }) => (
  <div style={{
    background: C.bg2, borderRadius: 14, padding: 22,
    border: `1px solid ${glow ? C.green + "40" : C.border}`,
    boxShadow: glow ? `0 0 24px ${C.greenGlow}` : "none",
    ...style
  }}>
    {children}
  </div>
)

export const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.grayL, marginBottom: 7, letterSpacing: 1, textTransform: "uppercase" }}>
    {children}{req && <span style={{ color: C.green, marginLeft: 3 }}>*</span>}
  </label>
)

interface SelectOption { v: string; l: string }
export const Sel = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: Array<SelectOption | string>; placeholder?: string }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    width: "100%", padding: "11px 14px", borderRadius: 8,
    border: `1px solid ${value ? C.green + "60" : C.border}`,
    fontSize: 14, color: value ? C.white : C.gray,
    background: C.bg3, outline: "none", cursor: "pointer", transition: "border .2s"
  }}>
    <option value="">{placeholder || "Seleccionar..."}</option>
    {options.map(o => {
      const v = typeof o === "string" ? o : o.v
      const l = typeof o === "string" ? o : o.l
      return <option key={v} value={v} style={{ background: C.bg3 }}>{l}</option>
    })}
  </select>
)

export const Inp = ({ value, onChange, type = "text", placeholder, unit }: {
  value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; unit?: string
}) => (
  <div style={{ position: "relative" }}>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: `11px ${unit ? 44 : 14}px 11px 14px`, borderRadius: 8,
        border: `1px solid ${value ? C.green + "60" : C.border}`,
        fontSize: 14, color: C.white, background: C.bg3, outline: "none", boxSizing: "border-box", transition: "border .2s"
      }}
    />
    {unit && <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.gray, fontWeight: 700 }}>{unit}</span>}
  </div>
)

export const MoneyInp = ({ value, onChange, placeholder, unit = "COP" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; unit?: string
}) => {
  const raw = String(value || "").replace(/\D/g, "")
  const display = raw ? Number(raw).toLocaleString("es-CO") : ""
  return (
    <div style={{ position: "relative" }}>
      <input type="text" inputMode="numeric" value={display}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "11px 52px 11px 14px", borderRadius: 8,
          border: `1px solid ${raw ? C.green + "60" : C.border}`,
          fontSize: 14, color: C.white, background: C.bg3, outline: "none",
          boxSizing: "border-box", transition: "border .2s"
        }}
      />
      <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.gray, fontWeight: 700 }}>{unit}</span>
    </div>
  )
}

interface GridItem { v: string; l: string; icon?: string }
export const GridSel = ({ label, items, value, onChange, cols = 2 }: {
  label?: string; items: GridItem[]; value: string; onChange: (v: string) => void; cols?: number
}) => (
  <div>
    {label && <Label>{label}</Label>}
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 8 }}>
      {items.map(({ v, l, icon }) => (
        <div key={v} onClick={() => onChange(v)} style={{
          padding: "12px 10px", borderRadius: 10, cursor: "pointer", textAlign: "center",
          border: `1px solid ${value === v ? C.green : C.border}`,
          background: value === v ? C.green + "15" : C.bg3,
          color: value === v ? C.green : C.gray,
          fontSize: 13, fontWeight: value === v ? 700 : 400, transition: "all .18s",
          boxShadow: value === v ? `0 0 12px ${C.greenGlow}` : "none"
        }}>
          {icon && <div style={{ fontSize: 18, marginBottom: 3 }}>{icon}</div>}
          {l}
        </div>
      ))}
    </div>
  </div>
)

export const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
    <span style={{ fontSize: 13.5, color: C.grayL }}>{label}</span>
    <div onClick={() => onChange(!value)} style={{
      width: 48, height: 26, borderRadius: 13,
      background: value ? C.green : C.bg3, border: `1px solid ${value ? C.green : C.border}`,
      cursor: "pointer", position: "relative", transition: "all .25s", flexShrink: 0
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: C.white,
        position: "absolute", top: 2, left: value ? 25 : 3, transition: "left .22s",
        boxShadow: "0 1px 4px rgba(0,0,0,.4)"
      }} />
    </div>
  </div>
)

export const Counter = ({ value, onChange, min = 0, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <button onClick={() => onChange(Math.max(min, value - 1))} style={{
      width: 38, height: 38, borderRadius: "50%", border: `1px solid ${C.green}`, background: "transparent",
      color: C.green, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
    }}>−</button>
    <span style={{ fontSize: 24, fontWeight: 800, color: C.white, minWidth: 28, textAlign: "center" }}>{value}</span>
    <button onClick={() => onChange(Math.min(max, value + 1))} style={{
      width: 38, height: 38, borderRadius: "50%", border: "none", background: C.green,
      color: C.bg, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
    }}>+</button>
  </div>
)

export const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <div onClick={onClick} style={{
    padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12,
    border: `1px solid ${active ? C.green : C.border}`,
    background: active ? C.green + "20" : C.bg3,
    color: active ? C.green : C.gray,
    fontWeight: active ? 700 : 400, transition: "all .18s"
  }}>{label}</div>
)

export const PhaseTitle = ({ icon, title, sub }: { icon: string; title: string; sub?: string }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 10 }}>{icon}</div>
    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: -.5 }}>{title}</h2>
    {sub && <p style={{ margin: "6px 0 0", fontSize: 13.5, color: C.gray, lineHeight: 1.5 }}>{sub}</p>}
  </div>
)

export * from "./ProgressBar"
export * from "./Loading"
export * from "./LocationMap"
export * from "./PlacesInput"
