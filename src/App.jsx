import { useState, useRef, useEffect } from "react"
import { supabase } from "./lib/supabase"
import AuthPage from "./AuthPage"
import OnboardingPage from "./OnboardingPage"
import DashboardPage from "./DashboardPage"
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
  "México":    ["Ciudad de México","Guadalajara","Monterrey","Puebla","Tijuana","Cancún","Querétaro","Mérida","León","San Luis Potosí"],
  "Argentina": ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata","Mar del Plata","Tucumán","Salta","Santa Fe","Neuquén"],
  "Chile":     ["Santiago","Viña del Mar","Valparaíso","Concepción","La Serena","Antofagasta","Temuco","Rancagua","Iquique","Puerto Montt"],
  "Perú":      ["Lima","Arequipa","Trujillo","Chiclayo","Cusco","Iquitos","Piura","Huancayo","Tacna","Pucallpa"],
  "Ecuador":   ["Quito","Guayaquil","Cuenca","Ambato","Manta","Santo Domingo","Machala","Portoviejo","Loja","Ibarra"],
  "Uruguay":   ["Montevideo","Salto","Ciudad de la Costa","Paysandú","Las Piedras","Rivera","Maldonado","Tacuarembó","Melo","Mercedes"],
  "Panamá":    ["Ciudad de Panamá","San Miguelito","Arraiján","La Chorrera","Colón","David","Santiago","Chitré","Penonomé","Las Tablas"],
}

// Para compatibilidad con el código existente
const CIUDADES = CIUDADES_POR_PAIS["Colombia"]

const TIPOS_PROPIEDAD = [
  // Residencial
  { v:"Apartamento",        l:"🏢 Apartamento" },
  { v:"Apartaestudio",      l:"🏠 Apartaestudio" },
  { v:"Casa",               l:"🏡 Casa" },
  { v:"Casa en condominio", l:"🏘️ Casa en condominio" },
  { v:"Penthouse",          l:"✨ Penthouse / PH" },
  // Terrenos
  { v:"Lote urbano",        l:"📐 Lote urbano" },
  { v:"Lote en condominio", l:"🏗️ Lote en condominio" },
  { v:"Lote industrial",    l:"🏭 Lote industrial" },
  { v:"Finca",              l:"🌿 Finca / Lote rural" },
  // Comercial
  { v:"Local comercial",    l:"🏪 Local comercial" },
  { v:"Oficina",            l:"💼 Oficina" },
  { v:"Consultorio",        l:"🩺 Consultorio" },
  { v:"Hotel",              l:"🏨 Hotel / Hostal" },
  // Industrial
  { v:"Bodega",             l:"📦 Bodega / Industrial" },
]

const TIPO_GRUPO = {
  "Apartamento":        "residencial",
  "Apartaestudio":      "residencial",
  "Casa":               "residencial",
  "Casa en condominio": "residencial",
  "Penthouse":          "residencial",
  "Local comercial":    "comercial",
  "Oficina":            "comercial",
  "Hotel":              "comercial",
  "Consultorio":        "comercial",
  "Bodega":             "industrial",
  "Lote urbano":        "terreno",
  "Lote en condominio": "terreno",
  "Lote industrial":    "terreno",
  "Finca":              "terreno",
}

const PAIS_CODE = {
  "Colombia":"co","México":"mx","Argentina":"ar","Chile":"cl",
  "Perú":"pe","Ecuador":"ec","Uruguay":"uy","Panamá":"pa",
}

const PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY

