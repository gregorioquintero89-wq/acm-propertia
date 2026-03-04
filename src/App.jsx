import { useState } from "react"
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

const CIUDADES = ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Bucaramanga","Pereira","Manizales"]
const BARRIOS = {
  "Bogotá": [
    "Usaquén","Santa Bárbara","Cedritos","Niza","Chicó","El Retiro","La Cabrera","Rosales",
    "El Chico","Chapinero","Quinta Camacho","El Lago","Teusaquillo","La Soledad","Palermo",
    "Galerías","Modelia","Normandía","El Salitre","Ciudad Salitre","Fontibón","Engativá",
    "Álamos","Quirinal","La Floresta","Niza Sur","Colina Campestre","San José de Bavaria",
    "Britalia","El Prado","Gilmar","Lisboa","Santa Helenita","Bolivia","Cantalejo",
    "Belmira","Madelena","Villa Alsacia","Versalles","Marsella","Kennedy","Américas",
    "Alamos Norte","Tintal","Hayuelos","Bosa","Ciudad Bolívar","Usme","San Cristóbal",
    "Rafael Uribe","Antonio Nariño","Puente Aranda","Los Mártires","La Candelaria",
    "Santa Fe","La Perseverancia","El Minuto de Dios","Bachué","Garcés Navas",
    "Pontevedra","El Cortijo","Villa Luz","Boyacá Real","Patio Bonito","Castilla",
    "Timiza","Gran Britalia","Carvajal","Candelaria La Nueva","Lucero","Meissen",
    "San Francisco","El Tesoro","Arborizadora","San Isidro Patios","Juan Rey",
    "Parque Entrenubes","Marichuela","Yomasa","Alfonso López","El Poblado"
  ],
  "Medellín": [
    "El Poblado","Laureles","Envigado","Sabaneta","Belén","El Tesoro","Robledo","Estadio",
    "La América","San Javier","Castilla","Doce de Octubre","Aranjuez","Manrique","Santa Cruz",
    "Popular","Villa Hermosa","Buenos Aires","La Candelaria","Guayabal","Itagüí","La Estrella",
    "Caldas","Bello","Copacabana","Girardota","Barbosa","El Escobero","El Retiro","La Ceja",
    "Llanogrande","Las Palmas","El Chinguí","Loma de Los Bernal","Altavista","San Antonio de Prado",
    "La Tablaza","Ciudad del Río","Oviedo","El Centro","Parque Lleras","Provenza",
    "Manila","Astorga","Los Balsos","El Diamante","San Lucas","Las Lomas","Alejandría",
    "Conquistadores","Los Colores","Calasanz","Suramericana","Floresta","Santa Lucía",
    "Caribe","Sevilla","Bermejal","Campo Valdés","Bermejal Los Álamos","Cruz Blanca",
    "El Raizal","El Pinal","Enciso","Sucre","El Compromiso","Villatina","Batallón Girardot",
    "Miraflores","Simón Bolívar","Bomboná","Trinidad","Perpetuo Socorro","Barrio Colón",
    "Estación Villa","San Benito","Tenche","Toscana","Calasanz Parte Alta","La Cumbre",
    "Independencias","Nuevos Conquistadores","El Corazón","Blanquizal","Santa Rosa de Lima"
  ],
  "Cali": [
    "20 de Julio","3 de Julio","Acueducto San Antonio","Aguablanca","Aguacatal",
    "Alameda","Alférez Real","Alfonso Barberena","Alfonso Bonilla Aragón",
    "Alfonso López I","Alfonso López II","Alfonso López III","Alirio Mora Beltrán",
    "Alto Nápoles","Altos de Menga","Antonio Nariño","Aranjuez","Arboledas",
    "Asturias","Atanasio Girardot","Base Aérea","Belalcázar","Belén",
    "Belisario Caicedo","Bellavista","Bello Horizonte","Benjamín Herrera",
    "Bochalema","Bolivariano","Bosques del Limonar","Bretaña","Brisas de los Álamos",
    "Brisas de Mayo","Buenos Aires","Calima","Calipso","Cañaveral",
    "Cañaverales","Cañaveralejo","Centenario","Chapinero","Charco Azul",
    "Chiminangos I","Chiminangos II","Chipichape","Ciudad 2000",
    "Ciudad Capri","Ciudad Córdoba","Ciudad Jardín","Ciudad Los Álamos",
    "Ciudad Meléndez","Ciudad Pacífica","Ciudad Universitaria","Ciudadela Comfandi","Ciudadela del Río",
    "Ciudadela Floralia","Ciudadela Pasoancho","Club Campestre",
    "Colinas del Sur","Colseguros Andes","Compartir","Cuarto de Legua",
    "Cuarteles Nápoles","Desepaz","Doce de Octubre","Eduardo Santos",
    "El Bosque","El Calvario","El Cedro","El Cortijo","El Diamante",
    "El Dorado","El Estero","El Guabal","El Hoyo","El Ingenio",
    "El Jardín","El Jordán","El Lido","El Limonar","El Morichal",
    "El Nacional","El Paraíso","El Peñón","El Piloto","El Poblado I",
    "El Poblado II","El Prado","El Recuerdo","El Refugio","El Retiro",
    "El Rodeo","El Sena","El Trébol","El Troncal","El Vallado",
    "El Vergel","Evaristo García","Fátima","Fenalco Kennedy",
    "Flora Industrial","Fonaviemcali","Francisco Eladio Ramírez",
    "Franquicia","Granada","Guayaquil","Guillermo Valencia",
    "Horizontes","Ignacio Rengifo","Industrial","Jorge Eliecer Gaitán",
    "Jorge Isaacs","Jorge Zawadsky","José Holguín Garcés",
    "José María Córdoba","Juan de Ampudia","Juanambú","Junín",
    "Kachipay","La Alianza","La Alborada","La Base","La Campiña","La Cascada",
    "La Castilla","La Esmeralda","La Flora","La Floresta",
    "La Fortaleza","La Gran Colombia","La Hacienda","La Independencia",
    "La Isla","La Leonera","La Libertad","La Merced","La Paz",
    "La Playa","La Selva","La Sultana","Las Acacias","Las Américas",
    "Las Ceibas","Las Delicias","Las Granjas","Las Orquídeas",
    "Las Quintas de Don Simón","Laureano Gómez","León XIII","Lili",
    "Lleras Camargo","Lleras Restrepo","Los Cambulos","Los Chorros",
    "Los Conquistadores","Los Farallones","Los Guaduales","Los Guayacanes",
    "Los Lagos","Los Libertadores","Los Naranjos","Los Parques",
    "Los Pinos","Los Robles","Los Sauces","Lourdes","Maracaibo",
    "Marco Fidel Suárez","Mariano Ramos","Mario Correa Rengifo",
    "Marroquín","Mayapán","Meléndez","Menga","Metropolitano del Norte",
    "Miraflores","Mojica","Montebello","Municipal","Navarro",
    "Normandía","Nueva Floresta","Nueva Tequendama","Nuevo Rey",
    "Olímpico","Omar Torrijos","Pampa Linda","Panamericano",
    "Parque de la Caña","Parque del Amor","Parque Vivero","Pasoancho",
    "Paseo de los Almendros","Petecuy I","Petecuy II","Petecuy III",
    "Pízamos I","Pízamos II","Pízamos III","Popular","Porvenir",
    "Potrero Grande","Prados de Oriente","Prados del Limonar",
    "Prados del Norte","Prados del Sur","Primavera","Primero de Mayo",
    "Primitivo Crespo","Puerto Mallarino","Puerto Nuevo",
    "República de Israel","Rodrigo Lara Bonilla","Saavedra Galindo",
    "Salomia","San Antonio","San Benito","San Cayetano",
    "San Cristóbal","San Fernando Nuevo","San Fernando Viejo",
    "San Francisco","San Joaquín","San Juan Bosco","San Luís",
    "San Luís II","San Marino","San Nicolás","San Pascual",
    "San Pedro","San Pedro Claver","San Vicente","Santa Ana",
    "Santa Anita","Santa Bárbara","Santa Elena","Santa Fe",
    "Santa Isabel","Santa Mónica","Santa Mónica Popular",
    "Santa Rita","Santa Rosa","Santa Teresita","Santander",
    "Santo Domingo","Sector Alto Jordán","Sector Meléndez",
    "Siete de Agosto","Siloé","Simón Bolívar","Sucre",
    "Tejares","Tequendama","Terrón Colorado","Tierra Blanca",
    "Torres de Comfandi","Uniambiente","Unicentro Cali",
    "Unión de Vivienda Popular","Uribe Uribe","Valle del Lili","Valle Grande",
    "Versalles","Villa Blanca","Villa Colombia","Villa del Lago",
    "Villa del Prado","Villa del Sol","Villa del Sur","Villanueva",
    "Vista Hermosa","Yira Castro"
  ],
  "Barranquilla": [
    "El Prado","Country Club","Golf","Buenavista","Alto Prado","Miramar","El Recreo",
    "Riomar","Villa Country","Los Alpes","Paraíso","La Cumbre","Pradomar","El Limoncito",
    "Altos del Prado","Villa Santos","Ciudad Jardín","Urbanización Cañaveral","Granadillo",
    "Boston","Bellavista","El Tabor","Las Nieves","Barrio Abajo","San Isidro","La Manga",
    "Modelo","San José","El Rosario","La Concepción","Simón Bolívar","La Luz","Kennedy",
    "Los Nogales","San Salvador","Santa Helena","Las Palmas","El Silencio","Ciudadela 20 de Julio",
    "Villa del Este","Las Américas","Los Olivos","La Floresta","Santodomingo","Los Laureles",
    "El Carmen","Nueva Granada","El Brillante","Lipaya","Nuevo Horizonte","Las Gardenias",
    "La Esmeralda","San Pedro Alejandrino","Las Malvinas","El Ferry","Rebolo","Montes",
    "Villate","La Ceiba","San Roque","Barranquillita","El Boliche","Chiquinquirá","Lucero"
  ],
  "Cartagena": [
    "Bocagrande","Manga","Castillogrande","El Laguito","Getsemaní","El Centro","La Matuna",
    "Pie de la Popa","La Popa","Marbella","El Cabrero","Crespo","Chambacú","Torices",
    "El Espinal","San Francisco","Ternera","Villa Rosita","Blas de Lezo","La Boquilla",
    "Barrio Chino","Los Ejecutivos","La Castellana","Santa Lucía","El Recreo","Zaragocilla",
    "Daniel Lemaitre","Armenia","El Pozón","Nelson Mandela","Olaya Herrera","San José de los Campanos",
    "Urbanización La Plazuela","Pie del Cerro","San Diego","Santa Ana","El Silencio",
    "Los Calamares","Amberes","Villa Estrella","Nazareno","La María","Nuevo Bosque",
    "Lomas del Peyé","El Campestre","Villa Venecia","Portal de Zaragocilla"
  ],
  "Bucaramanga": [
    "Cabecera del Llano","Lagos del Cacique","La Cumbre","Álvarez","San Alonso","Antonia Santos",
    "El Prado","García Rovira","Provenza","La Aurora","El Jardín","Sotomayor","Mejoras Públicas",
    "Comuneros","La Concordia","Chapinero","San Francisco","Villa Luz","La Rosita","Ciudadela Real de Minas",
    "El Centro","La Concordia","Mutis","San Martín","Conucos","Bucarica","La Feria",
    "Girón","Floridablanca","Piedecuesta","Ruitoque","Cañaveral","El Bosque","Los Comuneros",
    "Santa Elena","La Victoria","Diamante","Portal de Cabecera","La Joya","San Rafael",
    "La Fuente","Balcones de Provenza","El Reposo","Ricaurte","La Trinidad","Modelo"
  ],
  "Pereira": [
    "Pinares","Álamos","Circunvalar","Cerritos","El Jardín","Villa del Prado","Belmonte",
    "El Nogal","La Julita","Cuba","El Poblado","San Joaquín","Boston","Olímpica",
    "El Centro","Villavicencio","Ciudad Boquía","Tokio","El Dorado","Risaralda",
    "Ciudadela del Café","Panorama","Las Brisas","Santa Elena","Villa Santana",
    "San Nicolás","Maraya","La Camelia","Jardín","El Retiro","Berlín","Samaria",
    "La Dulcera","Corales","El Otoño","Kennedy","Los Alpes","Nuevo Horizonte",
    "Villa Carola","El Vergel","Perla del Otún","La Esperanza","La Florida"
  ],
  "Manizales": [
    "Chipre","Cable","Palermo","Los Cedros","La Enea","Milán","La Sultana","El Bosque",
    "Aranjuez","Versalles","Palogrande","Belén","La Fuente","San Marcel","Lleras",
    "La Estancia","Colinas del Norte","La Carola","Asunción","La Linda","Laureles",
    "Los Cámbulos","El Rosario","San Ignacio","El Campestre","Los Alcázares",
    "Samaria","La Violeta","Frailes","La Cumbre","El Triángulo","Ciudadela del Norte",
    "Marmato","La Rambla","San Germán","Villa Pilar","Palogrande Norte","El Nevado",
    "Fátima","Villa del Río","Santander","Los Ángeles","San Antonio","La Enea Norte"
  ]
}

