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
    background: C.bg2, borderRadius: 14, padding: "24px", border: `1px solid ${glow ? C.green+"40" : C.border}`,
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
        width:"100%", padding:`12px 14px`, borderRadius:8,
        border:`1px solid ${value ? C.green+"60" : C.border}`,
        fontSize:14, color:C.white, background:C.bg3, outline:"none", boxSizing:"border-box",
      }}
    />
    {unit && <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>}
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
            boxShadow: active ? `0 0 12px ${C.green}` : "none"
          }}>{done ? "✓" : i}</div>
        )
      })}
    </div>
  </div>
)

// ── SECCIONES ──
const PhaseTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom:20 }}>
    <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
    <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:C.white }}>{title}</h2>
    {sub && <p style={{ margin:"6px 0 0", fontSize:13.5, color:C.gray }}>{sub}</p>}
  </div>
)

const P1 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="📍" title="Ubicación" sub="¿Dónde está la propiedad?"/>
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
    <PhaseTitle icon="🏗️" title="Detalles Básicos" sub="Área y estrato."/>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Área m²</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({...f,areaConstruida:v})} unit="m²"/></div>
      <div><Label req>Estrato</Label><Inp type="number" value={f.estrato} onChange={v => s({...f,estrato:v})}/></div>
    </div>
  </div>
)

// Main App
export default function App() {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({ ciudad:"Cali", barrio:"", tipo:"Apartamento", areaConstruida:"", estrato:3, dormitorios:2, banosC:2, lat:3.4516, lng:-76.5320 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_KEY });

  const next = () => phase < 6 ? setPhase(p => p+1) : (setLoading(true), setTimeout(() => {setResult(true); setLoading(false)}, 2000));

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:${C.green}60; border-radius:2px; }
      `}</style>
      
      {/* Mapa Arriba — 40% de la pantalla */}
      <div style={{ height: "40vh", width: "100%", position: "relative", borderBottom: `1px solid ${C.border}` }}>
        {isLoaded ? (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: form.lat, lng: form.lng }} zoom={15} options={{ styles: darkModeStyles, disableDefaultUI: true }}>
            <Marker position={{ lat: form.lat, lng: form.lng }} />
            <Circle center={{ lat: form.lat, lng: form.lng }} radius={500} options={{ strokeColor: C.green, strokeOpacity: 0.5, strokeWeight: 2, fillColor: C.green, fillOpacity: 0.1 }} />
          </GoogleMap>
        ) : <div style={{ color:C.gray, padding:40, textAlign:"center" }}>Cargando mapa...</div>}
        
        {/* Badge Flotante */}
        <div style={{ position:"absolute", top:20, left:20, background:C.bg2, padding:"8px 15px", borderRadius:10, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
           <div style={{ width:10, height:10, borderRadius:"50%", background:C.green }}></div>
           <span style={{ fontSize:12, fontWeight:800, color:C.white }}>PROPERTIA ACM PRO</span>
        </div>
      </div>

      {/* Formulario Abajo */}
      <div style={{ padding: "30px 20px 60px" }}>
        <div style={{ maxWidth: "550px", margin: "0 auto" }}>
          
          <ProgressBar current={phase}/>

          {loading ? <div style={{color:C.green, textAlign:"center", padding:40, fontWeight:800}}>Procesando datos... 🚀</div> : result ? <div style={{color:C.white, textAlign:"center"}}>✅ Análisis Completado</div> : (
            <Card glow>
              {phase === 1 && <P1 f={form} s={setForm}/>}
              {phase === 2 && <P2 f={form} s={setForm}/>}
              {phase > 2 && (
                  <div>
                      <PhaseTitle icon="🛋️" title="Fases Siguientes" sub="Continuamos rescatando tu lógica original..."/>
                      <p style={{color:C.gray}}>Las fases 3-6 están siendo optimizadas para este layout vertical.</p>
                  </div>
              )}
              
              <div style={{ display:"flex", gap:12, marginTop:30 }}>
                {phase > 1 && <button onClick={() => setPhase(phase-1)} style={{ flex:1, padding:15, borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.white, fontWeight:700 }}>Atrás</button>}
                <button onClick={next} style={{ flex:2, padding:15, borderRadius:12, background:C.green, border:"none", fontWeight:800, color:C.bg, cursor:"pointer" }}>{phase === 6 ? "Generar IA" : "Siguiente Paso"}</button>
              </div>
            </Card>
          )}

          <p style={{ textAlign:"center", color:C.gray, fontSize:11, marginTop:30 }}>Propertia Realty • Inteligencia Inmobiliaria</p>
        </div>
      </div>
    </div>
  );
}
