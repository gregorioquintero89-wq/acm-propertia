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
    background: C.bg2, borderRadius: 14, padding: 22, border: `1px solid ${glow ? C.green+"40" : C.border}`,
    boxShadow: glow ? `0 0 24px ${C.greenGlow}` : "none", ...style
  }}>{children}</div>
)

const Label = ({ children, req }) => (
  <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.grayL, marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>
    {children}{req && <span style={{ color:C.green, marginLeft:3 }}>*</span>}
  </label>
)

const Inp = ({ value, onChange, type = "text", placeholder, unit }) => (
  <div style={{ position:"relative" }}>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width:"100%", padding:`11px ${unit?44:14}px 11px 14px`, borderRadius:8,
        border:`1px solid ${value ? C.green+"60" : C.border}`,
        fontSize:14, color:C.white, background:C.bg3, outline:"none", boxSizing:"border-box",
      }}
    />
    {unit && <span style={{ position:"absolute", right:13, top:11, fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>}
  </div>
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
          }}>{done ? "✓" : i}</div>
        )
      })}
    </div>
  </div>
)

// ── SECCIONES ──
const P1 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:10 }}>📍 Ubicación</h2>
    <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>¿Dónde está la propiedad?</p>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Ciudad</Label><Inp value={f.ciudad} onChange={v => s({...f, ciudad:v})}/></div>
      <div><Label req>Barrio</Label><Inp value={f.barrio} onChange={v => s({...f, barrio:v})}/></div>
      <div>
        <Label req>Tipo</Label>
        <select value={f.tipo} onChange={e => s({...f, tipo:e.target.value})} style={{ width:"100%", padding:12, borderRadius:8, background:C.bg3, color:C.white, border: `1px solid ${C.border}`, outline:"none" }}>
          {TIPOS_PROPIEDAD.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>
    </div>
  </div>
)

const P2 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:10 }}>🏗️ Detalles</h2>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Área construida</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({...f,areaConstruida:v})} unit="m²"/></div>
      <div><Label req>Estrato</Label><Inp type="number" value={f.estrato} onChange={v => s({...f,estrato:v})}/></div>
      <div><Label req>Antigüedad</Label><Inp type="number" value={f.antiguedad} onChange={v => s({...f,antiguedad:v})} unit="años"/></div>
    </div>
  </div>
)

const P3 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:20 }}>🛋️ Interiores</h2>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Dormitorios</Label><Inp type="number" value={f.dormitorios} onChange={v => s({...f,dormitorios:v})}/></div>
      <div><Label req>Baños</Label><Inp type="number" value={f.banosC} onChange={v => s({...f,banosC:v})}/></div>
    </div>
  </div>
)

const P4 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:20 }}>🏊 Amenidades</h2>
    <div style={{ display:"grid", gap:10 }}>
       {['Piscina', 'Gimnasio', 'Ascensor', 'Salón Social'].map(am => (
         <div key={am} onClick={() => s({...f, [am.toLowerCase()]: !f[am.toLowerCase()]})} style={{ padding:15, borderRadius:10, background: f[am.toLowerCase()] ? C.green+"20" : C.bg3, border:`1px solid ${f[am.toLowerCase()] ? C.green : C.border}`, cursor:"pointer", color: f[am.toLowerCase()]?C.green:C.gray }}>{am}</div>
       ))}
    </div>
  </div>
)

const P5 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:20 }}>🚗 Parqueaderos</h2>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Número de cupos</Label><Inp type="number" value={f.parqueaderos} onChange={v => s({...f,parqueaderos:v})}/></div>
    </div>
  </div>
)

const P6 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:20 }}>💰 Financiero</h2>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label>Precio de referencia</Label><Inp type="number" value={f.precioRef} onChange={v => s({...f,precioRef:v})} unit="COP"/></div>
    </div>
  </div>
)

