import { useState, useRef, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts"

// ── DESIGN TOKENS ──
const C = {
  bg: "#0A0A0A", bg2: "#111111", bg3: "#1A1A1A", border: "#222222",
  green: "#00D084", greenD: "#00A868", greenGlow: "rgba(0,208,132,0.15)",
  white: "#FFFFFF", gray: "#888888", grayL: "#AAAAAA", red: "#FF4444", gold: "#F5C842",
}

const mapContainerStyle = { width: '100%', height: '100%' };
const darkModeStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
];

const TIPOS_PROPIEDAD = [
  { v:"Apartamento", l:"🏢 Apartamento" }, { v:"Apartaestudio", l:"🏠 Apartaestudio" },
  { v:"Casa", l:"🏡 Casa" }, { v:"Casa en condominio", l:"🏘️ Casa en condominio" },
  { v:"Penthouse", l:"✨ Penthouse / PH" }, { v:"Lote", l:"📐 Lote" }, { v:"Finca", l:"🌿 Finca" }
];

// ── COMPONENTS ──
const Card = ({ children, style = {}, glow = false }) => (
  <div style={{ background: C.bg2, borderRadius: 14, padding: 22, border: `1px solid ${glow ? C.green+"40" : C.border}`, boxShadow: glow ? `0 0 24px ${C.greenGlow}` : "none", ...style }}>{children}</div>
)
const Label = ({ children, req }) => <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.grayL, marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>{children}{req && <span style={{ color:C.green, marginLeft:3 }}>*</span>}</label>;
const Inp = ({ value, onChange, type="text", unit }) => (
  <div style={{ position:"relative" }}>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:`1px solid ${value ? C.green+"60" : C.border}`, color:C.white, background:C.bg3, outline:"none", boxSizing:"border-box" }} />
    {unit && <span style={{ position:"absolute", right:13, top:11, fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>}
  </div>
);

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

// ── APP ──
export default function App() {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({ ciudad:"Cali", barrio:"", tipo:"Apartamento", areaConstruida:"", estrato:3, dormitorios:2, banosC:2, lat:3.4516, lng:-76.5320 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_KEY });

  const next = async () => {
    if (phase < 6) { setPhase(p => p+1); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ formData: form }) });
      const data = await res.json();
      setResult(data);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`body { margin:0; font-family:-apple-system,BlinkMacSystemFont,sans-serif; overflow-x: hidden; }`}</style>
      
      <div style={{ height: "35vh", width: "100%", position: "relative", borderBottom: `1px solid ${C.border}` }}>
        {isLoaded ? (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: form.lat, lng: form.lng }} zoom={15} options={{ styles: darkModeStyles, disableDefaultUI: true }}>
            <Marker position={{ lat: form.lat, lng: form.lng}} />
            <Circle center={{ lat: form.lat, lng: form.lng}} radius={600} options={{ strokeColor: C.green, fillOpacity: 0.1, fillColor: C.green }} />
          </GoogleMap>
        ) : null}
        <div style={{ position:"absolute", top:20, left:20, background:C.bg2, padding:"8px 15px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:12, fontWeight:800 }}>PROPERTIA ACM PRO</div>
      </div>

      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "550px", margin: "0 auto" }}>
          {result ? (
              <Card glow>
                  <h2 style={{color:C.green}}>✅ Análisis Generado</h2>
                  <p style={{color:C.grayL}}>{result.resumen_ejecutivo}</p>
                  <button onClick={() => {setResult(null); setPhase(1)}} style={{background:C.green, border:"none", padding:15, borderRadius:12, fontWeight:800, width:"100%", cursor:"pointer"}}>Nuevo Análisis</button>
              </Card>
          ) : (
            <div>
              <ProgressBar current={phase}/>
              <Card glow>
                  {phase === 1 && (
                      <div style={{display:"grid", gap:18}}>
                          <h2 style={{margin:0}}>📍 Ubicación</h2>
                          <div><Label req>Ciudad</Label><Inp value={form.ciudad} onChange={v => setForm({...form, ciudad:v})}/></div>
                          <div><Label req>Barrio</Label><Inp value={form.barrio} onChange={v => setForm({...form, barrio:v})}/></div>
                      </div>
                  )}
                  {phase >= 2 && <div style={{padding:20, textAlign:"center", color:C.gray}}>Fase {phase} activa. Pulsa continuar para avanzar al reporte.</div>}
                  
                  <div style={{ display: "flex", gap:12, marginTop:30 }}>
                    {phase > 1 && <button onClick={() => setPhase(phase-1)} style={{ flex:1, padding:15, borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.white }}>Atrás</button>}
                    <button onClick={next} style={{ flex:2, padding:15, borderRadius:12, background:C.green, border:"none", fontWeight:800, color:C.bg, cursor:"pointer" }}>{loading ? "Generando..." : phase === 6 ? "Generar IA" : "Continuar"}</button>
                  </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
