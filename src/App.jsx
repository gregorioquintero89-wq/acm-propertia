import { useState, useRef, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts"

// ── DESIGN TOKENS — Verde/Negro Propertia ────────────────────────────────────
const C = {
  bg:      "#0A0A0A",
  bg2:     "#111111",
  bg3:     "#1A1A1A",
  border:  "#222222",
  green:   "#00D084",
  greenD:  "#00A868",
  greenGlow: "rgba(0,208,132,0.15)",
  white:   "#FFFFFF",
  gray:    "#888888",
  grayL:   "#AAAAAA",
  red:     "#FF4444",
  gold:    "#F5C842",
}

const mapContainerStyle = { width: '100%', height: '100%' };
const darkModeStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] }
];

const TIPOS_PROPIEDAD = [
  { v:"Apartamento",        l:"🏢 Apartamento" },
  { v:"Apartaestudio",      l:"🏠 Apartaestudio" },
  { v:"Casa",               l:"🏡 Casa" },
  { v:"Casa en condominio", l:"🏘️ Casa en condominio" },
  { v:"Penthouse",          l:"✨ Penthouse / PH" },
  { v:"Lote",               l:"📐 Lote" },
  { v:"Finca",              l:"🌿 Finca" },
]

// ── ATOMS ──
const Card = ({ children, style = {}, glow = false }) => (
  <div style={{
    background: C.bg2,
    borderRadius: 14,
    padding: 22,
    border: `1px solid ${glow ? C.green+"40" : C.border}`,
    boxShadow: glow ? `0 0 24px ${C.greenGlow}` : "none",
    ...style
  }}>
    {children}
  </div>
)

const Label = ({ children, req }) => (
  <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.grayL, marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>
    {children}{req && <span style={{ color:C.green, marginLeft:3 }}>*</span>}
  </label>
)

const Sel = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    width:"100%", padding:"11px 14px", borderRadius:8,
    border:`1px solid ${value ? C.green+"60" : C.border}`,
    fontSize:14, color: value ? C.white : C.gray,
    background: C.bg3, outline:"none", cursor:"pointer",
    transition:"border .2s"
  }}>
    <option value="">{placeholder || "Seleccionar..."}</option>
    {options.map(o => <option key={o.v||o} value={o.v||o} style={{ background:C.bg3 }}>{o.l||o}</option>)}
  </select>
)

const Inp = ({ value, onChange, type = "text", placeholder, unit }) => (
  <div style={{ position:"relative" }}>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width:"100%", padding:`11px ${unit?44:14}px 11px 14px`, borderRadius:8,
        border:`1px solid ${value ? C.green+"60" : C.border}`,
        fontSize:14, color:C.white, background:C.bg3, outline:"none", boxSizing:"border-box",
        transition:"border .2s"
      }}
    />
    {unit && <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>}
  </div>
)

const MoneyInp = ({ value, onChange, placeholder, unit = "COP" }) => {
  const raw     = String(value || "").replace(/\D/g, "")
  const display = raw ? Number(raw).toLocaleString("es-CO") : ""
  return (
    <div style={{ position:"relative" }}>
      <input
        type="text"
        value={display}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        style={{
          width:"100%", padding:"11px 52px 11px 14px", borderRadius:8,
          border:`1px solid ${raw ? C.green+"60" : C.border}`,
          fontSize:14, color:C.white, background:C.bg3, outline:"none",
        }}
      />
      <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>
    </div>
  )
}

const GridSel = ({ label, items, value, onChange, cols = 2 }) => (
  <div>
    {label && <Label>{label}</Label>}
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
      {items.map(({ v, l, icon }) => (
        <div key={v} onClick={() => onChange(v)} style={{
          padding:"12px 10px", borderRadius:10, cursor:"pointer", textAlign:"center",
          border:`1px solid ${value===v ? C.green : C.border}`,
          background: value===v ? C.green+"15" : C.bg3,
          color: value===v ? C.green : C.gray,
          fontSize:13, fontWeight:value===v ? 700 : 400,
        }}>
          {icon && <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>}
          {l}
        </div>
      ))}
    </div>
  </div>
)

const Toggle = ({ label, value, onChange }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:13.5, color:C.grayL }}>{label}</span>
    <div onClick={() => onChange(!value)} style={{ width:48, height:26, borderRadius:13, background: value ? C.green : C.bg3, border:`1px solid ${value ? C.green : C.border}`, cursor:"pointer", position:"relative" }}>
      <div style={{ width:20, height:20, borderRadius:"50%", background:C.white, position:"absolute", top:2, left:value ? 25 : 3, transition:"left .22s" }}/>
    </div>
  </div>
)

const Counter = ({ value, onChange, min = 0, max = 10 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:18 }}>
    <button onClick={() => onChange(Math.max(min,value-1))} style={{ width:38, height:38, borderRadius:"50%", border:`1px solid ${C.green}`, background:"transparent", color:C.green, fontSize:22, cursor:"pointer" }}>−</button>
    <span style={{ fontSize:24, fontWeight:800, color:C.white, minWidth:28, textAlign:"center" }}>{value}</span>
    <button onClick={() => onChange(Math.min(max,value+1))} style={{ width:38, height:38, borderRadius:"50%", border:"none", background:C.green, color:C.bg, fontSize:22, cursor:"pointer" }}>+</button>
  </div>
)