// ── APP ──
export default function App() {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({ ciudad:"Cali", barrio:"", tipo:"Apartamento", areaConstruida:"", estrato:3, dormitorios:2, banosC:2, lat:3.4516, lng:-76.5320 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_KEY
  });

  const next = () => phase < 6 ? setPhase(p => p+1) : (setLoading(true), setTimeout(() => {setResult(true); setLoading(false)}, 2000));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", height: "100vh", background: C.bg }}>
      <style>{`
        body { margin:0; overflow:hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:${C.green}60; border-radius:2px; }
      `}</style>
      
      {/* Sidebar Formulario — 450px Ancho */}
      <div style={{ flex: "0 0 450px", overflowY: "auto", padding: "40px 30px", borderRight: `1px solid ${C.border}` }}>
        <header style={{ marginBottom: 35, display:"flex", alignItems:"center", gap:15 }}>
          <div style={{ width:40, height:40, background:`linear-gradient(135deg,${C.green},${C.greenD})`, borderRadius:12, boxShadow: `0 4px 15px ${C.greenGlow}` }}></div>
          <h1 style={{ fontSize:20, fontWeight:800, color:C.white, margin:0 }}>Propertia ACM Pro</h1>
        </header>

        <ProgressBar current={phase}/>

        {loading ? <div style={{color:C.green, fontWeight:800, textAlign:"center", padding:40, fontSize:18}}>Analizando mercado... 🚀</div> : result ? <div style={{textAlign:"center", padding:20}}><h2 style={{color:C.green}}>✅ Análisis Listo</h2><button onClick={() => {setResult(null); setPhase(1)}} style={{background:"transparent", border:`1px solid ${C.border}`, color:C.white, padding:12, borderRadius:10, cursor:"pointer"}}>Nuevo Análisis</button></div> : (
          <div>
            <Card glow>
              {phase === 1 && <P1 f={form} s={setForm}/>}
              {phase === 2 && <P2 f={form} s={setForm}/>}
              {phase === 3 && <P3 f={form} s={setForm}/>}
              {phase === 4 && <P4 f={form} s={setForm}/>}
              {phase === 5 && <P5 f={form} s={setForm}/>}
              {phase === 6 && <P6 f={form} s={setForm}/>}
              
              <div style={{ display:"flex", gap:12, marginTop:35 }}>
                {phase > 1 && <button onClick={() => setPhase(phase-1)} style={{ flex:1, padding:15, borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.gray, fontWeight:700, cursor:"pointer" }}>Atrás</button>}
                <button onClick={next} style={{ flex:2, padding:15, borderRadius:12, background:C.green, border:"none", fontWeight:800, color:C.bg, cursor:"pointer", boxShadow: `0 4px 15px ${C.greenGlow}` }}>{phase === 6 ? "Generar Análisis" : "Continuar"}</button>
              </div>
            </Card>
            <p style={{ textAlign:"center", color:C.gray, fontSize:11, marginTop:25 }}>Tus respuestas se guardan automáticamente • Propertia IA</p>
          </div>
        )}
      </div>

      {/* Main Mapa — Todo el resto del ancho */}
      <div style={{ flex: 1, minHeight: "400px", background: "#111" }}>
        {isLoaded ? (
          <GoogleMap 
            mapContainerStyle={{ width: '100%', height: '100%' }} 
            center={{ lat: form.lat, lng: form.lng }} 
            zoom={15} 
            options={{ 
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#212121" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
                ], 
                disableDefaultUI: true 
            }}
          >
            <Marker position={{ lat: form.lat, lng: form.lng }} />
            <Circle center={{ lat: form.lat, lng: form.lng }} radius={800} options={{ strokeColor: C.green, strokeOpacity: 0.5, strokeWeight: 2, fillColor: C.green, fillOpacity: 0.1 }} />
          </GoogleMap>
        ) : <div style={{ color:C.gray, padding:40, fontSize:18, textAlign:"center" }}>Iniciando entorno de mapas para Cali...</div>}
      </div>
    </div>
  );
}