let placesScriptLoaded = false
function loadPlacesScript() {
  if (!PLACES_KEY) return Promise.resolve()
  if (window.google?.maps?.places) return Promise.resolve()
  return new Promise(res => {
    if (placesScriptLoaded) {
      const check = setInterval(() => { if (window.google?.maps?.places) { clearInterval(check); res() } }, 50)
      return
    }
    placesScriptLoaded = true
    const s = document.createElement("script")
    s.src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_KEY}&libraries=places&language=es`
    s.async = true
    s.onload = () => {
      const check = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(check); res() }
      }, 50)
    }
    document.head.appendChild(s)
  })
}

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

const DARK_MAP_STYLE = [
  { elementType:"geometry", stylers:[{color:"#1A1A1A"}] },
  { elementType:"labels.text.stroke", stylers:[{color:"#1A1A1A"}] },
  { elementType:"labels.text.fill", stylers:[{color:"#AAAAAA"}] },
  { featureType:"administrative", elementType:"geometry", stylers:[{color:"#222222"}] },
  { featureType:"road", elementType:"geometry", stylers:[{color:"#2A2A2A"}] },
  { featureType:"road", elementType:"labels.text.fill", stylers:[{color:"#777777"}] },
  { featureType:"poi", elementType:"geometry", stylers:[{color:"#252525"}] },
  { featureType:"water", elementType:"geometry", stylers:[{color:"#0D1B1A"}] },
  { featureType:"transit", elementType:"geometry", stylers:[{color:"#1E1E1E"}] },
]

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
        onFocus={() => { if (!disabled) { if (!query && value) setQuery(value); setOpen(true) } }}
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

const MoneyInp = ({ value, onChange, placeholder, unit = "COP" }) => {
  const raw     = String(value || "").replace(/\D/g, "")
  const display = raw ? Number(raw).toLocaleString("es-CO") : ""
  return (
    <div style={{ position:"relative" }}>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        style={{
          width:"100%", padding:"11px 52px 11px 14px", borderRadius:8,
          border:`1px solid ${raw ? C.green+"60" : C.border}`,
          fontSize:14, color:C.white, background:C.bg3, outline:"none",
          boxSizing:"border-box", transition:"border .2s"
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
const PHASE_LABELS = ["Ubicación","Detalles","Interiores","Amenidades","Parqueadero","Financiero"]

const ProgressBar = ({ current }) => (
  <div style={{ marginBottom:32 }}>
    <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
      <div style={{ position:"absolute", top:14, left:"5%", right:"5%", height:1, background:C.border, zIndex:0 }}/>
      <div style={{
        position:"absolute", top:14, left:"5%", height:1, zIndex:1,
        width:`${Math.min(100,((current-1)/5)*100)}%`,
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

const PlacesInput = ({ value, onChange, onPlace, pais, placeholder }) => {
  const [query, setQuery]           = useState(value || "")
  const [predictions, setPredictions] = useState([])
  const [open, setOpen]             = useState(false)
  const svcRef      = useRef(null)
  const geocRef     = useRef(null)
  const timerRef    = useRef(null)
  const onPlaceRef  = useRef(onPlace)
  onPlaceRef.current = onPlace

  // Sync query when value is cleared externally
  useEffect(() => { if (!value) setQuery("") }, [value])

  useEffect(() => {
    loadPlacesScript().then(() => {
      svcRef.current  = new window.google.maps.places.AutocompleteService()
      geocRef.current = new window.google.maps.Geocoder()
    })
  }, [])

  const fetchPredictions = (input) => {
    if (!svcRef.current || !input.trim()) { setPredictions([]); return }
    svcRef.current.getPlacePredictions(
      { input, componentRestrictions: { country: PAIS_CODE[pais] || "co" }, types: ["geocode"] },
      (results, status) => {
        setPredictions(status === "OK" ? (results || []) : [])
        if (status === "OK" && results?.length) setOpen(true)
      }
    )
  }

  const handleChange = (v) => {
    setQuery(v); onChange(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchPredictions(v), 280)
  }

  const handleSelect = (pred) => {
    const text = pred.structured_formatting.main_text
    setQuery(text); onChange(text)
    setPredictions([]); setOpen(false)
    geocRef.current?.geocode({ placeId: pred.place_id }, (results, status) => {
      if (status !== "OK" || !results?.[0]) return
      let barrio = "", ciudad = "", paisDet = ""
      for (const comp of results[0].address_components) {
        const t = comp.types
        if (!barrio && (t.includes("neighborhood") || t.includes("sublocality_level_1") || t.includes("sublocality")))
          barrio = comp.long_name
        if (!ciudad && (t.includes("locality") || t.includes("administrative_area_level_2")))
          ciudad = comp.long_name
        if (t.includes("country")) paisDet = comp.long_name
      }
      if (!barrio) barrio = text
      setQuery(barrio); onChange(barrio)
      onPlaceRef.current({ barrio, ciudad, pais: paisDet || pais })
    })
  }

  const inpStyle = {
    width:"100%", padding:"11px 14px", borderRadius:8,
    border:`1px solid ${query ? C.green+"60" : C.border}`,
    fontSize:14, color: query ? C.white : C.gray,
    background: C.bg3, outline:"none", transition:"border .2s", boxSizing:"border-box",
  }

  return (
    <div style={{ position:"relative" }}>
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => predictions.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder || "Escribe el barrio..."}
        autoComplete="off"
        style={inpStyle}
      />
      {open && predictions.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, marginTop:4,
          background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8,
          zIndex:50, maxHeight:220, overflowY:"auto",
          boxShadow:"0 10px 30px rgba(0,0,0,0.7)"
        }}>
          {predictions.map(pred => (
            <div
              key={pred.place_id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(pred)}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.border}22`, fontSize:13.5 }}
            >
              <div style={{ color:C.white, fontWeight:600 }}>{pred.structured_formatting.main_text}</div>
              <div style={{ color:C.gray, fontSize:11, marginTop:2 }}>{pred.structured_formatting.secondary_text}</div>
            </div>
          ))}
          <div style={{ padding:"5px 14px", fontSize:10, color:C.gray, textAlign:"right" }}>powered by Google</div>
        </div>
      )}
    </div>
  )
}

const PhaseTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ fontSize:32, lineHeight:1, marginBottom:10 }}>{icon}</div>
    <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:C.white, letterSpacing:-.5 }}>{title}</h2>
    {sub && <p style={{ margin:"6px 0 0", fontSize:13.5, color:C.gray, lineHeight:1.5 }}>{sub}</p>}
  </div>
)

// ── 7 PHASES ──────────────────────────────────────────────────────────────────
function LocationMap({ form }) {
  const mapRef = useRef(null)
  const [status, setStatus] = useState("idle")

  useEffect(() => {
    if (!PLACES_KEY || !form.barrio || !form.ciudad) { setStatus("idle"); return }

    setStatus("loading")
    let mapInstance = null
    let markerInstance = null

    loadPlacesScript().then(() => {
      try {
        const geocoder = new window.google.maps.Geocoder()
        const address = [form.direccion, form.barrio, form.ciudad, form.pais].filter(Boolean).join(", ")

        geocoder.geocode({ address }, (results, gStatus) => {
          if (gStatus !== "OK" || !results?.[0]) { setStatus("idle"); return }

          const loc = results[0].geometry.location
          if (!mapRef.current) return

          mapInstance = new window.google.maps.Map(mapRef.current, {
            center: loc, zoom: 14,
            styles: DARK_MAP_STYLE,
            mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            backgroundColor: "#0A0A0A",
          })

          markerInstance = new window.google.maps.Marker({ position: loc, map: mapInstance })
          setStatus("ready")
        })
      } catch (_) { setStatus("idle") }
    }).catch(() => setStatus("idle"))

    return () => {
      if (markerInstance) markerInstance.setMap(null)
    }
  }, [form.barrio, form.ciudad, form.direccion, form.pais])

  if (!PLACES_KEY) return null
  if (status === "idle" || !form.barrio || !form.ciudad) return null

  return (
    <div style={{ position:"relative" }}>
      {status === "loading" && (
        <div style={{ position:"absolute", inset:0, zIndex:1, display:"flex", alignItems:"center", justifyContent:"center", background:C.bg2, borderRadius:12, border:`1px solid ${C.border}`, color:C.gray }}>
          <p style={{ fontSize:13, color:C.grayL }}>Cargando mapa...</p>
        </div>
      )}
      <div ref={mapRef} style={{ width:"100%", height:220, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, opacity:status==="ready"?1:0.4 }} />
    </div>
  )
}