// Ordenar alfabéticamente los barrios por ciudad
Object.keys(BARRIOS).forEach(ciudad => {
  BARRIOS[ciudad].sort((a, b) => a.localeCompare(b, "es-CO", { sensitivity: "base" }))
})

const fmt   = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n)
const fmtM2 = n => `${new Intl.NumberFormat("es-CO",{maximumFractionDigits:0}).format(n)} /m²`

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
    transition:"border .2s"
  }}>
    <option value="">{placeholder || "Seleccionar..."}</option>
    {options.map(o => <option key={o.v||o} value={o.v||o} style={{ background:C.bg3 }}>{o.l||o}</option>)}
  </select>
)

const SearchSelect = ({ value, onChange, options, placeholder = "Busca barrio...", disabled }) => {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const list = Array.isArray(options) ? options : []
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = (normalizedQuery
    ? list.filter(b => b.toLowerCase().includes(normalizedQuery))
    : list
  ).slice(0, 25)

  const handleSelect = (val) => {
    onChange(val)
    setQuery(val)
    setOpen(false)
  }

  return (
    <div style={{ position:"relative" }}>
      <input
        value={disabled ? "" : (query || value || "")}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => !disabled && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={disabled ? "Primero elige ciudad" : placeholder}
        disabled={disabled}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:8,
          border:`1px solid ${value ? C.green+"60" : C.border}`,
          fontSize:14, color: disabled ? C.gray : (value ? C.white : C.gray),
          background: C.bg3, outline:"none",
          cursor: disabled ? "not-allowed" : "text",
          transition:"border .2s"
        }}
      />
      {open && !disabled && filtered.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, marginTop:4,
          maxHeight:200, overflowY:"auto", background:C.bg3, borderRadius:8,
          border:`1px solid ${C.border}`, boxShadow:"0 10px 30px rgba(0,0,0,0.6)", zIndex:20
        }}>
          {filtered.map(b => (
            <div
              key={b}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(b)}
              style={{
                padding:"8px 12px", fontSize:13.5,
                cursor:"pointer",
                color: b === value ? C.green : C.white,
                background: b === value ? C.bg2 : "transparent"
              }}
            >
              {b}
            </div>
          ))}
          {filtered.length === 25 && (
            <div style={{ padding:"6px 12px", fontSize:11, color:C.gray }}>
              Sigue escribiendo para afinar la búsqueda…
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
          transition:"all .18s",
          boxShadow: value===v ? `0 0 12px ${C.greenGlow}` : "none"
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
    <div onClick={() => onChange(!value)} style={{
      width:48, height:26, borderRadius:13,
      background: value ? C.green : C.bg3,
      border:`1px solid ${value ? C.green : C.border}`,
      cursor:"pointer", position:"relative", transition:"all .25s", flexShrink:0
    }}>
      <div style={{
        width:20, height:20, borderRadius:"50%", background:C.white,
        position:"absolute", top:2, left:value ? 25 : 3, transition:"left .22s",
        boxShadow:`0 1px 4px rgba(0,0,0,.4)`
      }}/>
    </div>
  </div>
)

const Counter = ({ value, onChange, min = 0, max = 10 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:18 }}>
    <button onClick={() => onChange(Math.max(min,value-1))} style={{
      width:38, height:38, borderRadius:"50%",
      border:`1px solid ${C.green}`, background:"transparent",
      color:C.green, fontSize:22, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>−</button>
    <span style={{ fontSize:24, fontWeight:800, color:C.white, minWidth:28, textAlign:"center" }}>{value}</span>
    <button onClick={() => onChange(Math.min(max,value+1))} style={{
      width:38, height:38, borderRadius:"50%",
      border:"none", background:C.green,
      color:C.bg, fontSize:22, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>+</button>
  </div>
)

const Chip = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{
    padding:"7px 14px", borderRadius:20, cursor:"pointer", fontSize:12,
    border:`1px solid ${active ? C.green : C.border}`,
    background: active ? C.green+"20" : C.bg3,
    color: active ? C.green : C.gray,
    fontWeight: active ? 700 : 400, transition:"all .18s"
  }}>{label}</div>
)

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
const PHASE_LABELS = ["Ubicación","Detalles","Interiores","Amenidades","Parqueadero","Vistas","Financiero"]

const ProgressBar = ({ current }) => (
  <div style={{ marginBottom:32 }}>
    <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
      <div style={{ position:"absolute", top:14, left:"5%", right:"5%", height:1, background:C.border, zIndex:0 }}/>
      <div style={{
        position:"absolute", top:14, left:"5%", height:1, zIndex:1,
        width:`${Math.min(100,((current-1)/6)*100)}%`,
        background:`linear-gradient(90deg,${C.green},${C.greenD})`,
        transition:"width .4s ease",
        boxShadow:`0 0 8px ${C.green}`
      }}/>
      {PHASE_LABELS.map((lbl, i) => {
        const done = i+1 < current, active = i+1 === current
        return (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:2 }}>
            <div style={{
              width:30, height:30, borderRadius:"50%",
              background: done ? C.green : active ? C.bg : C.bg3,
              border:`1px solid ${done||active ? C.green : C.border}`,
              color: done ? C.bg : active ? C.green : C.gray,
              fontSize:11, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow: active ? `0 0 12px ${C.green}` : "none",
              transition:"all .25s"
            }}>
              {done ? "✓" : i+1}
            </div>
            <span style={{ fontSize:9, color:active ? C.green : C.gray, marginTop:5, fontWeight:active?700:400 }}>{lbl}</span>
          </div>
        )
      })}
    </div>
  </div>
)

const PhaseTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ fontSize:32, lineHeight:1, marginBottom:10 }}>{icon}</div>
    <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:C.white, letterSpacing:-.5 }}>{title}</h2>
    {sub && <p style={{ margin:"6px 0 0", fontSize:13.5, color:C.gray, lineHeight:1.5 }}>{sub}</p>}
  </div>
)

// ── 7 PHASES ──────────────────────────────────────────────────────────────────
const P1 = ({ f, s }) => {
  const barrios = BARRIOS[f.ciudad] || []
  return (
    <div>
      <PhaseTitle icon="📍" title="Ubicación y Categoría" sub="¿Dónde está la propiedad y qué tipo es?"/>
      <div style={{ display:"grid", gap:18 }}>
        <div>
          <Label req>Ciudad</Label>
          <Sel
            value={f.ciudad}
            onChange={v => s({ ...f, ciudad:v, barrio:"" })}
            options={CIUDADES}
            placeholder="Selecciona ciudad"
          />
        </div>
        <div>
          <Label req>Zona / Barrio</Label>
          <SearchSelect
            value={f.barrio}
            onChange={v => s({ ...f, barrio:v })}
            options={barrios}
            placeholder="Escribe el nombre del barrio"
            disabled={!f.ciudad}
          />
        </div>
        <GridSel label="Tipo de propiedad *" value={f.tipo} onChange={v => s({...f,tipo:v})} cols={3} items={[
          {v:"Apartamento",l:"Apartamento",icon:"🏢"},{v:"Casa",l:"Casa",icon:"🏠"},{v:"Lote",l:"Lote",icon:"🌿"},
          {v:"Comercial",l:"Comercial",icon:"🏪"},{v:"Oficina",l:"Oficina",icon:"💼"},{v:"Bodega",l:"Bodega",icon:"🏭"}
        ]}/>
        <div>
          <Label req>Estrato socioeconómico</Label>
          <div style={{ display:"flex", gap:8 }}>
            {[1,2,3,4,5,6].map(e => (
              <div key={e} onClick={() => s({...f,estrato:e})} style={{
                flex:1, padding:"11px 0", borderRadius:9, textAlign:"center", cursor:"pointer",
                border:`1px solid ${f.estrato===e ? C.green : C.border}`,
                background: f.estrato===e ? C.green+"20" : C.bg3,
                color: f.estrato===e ? C.green : C.gray,
                fontWeight:700, fontSize:15, transition:"all .2s",
                boxShadow: f.estrato===e ? `0 0 10px ${C.greenGlow}` : "none"
              }}>{e}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const P2 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="🏗️" title="Detalles Básicos" sub="Área, antigüedad y estado de la propiedad."/>
    <div style={{ display:"grid", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div><Label req>Área construida</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({...f,areaConstruida:v})} placeholder="Ej: 90" unit="m²"/></div>
        <div><Label>Área terreno</Label><Inp type="number" value={f.areaTerreno} onChange={v => s({...f,areaTerreno:v})} placeholder="Si aplica" unit="m²"/></div>
      </div>
      <div><Label req>Antigüedad</Label><Inp type="number" value={f.antiguedad} onChange={v => s({...f,antiguedad:v})} placeholder="Años desde construcción" unit="años"/></div>
      <GridSel label="Estado actual *" value={f.estado} onChange={v => s({...f,estado:v})} cols={2} items={[
        {v:"Excelente",l:"✨ Excelente"},{v:"Bueno",l:"👍 Bueno"},
        {v:"Regular",l:"⚠️ Regular"},{v:"Para remodelar",l:"🔨 Para remodelar"}
      ]}/>
      <div>
        <Toggle label="¿Ha sido remodelado?" value={f.remodelado==="si"} onChange={v => s({...f,remodelado:v?"si":"no"})}/>
        {f.remodelado==="si" && (
          <div style={{ marginTop:14, paddingLeft:14, borderLeft:`2px solid ${C.green}`, display:"grid", gap:12 }}>
            <div><Label>¿Hace cuántos años?</Label><Inp type="number" value={f.remodelAnios} onChange={v => s({...f,remodelAnios:v})} placeholder="Años" unit="años"/></div>
            <div>
              <Label>Áreas remodeladas</Label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:4 }}>
                {["Cocina","Baños","Pisos","Fachada","Eléctrico","Completo"].map(a => {
                  const sel = (f.remodelAreas||[]).includes(a)
                  return <Chip key={a} label={a} active={sel} onClick={() => {
                    const arr = f.remodelAreas||[]
                    s({...f, remodelAreas: sel ? arr.filter(x=>x!==a) : [...arr,a]})
                  }}/>
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)

const P3 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="🛋️" title="Distribución y Acabados" sub="Los interiores que determinan el valor."/>
    <div style={{ display:"grid", gap:22 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
        {[{l:"Dormitorios",k:"dormitorios",min:1,max:8},{l:"Baños completos",k:"banosC",min:0,max:6},{l:"Baños sociales",k:"banosS",min:0,max:3}].map(({l,k,min,max}) => (
          <div key={k} style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.gray, marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>{l}</div>
            <Counter value={f[k]||min} onChange={v => s({...f,[k]:v})} min={min} max={max}/>
          </div>
        ))}
      </div>
      <GridSel label="Tipo de acabados *" value={f.acabados} onChange={v => s({...f,acabados:v})} cols={2} items={[
        {v:"basicos",l:"Básicos",icon:"🔧"},{v:"estandar",l:"Estándar",icon:"🏠"},
        {v:"premium",l:"Premium",icon:"✨"},{v:"lujo",l:"Lujo",icon:"💎"}
      ]}/>
      <GridSel label="Tipo de cocina" value={f.cocina} onChange={v => s({...f,cocina:v})} cols={3} items={[
        {v:"cerrada",l:"Cerrada"},{v:"abierta",l:"Abierta/Integral"},{v:"americana",l:"Americana"}
      ]}/>
      <GridSel label="Altura de techos" value={f.altTechos} onChange={v => s({...f,altTechos:v})} cols={3} items={[
        {v:"estandar",l:"Estándar ~2.5m"},{v:"altos",l:"Altos ~3m+"},{v:"doble",l:"Doble altura"}
      ]}/>
      <div>
        <Toggle label="¿Tiene balcón / terraza?" value={!!f.balcon} onChange={v => s({...f,balcon:v})}/>
        {f.balcon && <div style={{ marginTop:10, paddingLeft:14, borderLeft:`2px solid ${C.green}` }}><Label>Área del balcón</Label><Inp type="number" value={f.balconM2} onChange={v => s({...f,balconM2:v})} placeholder="Ej: 12" unit="m²"/></div>}
        <Toggle label="¿Tiene sótano / semisótano?" value={!!f.sotano} onChange={v => s({...f,sotano:v})}/>
      </div>
    </div>
  </div>
)

const P4 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="🏊" title="Amenidades y Servicios" sub="Pueden aumentar el valor entre 8% y 20%."/>
    <div style={{ display:"grid", gap:2 }}>
      <Toggle label="🏊 Piscina" value={!!f.piscina} onChange={v => s({...f,piscina:v})}/>
      {f.piscina && <div style={{ paddingLeft:14, borderLeft:`2px solid ${C.green}`, marginBottom:6, paddingTop:8 }}><Sel value={f.piscinaT} onChange={v => s({...f,piscinaT:v})} options={["Cubierta","Descubierta","Sin fin / Infinity"]} placeholder="Tipo de piscina"/></div>}
      <Toggle label="💪 Gimnasio" value={!!f.gimnasio} onChange={v => s({...f,gimnasio:v})}/>
      <Toggle label="🎉 Salón social / Eventos" value={!!f.salon} onChange={v => s({...f,salon:v})}/>
      <Toggle label="🧒 Parque infantil" value={!!f.parque} onChange={v => s({...f,parque:v})}/>
      <Toggle label="🧖 Sauna / Turco" value={!!f.sauna} onChange={v => s({...f,sauna:v})}/>
      <Toggle label="🛗 Ascensor" value={!!f.ascensor} onChange={v => s({...f,ascensor:v})}/>
      <div style={{ marginTop:16, display:"grid", gap:14 }}>
        <div><Label>Planta eléctrica</Label><Sel value={f.plantaElec} onChange={v => s({...f,plantaElec:v})} options={["Total","Parcial","No tiene"]} placeholder="Seleccionar..."/></div>
        <div>
          <Label>Seguridad</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:6 }}>
            {["Portería 24/7","Cámaras","Acceso tarjeta","Vigilancia privada","Citófono"].map(sg => {
              const sel = (f.seguridad||[]).includes(sg)
              return <Chip key={sg} label={sg} active={sel} onClick={() => {
                const arr = f.seguridad||[]
                s({...f, seguridad: sel ? arr.filter(x=>x!==sg) : [...arr,sg]})
              }}/>
            })}
          </div>
        </div>
        <div><Label>Administración mensual</Label><Inp type="number" value={f.adminM} onChange={v => s({...f,adminM:v})} placeholder="Ej: 350000" unit="COP"/></div>
      </div>
    </div>
  </div>
)

const P5 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="🚗" title="Parqueaderos" sub="Puede representar hasta el 8% del valor total."/>
    <div style={{ display:"grid", gap:22 }}>
      <div><Label>Número de parqueaderos incluidos</Label><Counter value={f.parqueaderos||0} onChange={v => s({...f,parqueaderos:v})} min={0} max={5}/></div>
      {(f.parqueaderos||0) > 0 && <>
        <GridSel label="Tipo de parqueadero" value={f.parqT} onChange={v => s({...f,parqT:v})} cols={3} items={[
          {v:"cubierto",l:"Garaje cubierto"},{v:"paralelo",l:"Paralelo"},{v:"descubierto",l:"Descubierto"}
        ]}/>
        <GridSel label="¿Asignados o zona común?" value={f.parqAsig} onChange={v => s({...f,parqAsig:v})} cols={2} items={[
          {v:"asignados",l:"✅ Asignados"},{v:"comun",l:"🔄 Zona común"}
        ]}/>
      </>}
    </div>
  </div>
)

const P6 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="🌅" title="Vistas y Localización" sub="La orientación y entorno pueden valorizar hasta 15%."/>
    <div style={{ display:"grid", gap:18 }}>
      <GridSel label="Orientación principal" value={f.orientacion} onChange={v => s({...f,orientacion:v})} cols={4} items={[
        {v:"norte",l:"⬆️ Norte"},{v:"sur",l:"⬇️ Sur"},{v:"oriente",l:"➡️ Oriente"},{v:"occidente",l:"⬅️ Occidente"}
      ]}/>
      <GridSel label="Tipo de vista" value={f.vista} onChange={v => s({...f,vista:v})} cols={3} items={[
        {v:"ciudad",l:"🌆 Ciudad"},{v:"cerros",l:"⛰️ Cerros"},{v:"rio",l:"🌊 Río"},
        {v:"parque",l:"🌳 Parque"},{v:"calle",l:"🚦 Calle"},{v:"otra",l:"🔭 Otra"}
      ]}/>
      <GridSel label="Calidad de la vista" value={f.calidadV} onChange={v => s({...f,calidadV:v})} cols={3} items={[
        {v:"despejada",l:"🔭 Despejada"},{v:"parcial",l:"🌫️ Parcial"},{v:"obstruida",l:"🧱 Obstruida"}
      ]}/>
      <div>
        <Label>Proximidades</Label>
        <div style={{ display:"grid", gap:10 }}>
          {[{l:"🍽️ Gastronomía",k:"proxGastro"},{l:"🛒 Comercio",k:"proxComercio"},{l:"🚌 Transporte",k:"proxTransp"}].map(({l,k}) => (
            <div key={k}>
              <div style={{ fontSize:12, color:C.gray, marginBottom:6 }}>{l}</div>
              <div style={{ display:"flex", gap:8 }}>
                {["Cercana","Media","Lejana"].map(p => (
                  <div key={p} onClick={() => s({...f,[k]:p})} style={{
                    flex:1, padding:"9px", borderRadius:8, textAlign:"center", cursor:"pointer", fontSize:12,
                    border:`1px solid ${f[k]===p ? C.green : C.border}`,
                    background: f[k]===p ? C.green+"20" : C.bg3,
                    color: f[k]===p ? C.green : C.gray, fontWeight:f[k]===p ? 700 : 400
                  }}>{p}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <GridSel label="Estado de la zona" value={f.zonaEst} onChange={v => s({...f,zonaEst:v})} cols={2} items={[
        {v:"desarrollo",l:"🔨 En desarrollo"},{v:"consolidada",l:"✅ Consolidada"}
      ]}/>
    </div>
  </div>
)

const P7 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="💰" title="Datos Financieros" sub="Opcional — personaliza la recomendación de precio."/>
    <div style={{ display:"grid", gap:18 }}>
      <div>
        <Label>Precio de referencia en mente</Label>
        <Inp type="number" value={f.precioRef} onChange={v => s({...f,precioRef:v})} placeholder="Ej: 750000000" unit="COP"/>
        {f.precioRef && <div style={{ marginTop:6, fontSize:12, color:C.green, fontWeight:700 }}>{fmt(parseInt(f.precioRef))}</div>}
      </div>
      <GridSel label="Plazo deseado de venta" value={f.plazo} onChange={v => s({...f,plazo:v})} cols={2} items={[
        {v:"urgente",l:"🔥 Urgente"},{v:"1-3m",l:"⚡ 1–3 meses"},
        {v:"3-6m",l:"📅 3–6 meses"},{v:"sin-prisa",l:"🎯 Sin prisa"}
      ]}/>
      <div>
        <Label>Notas adicionales</Label>
        <textarea value={f.notas} onChange={e => s({...f,notas:e.target.value})}
          placeholder="Ej: ático con terraza privada, bodega adicional, vista panorámica única..."
          style={{ width:"100%", minHeight:80, padding:"11px 14px", borderRadius:8, border:`1px solid ${f.notas ? C.green+"60" : C.border}`, fontSize:13, color:C.white, resize:"vertical", outline:"none", boxSizing:"border-box", background:C.bg3 }}/>
      </div>
    </div>
  </div>
)

// ── LOADING ───────────────────────────────────────────────────────────────────
const Loading = () => {
  const [step, setStep] = useState(0)
  const steps = ["Procesando datos de la propiedad...","Consultando mercado colombiano 2025...","Calculando comparables en la zona...","Generando valoración con Claude AI...","Guardando en base de datos..."]
  useState(() => { const iv = setInterval(() => setStep(s => Math.min(s+1,4)), 1400); return () => clearInterval(iv) })
  return (
    <div style={{ textAlign:"center", padding:"60px 24px" }}>
      <div style={{ position:"relative", width:80, height:80, margin:"0 auto 28px" }}>
        <div style={{ width:80, height:80, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin .8s linear infinite", boxShadow:`0 0 20px ${C.greenGlow}` }}/>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:28 }}>🏠</div>
      </div>
      <h2 style={{ margin:"0 0 6px", fontSize:22, color:C.white, fontWeight:800 }}>Analizando el mercado</h2>
      <p style={{ margin:"0 0 28px", fontSize:14, color:C.gray }}>Claude AI está generando tu análisis profesional</p>
      <div style={{ display:"grid", gap:8, maxWidth:300, margin:"0 auto" }}>
        {steps.map((st, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:9, background:i<=step ? C.bg3 : "transparent", border:`1px solid ${i<=step ? C.border : "transparent"}` }}>
            <span style={{ fontSize:14 }}>{i<step ? "✅" : i===step ? "⏳" : "○"}</span>
            <span style={{ fontSize:13, color:i===step ? C.green : i<step ? C.grayL : C.gray, fontWeight:i===step ? 700 : 400 }}>{st}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
const Results = ({ form, result, onReset, saved }) => {
  const [tab, setTab] = useState("resumen")
  const area = parseFloat(form.areaConstruida) || 90
  const comps = (result.comparables||[]).map(c => ({...c, precioM2: Math.round(c.precio/c.area)}))
  const TABS = [{id:"resumen",l:"📊 Resumen"},{id:"comparables",l:"🏘️ Comparables"},{id:"graficos",l:"📈 Gráficos"},{id:"precios",l:"💎 Precios"}]

  const tooltipStyle = { background:C.bg2, border:`1px solid ${C.border}`, borderRadius:9, fontSize:12, color:C.white }

  return (
    <div>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.bg2} 0%, ${C.bg3} 100%)`, borderRadius:16, padding:"28px 24px", marginBottom:18, border:`1px solid ${C.green}30`, boxShadow:`0 0 40px ${C.greenGlow}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-40, top:-40, width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle, ${C.green}08, transparent)` }}/>
        <div style={{ fontSize:10, color:C.green, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>✦ Análisis Comparativo de Mercado · IA</div>
        <h1 style={{ margin:"0 0 4px", fontSize:22, color:C.white, fontWeight:800 }}>{form.tipo} · {form.barrio}, {form.ciudad}</h1>
        <div style={{ fontSize:12.5, color:C.gray, marginBottom:20 }}>
          {form.areaConstruida}m² · {form.dormitorios||2} hab · {form.banosC||1} baños · Estrato {form.estrato} · {new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"})}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:"rgba(0,208,132,.08)", borderRadius:12, padding:"14px 16px", border:`1px solid ${C.green}20` }}>
            <div style={{ fontSize:10, color:C.gray, marginBottom:3, textTransform:"uppercase", letterSpacing:1 }}>Precio de Mercado</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.green }}>{fmt(result.precio_mercado)}</div>
            <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{fmtM2(result.precio_m2_base)}</div>
          </div>
          <div style={{ background:C.bg3, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color:C.gray, marginBottom:3, textTransform:"uppercase", letterSpacing:1 }}>Rango</div>
            <div style={{ fontSize:12, color:C.white, fontWeight:600, marginTop:2 }}>{fmt(result.precio_oportunidad)}</div>
            <div style={{ fontSize:10, color:C.gray }}>hasta {fmt(result.precio_aspiracion)}</div>
          </div>
        </div>
        <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
          <span style={{ background:`${C.green}15`, border:`1px solid ${C.green}40`, borderRadius:20, padding:"3px 12px", fontSize:10, color:C.green }}>✅ Válido 90 días</span>
          {saved && <span style={{ background:`${C.green}15`, border:`1px solid ${C.green}40`, borderRadius:20, padding:"3px 12px", fontSize:10, color:C.green }}>💾 Guardado en Supabase</span>}
          <span style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:20, padding:"3px 12px", fontSize:10, color:C.gray }}>🤖 Generado con Claude AI</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:18, background:C.bg2, borderRadius:12, padding:4, border:`1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:"9px 4px", borderRadius:8, border:"none", cursor:"pointer",
            background: tab===t.id ? C.green+"20" : "transparent",
            color: tab===t.id ? C.green : C.gray,
            fontWeight: tab===t.id ? 700 : 400, fontSize:12,
            borderBottom: tab===t.id ? `2px solid ${C.green}` : "2px solid transparent",
            transition:"all .18s"
          }}>{t.l}</button>
        ))}
      </div>

      {/* TAB RESUMEN */}
      {tab==="resumen" && <div style={{ display:"grid", gap:14 }}>
        <Card glow>
          <div style={{ fontSize:10, fontWeight:700, color:C.green, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Resumen Ejecutivo</div>
          <p style={{ margin:0, fontSize:14.5, color:C.grayL, lineHeight:1.75 }}>{result.resumen_ejecutivo}</p>
        </Card>
        <Card>
          <div style={{ fontSize:10, fontWeight:700, color:C.green, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>⚖️ Factores de Valorización</div>
          <div style={{ display:"grid", gap:8 }}>
            {(result.factores||[]).map((f,i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 14px", borderRadius:9, background:f.positivo ? "#00D08410" : "#FF444410", borderLeft:`2px solid ${f.positivo ? C.green : C.red}` }}>
                <span style={{ fontSize:16, lineHeight:1 }}>{f.positivo ? "✅" : "⚠️"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:C.white }}>{f.factor}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:f.positivo ? C.green : C.red }}>{f.impacto}</span>
                  </div>
                  {f.descripcion && <div style={{ fontSize:11.5, color:C.gray, marginTop:3 }}>{f.descripcion}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        {result.recomendaciones && <Card>
          <div style={{ fontSize:10, fontWeight:700, color:C.green, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>🎯 Recomendaciones Estratégicas</div>
          <div style={{ display:"grid", gap:10 }}>
            {[
              {icon:"💡",t:"Precio inicial recomendado",v:result.recomendaciones.precio_inicial},
              {icon:"🤝",t:"Estrategia de negociación",v:result.recomendaciones.estrategia},
              {icon:"📣",t:"Atributos a destacar",v:result.recomendaciones.atributos},
              {icon:"⚠️",t:"Posibles objeciones",v:result.recomendaciones.objeciones},
            ].map((r,i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:14, background:C.bg3, borderRadius:10, border:`1px solid ${C.border}` }}>
                <span style={{ fontSize:18 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:C.white, marginBottom:4 }}>{r.t}</div>
                  <div style={{ fontSize:13, color:C.gray, lineHeight:1.6 }}>{r.v}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>}
      </div>}

      {/* TAB COMPARABLES */}
      {tab==="comparables" && <Card>
        <div style={{ fontSize:10, fontWeight:700, color:C.green, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>🏘️ Propiedades Comparables</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5, minWidth:520 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {["Propiedad","Zona","Área","Precio","$/m²","Hab","Años","Estado"].map(h => (
                  <th key={h} style={{ padding:"10px 10px", textAlign:"left", color:C.gray, fontWeight:700, whiteSpace:"nowrap", fontSize:11, textTransform:"uppercase", letterSpacing:.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comps.map((c,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"12px 10px", fontWeight:700, color:C.white }}>{c.nombre}</td>
                  <td style={{ padding:"12px 10px", color:C.gray }}>{c.zona}</td>
                  <td style={{ padding:"12px 10px", color:C.grayL }}>{c.area}m²</td>
                  <td style={{ padding:"12px 10px", fontWeight:600, color:C.white, fontSize:12 }}>{fmt(c.precio)}</td>
                  <td style={{ padding:"12px 10px", color:C.green, fontWeight:700 }}>{new Intl.NumberFormat("es-CO").format(c.precioM2)}</td>
                  <td style={{ padding:"12px 10px", color:C.grayL }}>{c.dormitorios}H/{c.banos}B</td>
                  <td style={{ padding:"12px 10px", color:C.grayL }}>{c.antiguedad}a</td>
                  <td style={{ padding:"12px 10px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:10, fontSize:11, fontWeight:700, background:c.estado==="Excelente" ? "#00D08420" : c.estado==="Bueno" ? "#3B82F620" : "#F59E0B20", color:c.estado==="Excelente" ? C.green : c.estado==="Bueno" ? "#60A5FA" : "#F59E0B" }}>{c.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop:14, padding:"10px 14px", background:C.bg3, borderRadius:9, border:`1px solid ${C.border}`, fontSize:12.5, color:C.gray }}>
          <strong style={{ color:C.grayL }}>Promedio:</strong> {fmtM2(Math.round(comps.reduce((a,c)=>a+c.precioM2,0)/Math.max(comps.length,1)))} &nbsp;·&nbsp; <strong style={{ color:C.green }}>Tu propiedad:</strong> {fmtM2(result.precio_m2_base)}
        </div>
      </Card>}

      {/* TAB GRÁFICOS */}
      {tab==="graficos" && <div style={{ display:"grid", gap:14 }}>
        <Card>
          <div style={{ fontWeight:800, color:C.white, marginBottom:4, fontSize:15 }}>📈 Tendencia Precio/m² · 12 meses</div>
          <div style={{ fontSize:12, color:C.gray, marginBottom:18 }}>Zona {form.barrio}, {form.ciudad}</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={result.tendencia||[]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="mes" tick={{ fontSize:9, fill:C.gray }}/>
              <YAxis tickFormatter={v => (v/1000000).toFixed(1)+"M"} tick={{ fontSize:9, fill:C.gray }} width={45}/>
              <Tooltip formatter={v => fmtM2(v)} contentStyle={tooltipStyle} labelStyle={{ color:C.green }}/>
              <Line type="monotone" dataKey="precio" stroke={C.green} strokeWidth={2.5} dot={{ fill:C.green, r:3 }} activeDot={{ r:6, fill:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
              <ReferenceLine y={result.precio_m2_base} stroke={C.green} strokeDasharray="5 3" strokeOpacity={.5} label={{ value:"Tu prop.", position:"insideTopRight", fontSize:9, fill:C.green }}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontWeight:800, color:C.white, marginBottom:4, fontSize:15 }}>🏙️ Precio/m² por Zona</div>
          <div style={{ fontSize:12, color:C.gray, marginBottom:18 }}>Comparación con zonas aledañas</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={result.zonas_precio||[]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
              <XAxis type="number" tickFormatter={v => (v/1000000).toFixed(1)+"M"} tick={{ fontSize:9, fill:C.gray }}/>
              <YAxis type="category" dataKey="zona" tick={{ fontSize:10, fill:C.gray }} width={110}/>
              <Tooltip formatter={v => fmtM2(v)} contentStyle={tooltipStyle}/>
              <Bar dataKey="precio" radius={[0,6,6,0]}>
                {(result.zonas_precio||[]).map((entry,i) => (
                  <Cell key={i} fill={entry.zona===form.barrio ? C.green : C.bg3}
                    stroke={entry.zona===form.barrio ? C.green : C.border} strokeWidth={1}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>}

      {/* TAB PRECIOS */}
      {tab==="precios" && <div style={{ display:"grid", gap:12 }}>
        {[
          { tipo:"Oportunidad", precio:result.precio_oportunidad, plazo:result.plazo_oportunidad||"< 3 meses", desc:"Precio competitivo para venta rápida.", color:"#60A5FA", border:"#3B82F630", icon:"⚡" },
          { tipo:"Mercado", precio:result.precio_mercado, plazo:result.plazo_mercado||"3–6 meses", desc:"Equilibrio perfecto entre precio y tiempo. Máxima probabilidad de cierre.", color:C.green, border:`${C.green}40`, icon:"⚖️", rec:true },
          { tipo:"Aspiración", precio:result.precio_aspiracion, plazo:result.plazo_aspiracion||"> 6 meses", desc:"Capitaliza todos los atributos premium.", color:"#A78BFA", border:"#7C3AED30", icon:"💎" },
        ].map(p => (
          <div key={p.tipo} style={{ background:C.bg2, borderRadius:14, padding:"22px 24px", border:`1px solid ${p.border}`, boxShadow: p.rec ? `0 0 20px ${C.greenGlow}` : "none", position:"relative" }}>
            {p.rec && <div style={{ position:"absolute", top:-12, right:18, background:C.green, color:C.bg, padding:"3px 14px", borderRadius:20, fontSize:10, fontWeight:800, letterSpacing:1 }}>⭐ RECOMENDADO</div>}
            <div style={{ fontSize:12, color:C.gray, marginBottom:5 }}>{p.icon} Precio de {p.tipo}</div>
            <div style={{ fontSize:30, fontWeight:800, color:p.color }}>{fmt(p.precio)}</div>
            <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>{fmtM2(Math.round(p.precio/area))} · {p.plazo}</div>
            <div style={{ marginTop:10, fontSize:13.5, color:C.gray, lineHeight:1.6 }}>{p.desc}</div>
          </div>
        ))}
        {form.precioRef && (() => {
          const ref = parseInt(form.precioRef), diff = ref - result.precio_mercado, pct = ((diff/result.precio_mercado)*100).toFixed(1)
          return (
            <Card>
              <div style={{ fontWeight:700, color:C.white, marginBottom:8, fontSize:14 }}>📊 Tu precio de referencia vs. mercado</div>
              <div style={{ fontSize:14, color:C.gray, lineHeight:1.7 }}>
                Tu precio <strong style={{ color:C.white }}>{fmt(ref)}</strong> está{" "}
                {diff > 0 ? <span style={{ color:"#A78BFA" }}><strong>{pct}% por encima</strong> del mercado</span> : <span style={{ color:C.green }}><strong>{Math.abs(pct)}% por debajo</strong> del mercado</span>}.{" "}
                {Math.abs(pct) > 15 ? "Considera ajustarlo para mayor competitividad." : "Está en un rango razonable."}
              </div>
            </Card>
          )
        })()}
      </div>}

      <div style={{ display:"flex", gap:10, marginTop:22 }}>
        <button onClick={() => window.print()} style={{ flex:2, padding:"14px", borderRadius:12, border:`1px solid ${C.green}`, background:`${C.green}15`, color:C.green, fontWeight:800, fontSize:14, cursor:"pointer" }}>📄 Imprimir / PDF</button>
        <button onClick={onReset} style={{ flex:1, padding:"14px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.gray, fontWeight:700, fontSize:14, cursor:"pointer" }}>🔄 Nuevo</button>
      </div>
      <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:C.gray }}>Análisis generado con Claude AI · Datos guardados en Supabase</div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const EF = { ciudad:"",barrio:"",tipo:"",estrato:0,areaConstruida:"",areaTerreno:"",antiguedad:"",estado:"",remodelado:"no",remodelAnios:"",remodelAreas:[],dormitorios:2,banosC:1,banosS:0,acabados:"",cocina:"",altTechos:"",balcon:false,balconM2:"",sotano:false,piscina:false,piscinaT:"",gimnasio:false,salon:false,parque:false,sauna:false,ascensor:false,plantaElec:"",seguridad:[],adminM:"",parqueaderos:0,parqT:"",parqAsig:"",proxGastro:"",proxComercio:"",proxTransp:"",orientacion:"",vista:"",calidadV:"",zonaEst:"",precioRef:"",plazo:"",notas:"" }

export default function App() {
  const [phase, setPhase]     = useState(1)
  const [form, setForm]       = useState({...EF})
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [saved, setSaved]     = useState(false)

  const PHASES = [
    <P1 f={form} s={setForm}/>, <P2 f={form} s={setForm}/>, <P3 f={form} s={setForm}/>,
    <P4 f={form} s={setForm}/>, <P5 f={form} s={setForm}/>, <P6 f={form} s={setForm}/>,
    <P7 f={form} s={setForm}/>,
  ]

  const next = async () => {
    if (phase < 7) { setPhase(p => p+1); return }
    setLoading(true); setError(null); setSaved(false)
    try {
      // 1. Llamar a Claude AI
      const res = await fetch("/api/analyze", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData: form }),
      })
      if (!res.ok) throw new Error("Error del servidor")
      const data = await res.json()
      setResult(data)

      // 2. Guardar en Supabase (en background)
      fetch("/api/save-analysis", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData: form, result: data }),
      }).then(r => r.ok && setSaved(true)).catch(console.warn)

    } catch(e) {
      setError("Error al generar el análisis. Por favor intenta de nuevo.")
    } finally { setLoading(false) }
  }

  const reset = () => { setPhase(1); setForm({...EF}); setResult(null); setError(null); setSaved(false) }

  return (
    <>
      <style>{`
        * { box-sizing:border-box; -webkit-font-smoothing:antialiased; }
        body { margin:0; background:${C.bg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:${C.white}; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        select option { background:${C.bg3}; color:${C.white}; }
        input::placeholder, textarea::placeholder { color:${C.gray}; }
        select:focus, input:focus, textarea:focus { border-color:${C.green}!important; box-shadow:0 0 0 3px ${C.greenGlow}; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:${C.green}60; border-radius:2px; }
        @media print { body { background:white; color:black; } }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 14px 40px" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, background:`linear-gradient(135deg,${C.green},${C.greenD})`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:`0 4px 16px ${C.greenGlow}` }}>🏠</div>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:C.white, lineHeight:1, letterSpacing:-.5 }}>ACM Pro</div>
                <div style={{ fontSize:10, color:C.green, letterSpacing:2, textTransform:"uppercase" }}>Powered by Claude AI</div>
              </div>
            </div>
            {!result && !loading && (
              <div style={{ fontSize:11.5, color:C.gray, background:C.bg2, padding:"5px 14px", borderRadius:20, border:`1px solid ${C.border}` }}>Fase {phase} / 7</div>
            )}
          </div>

          {error && <div style={{ background:"#FF444415", border:"1px solid #FF444440", borderRadius:12, padding:"12px 16px", marginBottom:16, color:C.red, fontSize:13 }}>⚠️ {error}</div>}

          {loading && <Card><Loading/></Card>}
          {result && !loading && <Results form={form} result={result} onReset={reset} saved={saved}/>}

          {!loading && !result && (
            <div style={{ animation:"fadeIn .3s ease" }}>
              <ProgressBar current={phase}/>
              <Card>
                {PHASES[phase-1]}
                <div style={{ display:"flex", gap:10, marginTop:28 }}>
                  {phase > 1 && (
                    <button onClick={() => setPhase(p => p-1)} style={{ flex:1, padding:"14px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.gray, fontWeight:700, fontSize:14, cursor:"pointer" }}>← Atrás</button>
                  )}
                  <button onClick={next} style={{
                    flex:3, padding:"14px", borderRadius:12, border:"none",
                    background:`linear-gradient(135deg,${C.green},${C.greenD})`,
                    color:C.bg, fontWeight:800, fontSize:15, cursor:"pointer",
                    boxShadow:`0 4px 20px ${C.greenGlow}`, letterSpacing:.3
                  }}>
                    {phase===7 ? "✦ Generar Análisis con IA" : "Continuar →"}
                  </button>
                </div>
              </Card>
              <div style={{ textAlign:"center", marginTop:14, fontSize:11.5, color:C.gray }}>💾 Tus respuestas se guardan automáticamente · Puedes volver atrás en cualquier momento</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
