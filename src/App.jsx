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

const PAISES = [
  { v:"Colombia",   l:"🇨🇴 Colombia" },
  { v:"México",     l:"🇲🇽 México" },
  { v:"Argentina",  l:"🇦🇷 Argentina" },
  { v:"Chile",      l:"🇨🇱 Chile" },
  { v:"Perú",       l:"🇵🇪 Perú" },
  { v:"Ecuador",    l:"🇪🇨 Ecuador" },
  { v:"Uruguay",    l:"🇺🇾 Uruguay" },
  { v:"Panamá",     l:"🇵🇦 Panamá" },
]

const CIUDADES_POR_PAIS = {
  "Colombia":  ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Bucaramanga","Pereira","Manizales"],
}

const TIPOS_PROPIEDAD = [
  { v:"Apartamento",        l:"🏢 Apartamento" },
  { v:"Apartaestudio",      l:"🏠 Apartaestudio" },
  { v:"Casa",               l:"🏡 Casa" },
  { v:"Casa en condominio", l:"🏘️ Casa en condominio" },
  { v:"Penthouse",          l:"✨ Penthouse / PH" },
  { v:"Lote urbano",        l:"📐 Lote urbano" },
  { v:"Finca",              l:"🌿 Finca / Lote rural" },
]

const TIPO_GRUPO = {
  "Apartamento": "residencial", "Apartaestudio": "residencial", "Casa": "residencial",
  "Casa en condominio": "residencial", "Penthouse": "residencial", "Finca": "terreno",
}

const mapContainerStyle = { width: '100%', height: '100%' };
const centerCali = { lat: 3.4516, lng: -76.5320 };

// ── ATOMS ─────────────────────────────────────────────────────────────────────
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
  }}>
    <option value="">{placeholder || "Seleccionar..."}</option>
    {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
)

const Inp = ({ value, onChange, type = "text", placeholder, unit }) => (
  <div style={{ position:"relative" }}>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width:"100%", padding:`11px ${unit?44:14}px 11px 14px`, borderRadius:8,
        border:`1px solid ${value ? C.green+"60" : C.border}`,
        fontSize:14, color:C.white, background:C.bg3, outline:"none", boxSizing:"border-box"
      }}
    />
    {unit && <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>}
  </div>
)

const MoneyInp = ({ value, onChange, placeholder, unit = "COP" }) => {
  const display = value ? Number(value).toLocaleString("es-CO") : ""
  return (
    <div style={{ position:"relative" }}>
      <input
        type="text"
        value={display}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        style={{
          width:"100%", padding:"11px 52px 11px 14px", borderRadius:8,
          border:`1px solid ${value ? C.green+"60" : C.border}`,
          fontSize:14, color:C.white, background:C.bg3, outline:"none",
        }}
      />
      <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.gray, fontWeight:700 }}>{unit}</span>
    </div>
  )
}

const ProgressBar = ({ current }) => (
  <div style={{ marginBottom:32 }}>
    <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
      <div style={{ position:"absolute", top:14, left:"5%", right:"5%", height:1, background:C.border, zIndex:0 }}/>
      { [1,2,3,4,5,6].map((i) => {
        const active = i === current; const done = i < current;
        return (
          <div key={i} style={{ width:30, height:30, borderRadius:"50%", background: done ? C.green : (active?C.bg:C.bg3), border:`1px solid ${done||active?C.green:C.border}`, color: done?C.bg:(active?C.green:C.gray), fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}>{done ? "✓" : i}</div>
        )
      })}
    </div>
  </div>
)

const P1 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:C.white, marginBottom:20 }}>📍 Ubicación</h2>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Ciudad</Label><Inp value={f.ciudad} onChange={v => s({...f, ciudad:v})} placeholder="Ej: Cali"/></div>
      <div><Label req>Barrio</Label><Inp value={f.barrio} onChange={v => s({...f, barrio:v})} placeholder="Ej: Pance"/></div>
      <div><Label>Dirección</Label><Inp value={f.direccion} onChange={v => s({...f, direccion:v})} placeholder="Ej: Cra 122 # 13-10"/></div>
      <div><Label req>Tipo</Label><Sel value={f.tipo} onChange={v => s({...f, tipo:v})} options={TIPOS_PROPIEDAD} placeholder="Seleccionar..."/></div>
    </div>
  </div>
)

const P2 = ({ f, s }) => (
  <div>
    <h2 style={{ fontSize:22, fontWeight:800, color:C.white, marginBottom:20 }}>🏗️ Detalles</h2>
    <div style={{ display:"grid", gap:18 }}>
      <div><Label req>Área construida</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({...f,areaConstruida:v})} unit="m²"/></div>
      <div><Label req>Antigüedad</Label><Inp type="number" value={f.antiguedad} onChange={v => s({...f,antiguedad:v})} unit="años"/></div>
      <div><Label req>Estrato</Label><Inp type="number" value={f.estrato} onChange={v => s({...f,estrato:v})}/></div>
    </div>
  </div>
)

// Main App Component
export default function App() {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({ pais:"Colombia", ciudad:"Cali", barrio:"", tipo:"", areaConstruida:"", lat: 3.4516, lng: -76.5320 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_KEY
  });

  const next = async () => {
    if (phase < 6) { setPhase(p => p+1); return; }
    setLoading(true);
    // Simulación de llamada para el ejemplo (aquí irá tu fetch real)
    setTimeout(() => { setLoading(false); setResult({precio_mercado: 450000000, resumen_ejecutivo: "Análisis culminado"}); }, 2000);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", height: "100vh", background: C.bg }}>
      <style>{`body { margin:0; font-family: sans-serif; overflow: hidden; }`}</style>
      
      {/* Columna Izquierda: Formulario */}
      <div style={{ flex: "1 1 450px", overflowY: "auto", padding: "40px 30px", borderRight: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 450, margin: "0 auto" }}>
          <header style={{ marginBottom: 40, display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ width:40, height:40, background:C.green, borderRadius:10 }}></div>
            <h1 style={{ fontSize:20, fontWeight:800, color:C.white, margin:0 }}>Propertia ACM Pro</h1>
          </header>

          <ProgressBar current={phase}/>

          {loading ? <div>Generando análisis...</div> : result ? <div>Reporte Listo</div> : (
            <Card>
              {phase === 1 && <P1 f={form} s={setForm}/>}
              {phase === 2 && <P2 f={form} s={setForm}/>}
              {phase > 2 && <div style={{color: C.gray}}>Fases siguientes en desarrollo...</div>}
              
              <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
                {phase > 1 && <button onClick={() => setPhase(p-1)} style={{flex:1, padding:15, background:"transparent", border:`1px solid ${C.border}`, color:C.white, borderRadius:12}}>Atrás</button>}
                <button onClick={next} style={{flex:2, padding:15, background:C.green, border:"none", borderRadius:12, fontWeight:800, cursor:"pointer"}}>{phase===6 ? "Analizar con IA" : "Continuar"}</button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Columna Derecha: Mapa */}
      <div style={{ flex: "1 1 500px", minHeight: "400px", background: "#111" }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: form.lat, lng: form.lng }}
            zoom={14}
            options={{ styles: darkModeStyles, disableDefaultUI: true }}
          >
            <Marker position={{ lat: form.lat, lng: form.lng }} />
            <Circle center={{ lat: form.lat, lng: form.lng }} radius={1000} options={{ strokeColor: C.green, fillOpacity: 0.1, fillColor: C.green }} />
          </GoogleMap>
        ) : <div style={{ padding: 20, color: C.gray }}>Cargando mapa...</div>}
      </div>
    </div>
  );
}

const darkModeStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] }
];