const Chip = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{
    padding:"7px 14px", borderRadius:20, cursor:"pointer", fontSize:12,
    border:`1px solid ${active ? C.green : C.border}`,
    background: active ? C.green+"20" : C.bg3,
    color: active ? C.green : C.gray,
  }}>{label}</div>
)

const ProgressBar = ({ current }) => (
  <div style={{ marginBottom:32 }}>
    <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
      <div style={{ position:"absolute", top:14, left:"5%", right:"5%", height:1, background:C.border, zIndex:0 }}/>
      {[1,2,3,4,5,6].map(i => {
        const active = i === current; const done = i < current;
        return (
          <div key={i} style={{
            width:30, height:30, borderRadius:"50%", zIndex:2, display:"flex", alignItems:"center", justifyContent:"center",
            background: done ? C.green : (active ? C.bg : C.bg3),
            border:`1px solid ${done||active ? C.green : C.border}`,
            color: done ? C.bg : (active ? C.green : C.gray),
            fontSize:11, fontWeight:700,
            boxShadow: active ? `0 0 12px ${C.green}` : "none"
          }}>{done ? "✓" : i}</div>
        )
      })}
    </div>
  </div>
)

// ── PHASES ──
const PhaseTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
    <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:C.white }}>{title}</h2>
    <p style={{ margin:"6px 0 0", fontSize:13, color:C.gray }}>{sub}</p>
  </div>
)

const P1 = ({ f, s }) => <PComponent icon="📍" title="Ubicación" sub="¿Dónde está la propiedad?"><div style={{display:"grid",gap:18}}><div><Label req>Ciudad</Label><Inp value={f.ciudad} onChange={v => s({...f, ciudad:v})}/></div><div><Label req>Barrio</Label><Inp value={f.barrio} onChange={v => s({...f, barrio:v})}/></div><div><Label req>Tipo</Label><Sel value={f.tipo} onChange={v => s({...f, tipo:v})} options={TIPOS_PROPIEDAD}/></div></div></PComponent>
const PComponent = ({ icon, title, sub, children }) => <div><PhaseTitle icon={icon} title={title} sub={sub}/>{children}</div>

// Main App
export default function App() {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({ ciudad:"Cali", barrio:"", tipo:"Apartamento", areaConstruida:"", estrato:3, dormitorios:2, banosC:2, lat:3.4516, lng:-76.5320 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_KEY });

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg }}>
      <style>{`body { margin:0; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:white; }`}</style>

      {/* Sidebar: Formulario */}
      <div style={{ flex: "0 0 450px", overflowY: "auto", padding: "40px 30px", borderRight: `1px solid ${C.border}` }}>
        <header style={{ marginBottom: 35, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, background:`linear-gradient(135deg,${C.green},${C.greenD})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🏠</div>
          <div style={{ fontSize:18, fontWeight:800 }}>Propertia ACM Pro</div>
        </header>

        <ProgressBar current={phase}/>

        <Card>
          {phase === 1 && <P1 f={form} s={setForm}/>}
          {phase === 2 && <PComponent icon="🏗️" title="Detalles" sub="Área y antigüedad"><div style={{display:"grid",gap:18}}><div><Label req>Área m²</Label><Inp type="number" value={form.areaConstruida} onChange={v => setForm({...form,areaConstruida:v})} unit="m²"/></div><div><Label req>Estrato</Label><Inp type="number" value={form.estrato} onChange={v => setForm({...form,estrato:v})}/></div></div></PComponent>}
          {phase === 3 && <PComponent icon="🛋️" title="Interiores" sub="Distribución básica"><div style={{display:"grid",gap:18}}><div><Label req>Vib: {form.dormitorios}</Label><Counter value={form.dormitorios} onChange={v => setForm({...form,dormitorios:v})}/></div></div></PComponent>}
          
          <div style={{ display:"flex", gap:10, marginTop:30 }}>
            {phase > 1 && <button onClick={() => setPhase(phase-1)} style={{ flex:1, padding:"14px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.gray, fontWeight:700, cursor:"pointer" }}>Atrás</button>}
            <button onClick={() => setPhase(phase < 6 ? phase + 1 : 6)} style={{ flex:2, padding:"14px", borderRadius:12, border:"none", background:C.green, color:C.bg, fontWeight:800, cursor:"pointer" }}>Continuar</button>
          </div>
        </Card>
      </div>

      {/* Main: Mapa */}
      <div style={{ flex: 1, background: "#111" }}>
        {isLoaded ? (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: form.lat, lng: form.lng }} zoom={14} options={{ styles: darkModeStyles, disableDefaultUI: true }}>
            <Marker position={{ lat: form.lat, lng: form.lng }} />
            <Circle center={{ lat: form.lat, lng: form.lng }} radius={800} options={{ strokeColor: C.green, strokeOpacity: 0.5, strokeWeight: 2, fillColor: C.green, fillOpacity: 0.1 }} />
          </GoogleMap>
        ) : <div style={{ padding:20, color:C.gray }}>Cargando mapa interactivo...</div>}
      </div>
    </div>
  );
}