const P1 = ({ f, s }) => {
  return (
    <div>
      <PhaseTitle icon="📍" title="Ubicación y Tipo de Propiedad" sub="¿Dónde está y qué tipo de propiedad es?"/>
      <div style={{ display:"grid", gap:18 }}>

        {/* País */}
        <div>
          <Label req>País</Label>
          <Sel
            value={f.pais || "Colombia"}
            onChange={v => s({ ...f, pais:v, ciudad:"", barrio:"" })}
            options={PAISES}
            placeholder="Selecciona país"
          />
        </div>

        {/* Ciudad */}
        <div>
          <Label req>Ciudad</Label>
          <Inp
            value={f.ciudad}
            onChange={v => s({ ...f, ciudad:v })}
            placeholder="Ej: Medellín, Bogotá, Ciudad de México..."
          />
        </div>

        {/* Barrio */}
        <div>
          <Label req>Barrio</Label>
          <Inp
            value={f.barrio}
            onChange={v => s({ ...f, barrio:v })}
            placeholder="Ej: El Poblado, Usaquén, Laureles..."
          />
        </div>

        {/* Dirección — opcional */}
        <div>
          <Label>Dirección <span style={{ color:C.gray, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(opcional)</span></Label>
          <Inp
            value={f.direccion || ""}
            onChange={v => s({ ...f, direccion:v })}
            placeholder="Ej: Cra 43A #7-50, Torre 2 Apto 301"
          />
        </div>

        {/* Mapa de ubicación */}
        <LocationMap form={f} />

        {/* Tipo de propiedad */}
        <div>
          <Label req>Tipo de propiedad</Label>
          <Sel
            value={f.tipo}
            onChange={v => s({...f, tipo:v})}
            options={TIPOS_PROPIEDAD}
            placeholder="Selecciona tipo de propiedad"
          />
        </div>

      </div>
    </div>
  )
}

function P2({ f, s }) {
  const grupo = TIPO_GRUPO[f.tipo] || "residencial"
  const esFinca = f.tipo === "Finca"

  if (grupo === "terreno") return (
    <div>
      <PhaseTitle icon="📐" title="Datos del Terreno" sub="Las variables que determinan el valor del lote o finca."/>
      <div style={{ display:"grid", gap:18 }}>

        <div style={{ display:"grid", gridTemplateColumns: esFinca ? "1fr 1fr" : "1fr", gap:12 }}>
          <div><Label req>Área del terreno</Label><Inp type="number" value={f.areaTerreno} onChange={v => s({...f,areaTerreno:v})} placeholder="Ej: 300" unit="m²"/></div>
          {esFinca && <div><Label>Área construida</Label><Inp type="number" value={f.areaConstruida} onChange={v => s({...f,areaConstruida:v})} placeholder="Si tiene casa" unit="m²"/></div>}
        </div>

        <GridSel label="Topografía" value={f.topografia} onChange={v => s({...f,topografia:v})} cols={3} items={[
          {v:"plano",l:"⬜ Plano"},{v:"ondulado",l:"〰️ Ondulado"},{v:"inclinado",l:"📐 Inclinado"}
        ]}/>

        {(f.tipo === "Lote urbano" || f.tipo === "Lote en condominio" || f.tipo === "Lote industrial") && (
          <div><Label>Frente a vía (metros lineales)</Label><Inp type="number" value={f.frenteVia} onChange={v => s({...f,frenteVia:v})} placeholder="Ej: 12" unit="m"/></div>
        )}

        <div>
          <Label>Servicios disponibles</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:6 }}>
            {["Agua","Luz","Gas","Alcantarillado","Internet","Vías pavimentadas"].map(sv => {
              const sel = (f.servicios||[]).includes(sv)
              return <Chip key={sv} label={sv} active={sel} onClick={() => {
                const arr = f.servicios||[]
                s({...f, servicios: sel ? arr.filter(x=>x!==sv) : [...arr,sv]})
              }}/>
            })}
          </div>
        </div>

        {esFinca && (
          <GridSel label="Estado de la finca" value={f.estado} onChange={v => s({...f,estado:v})} cols={2} items={[
            {v:"Excelente",l:"✨ Excelente"},{v:"Bueno",l:"👍 Bueno"},
            {v:"Regular",l:"⚠️ Regular"},{v:"Para remodelar",l:"🔨 Para remodelar"}
          ]}/>
        )}

      </div>
    </div>
  )

  // Residencial / Comercial / Industrial
  return (
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
}

function P3({ f, s }) {
  const grupo = TIPO_GRUPO[f.tipo] || "residencial"

  if (grupo === "terreno") return (
    <div>
      <PhaseTitle icon="🌱" title="Características del Terreno" sub="Área y ubicación son los factores principales para valorar."/>
      <div style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:12, padding:24, textAlign:"center", color:C.grayL, lineHeight:1.7 }}>
        <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
        <p style={{ margin:0, fontWeight:600, color:C.white }}>Los datos básicos son suficientes para este tipo.</p>
        <p style={{ margin:"8px 0 0", fontSize:13 }}>Para lotes y fincas el valor depende del área, ubicación y zonificación. Continúa al siguiente paso.</p>
      </div>
    </div>
  )

  if (grupo === "comercial") return (
    <div>
      <PhaseTitle icon="🏢" title="Detalles Comerciales" sub="Acabados y administración definen el valor de una propiedad comercial."/>
      <div style={{ display:"grid", gap:22 }}>
        <GridSel label="Estado de los acabados" value={f.acabados} onChange={v => s({...f,acabados:v})} cols={2} items={[
          {v:"basicos",l:"Básicos",icon:"🔧"},{v:"estandar",l:"Estándar",icon:"🏠"},
          {v:"premium",l:"Premium",icon:"✨"},{v:"lujo",l:"Lujo",icon:"💎"}
        ]}/>
        <div><Label>Administración mensual</Label><MoneyInp value={f.adminM} onChange={v => s({...f,adminM:v})} placeholder="Ej: 450.000 — 0 si no aplica"/></div>
      </div>
    </div>
  )

  if (grupo === "industrial") return (
    <div>
      <PhaseTitle icon="🏭" title="Detalles de la Bodega" sub="Estado y características operativas de la bodega."/>
      <div style={{ display:"grid", gap:22 }}>
        <GridSel label="Estado actual" value={f.estado} onChange={v => s({...f,estado:v})} cols={2} items={[
          {v:"Excelente",l:"✨ Excelente"},{v:"Bueno",l:"👍 Bueno"},
          {v:"Regular",l:"⚠️ Regular"},{v:"Para remodelar",l:"🔨 Para remodelar"}
        ]}/>
        <GridSel label="Altura libre de la bodega" value={f.altBodega} onChange={v => s({...f,altBodega:v})} cols={3} items={[
          {v:"hasta6m",l:"Hasta 6m"},{v:"6a10m",l:"6 – 10m"},{v:"mas10m",l:"Más de 10m"}
        ]}/>
        <div>
          <Label>Muelles de cargue</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:6 }}>
            {["Muelle cubierto","Muelle a nivel","Sin muelle"].map(m => {
              const sel = f.muellesT === m
              return <Chip key={m} label={m} active={sel} onClick={() => s({...f, muellesT:m})}/>
            })}
          </div>
        </div>
      </div>
    </div>
  )

  // ── RESIDENCIAL (default) ────────────────────────────────────────────────
  return (
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
        <GridSel label="Nivel de acabados *" value={f.acabados} onChange={v => s({...f,acabados:v})} cols={2} items={[
          {v:"basicos",l:"Básicos",icon:"🔧"},{v:"estandar",l:"Estándar",icon:"🏠"},
          {v:"premium",l:"Premium",icon:"✨"},{v:"lujo",l:"Lujo",icon:"💎"}
        ]}/>
      </div>
    </div>
  )
}

