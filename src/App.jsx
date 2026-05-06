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

const mapContainerStyle = { width: '100%', height: '350px' };
const darkModeStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] }
];

const TIPOS_PROPIEDAD = [
  { v:"Apartamento", l:"🏢 Apartamento" }, { v:"Apartaestudio", l:"🏠 Apartaestudio" },
  { v:"Casa", l:"🏡 Casa" }, { v:"Casa en condominio", l:"🏘️ Casa en condominio" },
  { v:"Penthouse", l:"✨ Penthouse / PH" }, { v:"Lote", l:"📐 Lote" }, { v:"Finca", l:"🌿 Finca" }
];

// ── ATOMS — Premium ──
const Card = ({ children, style = {}, glow = false }) => (
  <div style={{
    background: C.bg2, borderRadius: 14, padding: "22px 24px", border: `1px solid ${glow ? C.green+"40" : C.border}`,
    boxShadow: glow ? `0 0 24px ${C.greenGlow}` : "none", ...style
  }}>{children}</div>
)

const Label = ({ children, req }) => (
  <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.grayL, marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>
    {children}{req && <span style={{ color:C.green, marginLeft:3 }}>*</span>}
  </label>
)

const ProgressBar = ({ current }) => (
  <div style={{ marginBottom:32 }}>
    <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
      <div style={{ position:"absolute", top:14, left:"5%", right:"5%", height:1, background:C.border, zIndex:0 }}/>
      {[1,2,3,4,5,6].map(i => {
        const active = i === current; const done = i < current;
        return (
          <div key={i} style={{ width:30, height:30, borderRadius:"50%", zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", background: done ? C.green : (active ? C.bg : C.bg3), border:`1px solid ${done||active ? C.green : C.border}`, color: done ? C.bg : (active ? C.green : C.gray), fontSize:11, fontWeight:700, boxShadow: active ? `0 0 12px ${C.green}` : "none" }}>{done ? "✓" : i}</div>
        )
      })}
    </div>
  </div>
)

const P1 = ({ f, s }) => (
  <div style={{ display:"grid", gap:18 }}>
    <h2 style={{ fontSize:22, fontWeight:800, margin:0 }}>📍 Ubicación</h2>
    <div><Label req>Ciudad</Label><input value={f.ciudad} onChange={e => s({...f, ciudad:e.target.value})} style={{ width:"100%", padding:12, borderRadius:8, background:C.bg3, color:"white", border:`1px solid ${C.border}`, outline:"none" }}/></div>
    <div><Label req>Barrio</Label><input value={f.barrio} onChange={e => s({...f, barrio:e.target.value})} style={{ width:"100%", padding:12, borderRadius:8, background:C.bg3, color:"white", border:`1px solid ${C.border}`, outline:"none" }}/></div>
  </div>
)

// Main App
export default function App() {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({ ciudad:"Cali", barrio:"", tipo:"Apartamento", lat:3.4516, lng:-76.5320 });
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_KEY });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, overflowX: "hidden" }}>
      <style>{`body { margin:0; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:white; }`}</style>

      {/* Mapa Superior */}
      <div style={{ height: "35vh", width: "100%", position: "relative", borderBottom: `1px solid ${C.border}` }}>
        {isLoaded ? (
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: form.lat, lng: form.lng }} zoom={15} options={{ styles: darkModeStyles, disableDefaultUI: true }}>
            <Marker position={{ lat: form.lat, lng: form.lng }} />
            <Circle center={{ lat: form.lat, lng: form.lng }} radius={500} options={{ strokeColor: C.green, strokeOpacity: 0.5, strokeWeight: 2, fillColor: C.green, fillOpacity: 0.1 }} />
          </GoogleMap>
        ) : <div style={{ padding:40, color:C.gray }}>Cargando mapa de Cali...</div>}
        
        {/* Logo Overlay */}
        <div style={{ position:"absolute", top:20, left:20, background:C.bg2, padding:"10px 18px", borderRadius:12, display:"flex", alignItems:"center", gap:10, border:`1px solid ${C.border}`, boxShadow:"0 4px 15px rgba(0,0,0,0.5)" }}>
          <div style={{ width:24, height:24, background:C.green, borderRadius:6 }}></div>
          <div style={{ fontWeight:800, fontSize:14 }}>Propertia ACM</div>
        </div>
      </div>

      {/* Formulario Inferior */}
      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <ProgressBar current={phase}/>
          
          <Card glow>
            {phase === 1 && <P1 f={form} s={setForm}/>}
            {phase > 1 && <div style={{color:C.gray, textAlign:"center", padding:20}}>Fases siguientes en desarrollo...</div>}

            <div style={{ display:"flex", gap:10, marginTop:30 }}>
              {phase > 1 && <button onClick={() => setPhase(phase-1)} style={{ flex:1, padding:15, borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.white, fontWeight:700 }}>Atrás</button>}
              <button onClick={() => setPhase(phase < 6 ? phase + 1 : 6)} style={{ flex:2, padding:15, borderRadius:12, border:"none", background:C.green, color:C.bg, fontWeight:800, cursor:"pointer" }}>Continuar</button>
            </div>
          </Card>
          
          <p style={{ textAlign:"center", color:C.gray, fontSize:12, marginTop:20 }}>Análisis Comparativo de Mercado Profesional</p>
        </div>
      </div>
    </div>
  );
}