function P4({ f, s }) {
  const grupo = TIPO_GRUPO[f.tipo] || "residencial"
  const esResidencial = grupo === "residencial"

  return (
    <div>
      <PhaseTitle
        icon={esResidencial ? "🏊" : "🔒"}
        title={esResidencial ? "Amenidades y Servicios" : "Servicios del Inmueble"}
        sub={esResidencial ? "Pueden aumentar el valor entre 8% y 20%." : "Servicios que inciden en el valor comercial."}
      />
      <div style={{ display:"grid", gap:2 }}>
        {esResidencial && <>
          <Toggle label="🏊 Piscina" value={!!f.piscina} onChange={v => s({...f,piscina:v})}/>
          <Toggle label="💪 Gimnasio" value={!!f.gimnasio} onChange={v => s({...f,gimnasio:v})}/>
          <Toggle label="🎉 Salón social / Eventos" value={!!f.salon} onChange={v => s({...f,salon:v})}/>
          <Toggle label="🧒 Parque infantil" value={!!f.parque} onChange={v => s({...f,parque:v})}/>
          <Toggle label="🧖 Sauna / Turco" value={!!f.sauna} onChange={v => s({...f,sauna:v})}/>
        </>}
        <Toggle label="🛗 Ascensor" value={!!f.ascensor} onChange={v => s({...f,ascensor:v})}/>
        <div style={{ marginTop:16, display:"grid", gap:14 }}>
          <div><Label>Planta eléctrica</Label><Sel value={f.plantaElec} onChange={v => s({...f,plantaElec:v})} options={["Total","Parcial","No tiene"]} placeholder="Seleccionar..."/></div>
          <div>
            <Label>Seguridad</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:6 }}>
              {["Portería 24/7","Acceso inteligente","Sin seguridad"].map(sg => (
                <Chip key={sg} label={sg} active={f.seguridad === sg} onClick={() => s({...f, seguridad: sg})}/>
              ))}
            </div>
          </div>
          {grupo !== "comercial" && (
            <div><Label>Administración mensual</Label><MoneyInp value={f.adminM} onChange={v => s({...f,adminM:v})} placeholder="Ej: 350.000"/></div>
          )}
        </div>
      </div>
    </div>
  )
}

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


const P7 = ({ f, s }) => (
  <div>
    <PhaseTitle icon="💰" title="Datos Financieros" sub="Opcional — personaliza la recomendación de precio."/>
    <div style={{ display:"grid", gap:18 }}>
      <div>
        <Label>Precio de referencia en mente</Label>
        <MoneyInp value={f.precioRef} onChange={v => s({...f,precioRef:v})} placeholder="Ej: 750.000.000"/>
        {f.precioRef && <div style={{ marginTop:6, fontSize:12, color:C.green, fontWeight:700 }}>{fmt(parseInt(f.precioRef))}</div>}
      </div>
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
  const steps = ["Procesando datos de la propiedad...","Consultando mercado colombiano 2025...","Calculando comparables en la zona...","Generando valoración profesional...","Finalizando análisis..."]
  useEffect(() => { const iv = setInterval(() => setStep(s => Math.min(s+1,4)), 1400); return () => clearInterval(iv) }, [])
  return (
    <div style={{ textAlign:"center", padding:"60px 24px" }}>
      <div style={{ position:"relative", width:80, height:80, margin:"0 auto 28px" }}>
        <div style={{ width:80, height:80, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin .8s linear infinite", boxShadow:`0 0 20px ${C.greenGlow}` }}/>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:28 }}>🏠</div>
      </div>
      <h2 style={{ margin:"0 0 6px", fontSize:22, color:C.white, fontWeight:800 }}>Analizando el mercado</h2>
      <p style={{ margin:"0 0 28px", fontSize:14, color:C.gray }}>Generando tu análisis profesional de mercado...</p>
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

// ── MAP VIEW ────────────────────────────────────────────────────────────────────
function MapView({ form, result }) {
  const mapRef = useRef(null)
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    if (!PLACES_KEY) { setStatus("no_key"); return }
    if (!form.barrio) { setStatus("no_address"); return }

    let mapInstance = null
    let markerInstance = null
    let infoInstance = null

    loadPlacesScript().then(() => {
      try {
        const geocoder = new window.google.maps.Geocoder()
        const address = [form.direccion, form.barrio, form.ciudad, form.pais].filter(Boolean).join(", ")

        geocoder.geocode({ address }, (results, gStatus) => {
          if (gStatus !== "OK" || !results?.[0]) { setStatus("error"); return }

          const loc = results[0].geometry.location
          mapInstance = new window.google.maps.Map(mapRef.current, {
            center: loc, zoom: 14,
            styles: DARK_MAP_STYLE,
            mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            backgroundColor: "#0A0A0A",
          })

          markerInstance = new window.google.maps.Marker({ position: loc, map: mapInstance })

          infoInstance = new window.google.maps.InfoWindow({
            content: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:6px;min-width:180px">
                <div style="font-size:13px;font-weight:700;color:#00D084;margin-bottom:4px">${form.tipo}</div>
                <div style="font-size:11px;color:#666;margin-bottom:6px">${form.barrio}, ${form.ciudad}</div>
                <div style="border-top:1px solid #eee;margin:4px 0;padding-top:6px">
                  <div style="font-size:11px;color:#60A5FA">Inmediato: <strong>${fmt(result.precio_oportunidad)}</strong></div>
                  <div style="font-size:11px;color:#00D084">Mercado: <strong>${fmt(result.precio_mercado)}</strong></div>
                  <div style="font-size:11px;color:#A78BFA">Óptimo: <strong>${fmt(result.precio_aspiracion)}</strong></div>
                </div>
              </div>
            `,
          })
          markerInstance.addListener("click", () => infoInstance.open(mapInstance, markerInstance))
          infoInstance.open(mapInstance, markerInstance)
          setStatus("ready")
        })
      } catch (_) { setStatus("error") }
    }).catch(() => setStatus("error"))

    return () => {
      if (infoInstance) infoInstance.close()
      if (markerInstance) markerInstance.setMap(null)
    }
  }, [form, result])

  return (
    <div>
      <div style={{ position:"relative" }}>
        {status !== "ready" && (
          <div style={{ position:"absolute", inset:0, zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:C.bg2, borderRadius:12, border:`1px solid ${C.border}`, color:C.gray }}>
            {status === "no_key" && (
              <>
                <div style={{ fontSize:32, marginBottom:8 }}>🗺️</div>
                <p style={{ fontSize:14, color:C.white, margin:"0 0 4px" }}>Mapa no disponible</p>
                <p style={{ fontSize:12, margin:0 }}>Configura <code style={{ color:C.green }}>VITE_GOOGLE_PLACES_KEY</code> para ver la ubicación</p>
              </>
            )}
            {status === "no_address" && (
              <>
                <div style={{ fontSize:32, marginBottom:8 }}>🗺️</div>
                <p style={{ fontSize:14, color:C.white, margin:"0 0 4px" }}>Ingresa un barrio para ver el mapa</p>
              </>
            )}
            {status === "loading" && (
              <>
                <div style={{ position:"relative", width:60, height:60, margin:"0 auto 16px" }}>
                  <div style={{ width:60, height:60, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:24 }}>🗺️</div>
                </div>
                <p style={{ margin:0, fontSize:14, color:C.grayL }}>Cargando mapa...</p>
              </>
            )}
            {status === "error" && (
              <>
                <div style={{ fontSize:32, marginBottom:8 }}>🗺️</div>
                <p style={{ fontSize:14, color:C.white, margin:"0 0 4px" }}>No se pudo cargar el mapa</p>
                <p style={{ fontSize:12, margin:0 }}>Verifica que la dirección sea correcta</p>
              </>
            )}
          </div>
        )}
        <div ref={mapRef} style={{ width:"100%", height:420, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }} />
      </div>
      {result.zonas_precio?.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.green, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>💰 Precio /m² por Zona</div>
          <div style={{ display:"grid", gap:6 }}>
            {result.zonas_precio.map((z, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:C.bg3, borderRadius:8, border:`1px solid ${C.border}` }}>
                <span style={{ color: z.zona === form.barrio ? C.green : C.white, fontWeight: z.zona === form.barrio ? 700 : 600, fontSize:13 }}>{z.zona}</span>
                <span style={{ color: C.gray, fontWeight:700, fontSize:13 }}>
                  {new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(z.precio)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
const Results = ({ form, result, onReset, saved, user, onDashboard }) => {
  const [tab, setTab] = useState("resumen")
  const area = parseFloat(form.areaConstruida) || 90
  const comps = (result.comparables||[]).map(c => ({...c, precioM2: Math.round(c.precio/c.area)}))
  const TABS = [{id:"resumen",l:"📊 Resumen"},{id:"comparables",l:"🏘️ Comparables"},{id:"graficos",l:"📈 Gráficos"},{id:"mapa",l:"🗺️ Mapa"},{id:"precios",l:"💎 Precios"}]

  const tooltipStyle = { background:C.bg2, border:`1px solid ${C.border}`, borderRadius:9, fontSize:12, color:C.white }

  return (
    <div>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.bg2} 0%, ${C.bg3} 100%)`, borderRadius:16, padding:"28px 24px", marginBottom:18, border:`1px solid ${C.green}30`, boxShadow:`0 0 40px ${C.greenGlow}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-40, top:-40, width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle, ${C.green}08, transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div style={{ fontSize:10, color:C.green, fontWeight:700, letterSpacing:3, textTransform:"uppercase" }}>✦ Análisis Comparativo de Mercado · IA</div>
          {(user?.user_metadata?.logo_url || user?.user_metadata?.company_name) && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {user.user_metadata.logo_url && <img src={user.user_metadata.logo_url} alt="logo" style={{ height:28, borderRadius:4 }}/>}
              {user.user_metadata.company_name && <span style={{ fontSize:11, color:C.gray }}>{user.user_metadata.company_name}</span>}
            </div>
          )}
        </div>
        <h1 style={{ margin:"0 0 4px", fontSize:22, color:C.white, fontWeight:800 }}>{form.tipo} · {form.barrio}, {form.ciudad}{form.pais && form.pais !== "Colombia" ? `, ${form.pais}` : ""}</h1>
        <div style={{ fontSize:12.5, color:C.gray, marginBottom:20 }}>
          {form.areaConstruida || form.areaTerreno || "?"}m²
          {TIPO_GRUPO[form.tipo] === "residencial" && <> · {form.dormitorios||2} hab · {form.banosC||1} baños</>}
          {TIPO_GRUPO[form.tipo] !== "terreno" && form.antiguedad && <> · {form.antiguedad} años</>}
          {" · "}{new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"})}
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
          {result._meta?.fuentes && <span style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:20, padding:"3px 12px", fontSize:10, color:C.gray }}>📊 Fuentes: {result._meta.fuentes}</span>}
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
        {result._meta && (
          <div style={{ marginTop:12, padding:"10px 14px", background:C.bg3, borderRadius:9, border:`1px solid ${C.border}`, fontSize:11.5, color:C.gray }}>
            <strong style={{ color:C.grayL }}>📊 Fuentes de datos:</strong>{" "}
            {result._meta.fuentes || "Análisis de mercado"} &nbsp;·&nbsp;
            {result._meta.comparables_fresh > 0 && <span>{result._meta.comparables_fresh} en tiempo real &nbsp;·&nbsp;</span>}
            {result._meta.comparables_db > 0 && <span>{result._meta.comparables_db} históricos &nbsp;·&nbsp;</span>}
            {result._meta.precio_m2_real && <span>$/m² mercado real: <strong style={{ color:C.green }}>{new Intl.NumberFormat("es-CO").format(result._meta.precio_m2_real)}</strong></span>}
          </div>
        )}
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
          { tipo:"Inmediato", precio:result.precio_oportunidad, plazo:result.plazo_oportunidad||"< 30 días", desc:"Precio para cerrar rápido. Genera urgencia y atrae compradores activos.", color:"#60A5FA", border:"#3B82F630", icon:"🔥" },
          { tipo:"Mercado", precio:result.precio_mercado, plazo:result.plazo_mercado||"1–6 meses", desc:"Precio justo según el mercado actual. Máxima probabilidad de cierre.", color:C.green, border:`${C.green}40`, icon:"⚖️", rec:true },
          { tipo:"Óptimo", precio:result.precio_aspiracion, plazo:result.plazo_aspiracion||"6–12 meses", desc:"Precio máximo. Para quien no tiene prisa y quiere capitalizar al máximo.", color:"#A78BFA", border:"#7C3AED30", icon:"💎" },
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

      {/* TAB MAPA */}
      {tab==="mapa" && (
        <Card>
          <div style={{ fontSize:10, fontWeight:700, color:C.green, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>🗺️ Ubicación y Precios por Zona</div>
          <MapView form={form} result={result}/>
        </Card>
      )}

      <div style={{ display:"flex", gap:10, marginTop:22 }}>
        <button onClick={() => window.print()} style={{ flex:2, padding:"14px", borderRadius:12, border:`1px solid ${C.green}`, background:`${C.green}15`, color:C.green, fontWeight:800, fontSize:14, cursor:"pointer" }}>📄 Imprimir / PDF</button>
        {onDashboard && <button onClick={onDashboard} style={{ flex:1, padding:"14px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.gray, fontWeight:700, fontSize:14, cursor:"pointer" }}>📊 Dashboard</button>}
        <button onClick={onReset} style={{ flex:1, padding:"14px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.gray, fontWeight:700, fontSize:14, cursor:"pointer" }}>🔄 Nuevo</button>
      </div>
    </div>
  )
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
const L = {
  surface: "#f7f9fb", "container-lowest": "#ffffff", "container-low": "#f2f4f6",
  "container": "#eceef0", "container-high": "#e6e8ea",
  "on-surface": "#191c1e", "on-surface-variant": "#45464d",
  primary: "#000000", "on-primary": "#ffffff", "primary-container": "#131b2e",
  secondary: "#006c49", "on-secondary": "#ffffff",
  "secondary-container": "#6cf8bb",
  "outline-variant": "#c6c6cd",
}

function LandingPage({ onStart }) {
  const container = { maxWidth:1200, margin:"0 auto", padding:"0 24px", width:"100%" }
  const card = { background:L["container-lowest"], borderRadius:10, boxShadow:"0px 4px 20px rgba(15,23,42,0.05)", border:`1px solid ${L["outline-variant"]}` }

  return (
    <div style={{ background:L.surface, minHeight:"100vh", fontFamily:"Inter, -apple-system, sans-serif" }}>
      {/* Top Navigation */}
      <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:L["container-lowest"], boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ ...container, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <span style={{ fontSize:18, fontWeight:700, color:L.primary, letterSpacing:"-0.02em" }}>EstateAnalytix</span>
            <nav style={{ display:"flex", gap:20, color:L["on-surface-variant"], fontSize:13, fontWeight:500 }}>
              {["Dashboard","Mercado","Portafolio","Reportes"].map(l => (
                <span key={l} style={{ cursor:"pointer" }}>{l}</span>
              ))}
            </nav>
          </div>
          <button onClick={onStart} style={{ background:L.secondary, color:L["on-secondary"], border:"none", borderRadius:6, padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Nuevo Análisis
          </button>
        </div>
      </header>

      <main style={{ paddingTop:60 }}>
        {/* Hero */}
        <section style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 60px)", textAlign:"center", padding:"40px 24px" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.06, backgroundImage:"radial-gradient(#000 0.5px, transparent 0.5px)", backgroundSize:"24px 24px", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1, maxWidth:900 }}>
            <h1 style={{ fontSize:44, fontWeight:700, color:L.primary, lineHeight:1.15, margin:"0 0 12px", letterSpacing:"-0.02em" }}>
              Transforme Datos en <span style={{ color:L.secondary }}>Decisiones Inmobiliarias</span> de Alto Impacto
            </h1>
            <p style={{ fontSize:16, color:L["on-surface-variant"], lineHeight:1.6, maxWidth:560, margin:"0 auto 28px" }}>
              Análisis de mercado en tiempo real con Machine Learning, proyecciones de rentabilidad y tendencias locales para profesionales inmobiliarios en Colombia.
            </p>
            {/* Search bar */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
              <div style={{ flex:"1 1 180px", display:"flex", alignItems:"center", gap:6, padding:"10px 14px", background:L["container-lowest"], borderRadius:8, border:`1px solid ${L["outline-variant"]}`, maxWidth:220, minWidth:140 }}>
                <span>📍</span>
                <input placeholder="Ciudad" style={{ border:"none", outline:"none", fontSize:14, width:"100%", background:"transparent" }}/>
              </div>
              <div style={{ flex:"1 1 160px", display:"flex", alignItems:"center", gap:6, padding:"10px 14px", background:L["container-lowest"], borderRadius:8, border:`1px solid ${L["outline-variant"]}`, maxWidth:200, minWidth:120 }}>
                <span>🏘️</span>
                <input placeholder="Barrio" style={{ border:"none", outline:"none", fontSize:14, width:"100%", background:"transparent" }}/>
              </div>
              <div style={{ flex:"1 1 130px", display:"flex", alignItems:"center", gap:6, padding:"10px 14px", background:L["container-lowest"], borderRadius:8, border:`1px solid ${L["outline-variant"]}`, maxWidth:170, minWidth:100 }}>
                <span>🏷️</span>
                <select style={{ border:"none", outline:"none", fontSize:14, width:"100%", background:"transparent", color:L["on-surface-variant"] }}>
                  <option>Tipo</option><option>Residencial</option><option>Comercial</option><option>Industrial</option>
                </select>
              </div>
              <button onClick={onStart} style={{ background:L.primary, color:L["on-primary"], border:"none", borderRadius:8, padding:"10px 22px", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                🔍 Analizar
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section style={{ ...container, paddingBottom:48 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:12 }}>
            <div style={{ ...card, gridColumn:"span 8", padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <h3 style={{ margin:0, fontSize:17, fontWeight:600 }}>Tendencias de Precio</h3>
                <span style={{ color:L.secondary, fontSize:11, fontWeight:600, background:L["secondary-container"], padding:"3px 8px", borderRadius:20 }}>+9.8% Anual</span>
              </div>
              <div style={{ height:180, background:L["container-low"], borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:L["on-surface-variant"], fontSize:14 }}>📈 Tendencia de precios en Colombia</div>
            </div>
            <div style={{ gridColumn:"span 4", background:L.primary, color:L["on-primary"], borderRadius:10, padding:20, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
                <h3 style={{ margin:"0 0 6px", fontSize:17, fontWeight:600, color:"#fff" }}>Confianza del Mercado</h3>
                <p style={{ fontSize:13, color:L["on-primary-container"], margin:0, lineHeight:1.5 }}>Sectores prime muestran alta demanda en Medellín y Bogotá.</p>
              </div>
              <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${L["primary-container"]}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div>
                    <div style={{ fontSize:28, fontWeight:700, lineHeight:1 }}>76/100</div>
                    <p style={{ fontSize:11, color:L["on-primary-container"], margin:"3px 0 0" }}>Score de Confianza</p>
                  </div>
                  <span style={{ fontSize:20 }}>📈</span>
                </div>
              </div>
            </div>
            <div style={{ ...card, gridColumn:"span 4", padding:20 }}>
              <h3 style={{ margin:"0 0 12px", fontSize:17, fontWeight:600 }}>Zonas Hotspot</h3>
              {[{n:"El Poblado, Medellín",r:"6.2%"},{n:"Usaquén, Bogotá",r:"5.1%"},{n:"El Cabrero, Cartagena",r:"7.4%"}].map((z,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:24, height:24, background:i===0?L["secondary-container"]:"#e0e3e5", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:i===0?L.secondary:L["on-surface"] }}>{i+1}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{z.n}</div>
                      <div style={{ fontSize:11, color:L["on-surface-variant"] }}>Rentabilidad {z.r}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:16 }}>↗️</span>
                </div>
              ))}
            </div>
            <div style={{ ...card, gridColumn:"span 8", padding:0, overflow:"hidden", position:"relative", minHeight:200 }}>
              <div style={{ position:"absolute", inset:0, background:`linear-gradient(to top, ${L.primary}E6, transparent)`, zIndex:1 }}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:2, padding:20 }}>
                <span style={{ background:L.secondary, color:L["on-secondary"], padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600, display:"inline-block", marginBottom:6 }}>🏆 PROPIEDAD DESTACADA</span>
                <h3 style={{ margin:"0 0 3px", fontSize:20, fontWeight:600, color:"#fff" }}>Rancho Santa Isabel</h3>
                <p style={{ margin:0, color:"rgba(255,255,255,0.7)", fontSize:13, maxWidth:360, lineHeight:1.5 }}>Análisis de rentabilidad proyectada en la vía Medellín–Rionegro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section style={{ background:L["container-low"], padding:"48px 0" }}>
          <div style={{ ...container, textAlign:"center" }}>
            <h2 style={{ fontSize:26, fontWeight:600, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Potencia tu estrategia con Machine Learning</h2>
            <p style={{ fontSize:15, color:L["on-surface-variant"], maxWidth:520, margin:"0 auto 36px", lineHeight:1.5 }}>Nuestro motor procesa datos de múltiples fuentes para darte una visión clara del mercado inmobiliario colombiano.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}>
              {[
                {icon:"🕸️", title:"Recopilación en Vivo", desc:"Scraping de Metrocuadrado, FincaRaíz + datos de Supabase."},
                {icon:"🧠", title:"Análisis con IA", desc:"Machine Learning calcula precio de oportunidad, mercado y aspiración."},
                {icon:"📋", title:"Reporte Completo", desc:"Gráficos, mapa de calor, comparables y recomendaciones."},
              ].map((item,i) => (
                <div key={i} style={{ ...card, padding:20, textAlign:"center" }}>
                  <div style={{ width:40, height:40, background:L.primary, color:L["on-primary"], borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, margin:"0 auto 12px" }}>{item.icon}</div>
                  <h4 style={{ fontSize:15, fontWeight:600, margin:"0 0 4px" }}>{item.title}</h4>
                  <p style={{ fontSize:13, color:L["on-surface-variant"], margin:0, lineHeight:1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cobertura */}
        <section style={{ ...container, padding:"40px 0", textAlign:"center" }}>
          <h2 style={{ fontSize:20, fontWeight:600, margin:"0 0 16px" }}>Cobertura en Colombia</h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
            {["Medellín","Bogotá","Cali","Barranquilla","Cartagena","Bucaramanga","Pereira","Manizales","Santa Marta","Cúcuta","Ibagué","Villavicencio"].map(c => (
              <span key={c} style={{ background:L["container-lowest"], borderRadius:16, padding:"5px 14px", fontSize:12, fontWeight:500, border:`1px solid ${L["outline-variant"]}` }}>{c}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ ...container, paddingBottom:40 }}>
          <div style={{ background:L.primary, borderRadius:12, padding:"32px 24px", textAlign:"center" }}>
            <h2 style={{ fontSize:22, fontWeight:600, margin:"0 0 6px", color:"#fff" }}>¿Listo para tasar tu propiedad?</h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", margin:"0 0 20px", lineHeight:1.5 }}>Obtén el valor real de mercado con datos actualizados al instante.</p>
            <button onClick={onStart} style={{ background:L.secondary, color:L["on-secondary"], border:"none", borderRadius:8, padding:"12px 28px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Comenzar Análisis Gratis</button>
          </div>
        </section>
      </main>

      <footer style={{ borderTop:`1px solid ${L["outline-variant"]}`, padding:"14px 0" }}>
        <div style={{ ...container, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:L["on-surface-variant"] }}>EstateAnalytix © 2025</span>
          <span style={{ fontSize:12, color:L["on-surface-variant"] }}>Hecho en 🇨🇴</span>
        </div>
      </footer>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || ""

const EF = {
  pais:"Colombia", ciudad:"", barrio:"", direccion:"", tipo:"",
  areaConstruida:"", areaTerreno:"", antiguedad:"", estado:"",
  remodelado:"no", remodelAnios:"", remodelAreas:[],
  topografia:"", frenteVia:"", servicios:[],
  dormitorios:2, banosC:1, banosS:0, acabados:"",
  altBodega:"", muellesT:"",
  piscina:false, gimnasio:false, salon:false, parque:false, sauna:false,
  ascensor:false, plantaElec:"", seguridad:"", adminM:"",
  parqueaderos:0, parqT:"", parqAsig:"",
  precioRef:"", notas:"",
  lat:null, lng:null,
}

export default function App() {
  const [view, setView]       = useState("landing")
  const [phase, setPhase]     = useState(1)
  const [form, setForm]       = useState({...EF})
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [saved, setSaved]     = useState(false)
  const [session, setSession] = useState(null)
  const [user, setUser]       = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) { setSession(s); setUser(s.user) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s); setUser(s?.user || null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const PHASES = [
    <P1 f={form} s={setForm}/>, <P2 f={form} s={setForm}/>, <P3 f={form} s={setForm}/>,
    <P4 f={form} s={setForm}/>, <P5 f={form} s={setForm}/>, <P7 f={form} s={setForm}/>,
  ]

  const next = async () => {
    if (phase < 6) { setPhase(p => p+1); return }
    setLoading(true); setError(null); setSaved(false)
    try {
      // 1. Llamar a Claude AI
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData: form }),
      })
      if (!res.ok) throw new Error("Error del servidor")
      const data = await res.json()
      setResult(data)

      // 2. Guardar en Supabase (en background)
      fetch(`${API_BASE}/api/save-analysis`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData: form, result: data, userId: user?.id }),
      }).then(r => r.ok && setSaved(true)).catch(console.warn)

    } catch(e) {
      setError("Error al generar el análisis. Por favor intenta de nuevo.")
    } finally { setLoading(false) }
  }

  const reset = () => { setPhase(1); setForm({...EF}); setResult(null); setError(null); setSaved(false) }

  const startAnalysis = () => { setView("analysis"); setPhase(1) }

  const handleAuthSuccess = () => {
    const u = user
    if (u?.user_metadata?.company_name) {
      setView("dashboard")
    } else {
      setView("onboarding")
    }
  }

  const handleOnboardingComplete = () => setView("dashboard")

  if (view === "landing") return <LandingPage onStart={() => setView("auth")}/>
  if (view === "auth") return <AuthPage onAuthSuccess={handleAuthSuccess}/>
  if (view === "onboarding") return <OnboardingPage user={user} onComplete={handleOnboardingComplete}/>
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView("auth")
  }

  if (view === "dashboard") return <DashboardPage user={user} onNewAnalysis={startAnalysis} onLogout={handleLogout}/>

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
                <div style={{ fontSize:17, fontWeight:800, color:C.white, lineHeight:1, letterSpacing:-.5 }}>Análisis Comparativo de Mercado</div>
                <div style={{ fontSize:10, color:C.green, letterSpacing:2, textTransform:"uppercase" }}>Propertia Realty · ACM Profesional</div>
              </div>
            </div>
            {!result && !loading && (
              <div style={{ fontSize:11.5, color:C.gray, background:C.bg2, padding:"5px 14px", borderRadius:20, border:`1px solid ${C.border}` }}>Fase {phase} / 6</div>
            )}
          </div>

          {error && <div style={{ background:"#FF444415", border:"1px solid #FF444440", borderRadius:12, padding:"12px 16px", marginBottom:16, color:C.red, fontSize:13 }}>⚠️ {error}</div>}

          {loading && <Card><Loading/></Card>}
          {result && !loading && <Results form={form} result={result} onReset={reset} saved={saved} user={user} onDashboard={() => { setView("dashboard"); setResult(null) }}/>}

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
                    {phase===6 ? "✦ Generar Análisis con IA" : "Continuar →"}
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
