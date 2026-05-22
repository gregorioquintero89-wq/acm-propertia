export const C: Record<string, string> = {
  bg: "#0A0A0A", bg2: "#111111", bg3: "#1A1A1A",
  border: "#222222", green: "#00D084", greenD: "#00A868",
  greenGlow: "rgba(0,208,132,0.15)", white: "#FFFFFF",
  gray: "#888888", grayL: "#AAAAAA", red: "#FF4444", gold: "#F5C842",
}

export const PAISES = [
  { v: "Colombia", l: "🇨🇴 Colombia" }, { v: "México", l: "🇲🇽 México" },
  { v: "Argentina", l: "🇦🇷 Argentina" }, { v: "Chile", l: "🇨🇱 Chile" },
  { v: "Perú", l: "🇵🇪 Perú" }, { v: "Ecuador", l: "🇪🇨 Ecuador" },
  { v: "Uruguay", l: "🇺🇾 Uruguay" }, { v: "Panamá", l: "🇵🇦 Panamá" },
]

export const CIUDADES_POR_PAIS: Record<string, string[]> = {
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales"],
  "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancún", "Querétaro", "Mérida", "León", "San Luis Potosí"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata", "Tucumán", "Salta", "Santa Fe", "Neuquén"],
  "Chile": ["Santiago", "Viña del Mar", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Iquique", "Puerto Montt"],
  "Perú": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Cusco", "Iquitos", "Piura", "Huancayo", "Tacna", "Pucallpa"],
  "Ecuador": ["Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Santo Domingo", "Machala", "Portoviejo", "Loja", "Ibarra"],
  "Uruguay": ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó", "Melo", "Mercedes"],
  "Panamá": ["Ciudad de Panamá", "San Miguelito", "Arraiján", "La Chorrera", "Colón", "David", "Santiago", "Chitré", "Penonomé", "Las Tablas"],
}

export const TIPOS_PROPIEDAD = [
  { v: "Apartamento", l: "🏢 Apartamento" }, { v: "Apartaestudio", l: "🏠 Apartaestudio" },
  { v: "Casa", l: "🏡 Casa" }, { v: "Casa en condominio", l: "🏘️ Casa en condominio" },
  { v: "Penthouse", l: "✨ Penthouse / PH" }, { v: "Lote urbano", l: "📐 Lote urbano" },
  { v: "Lote en condominio", l: "🏗️ Lote en condominio" }, { v: "Lote industrial", l: "🏭 Lote industrial" },
  { v: "Finca", l: "🌿 Finca / Lote rural" }, { v: "Local comercial", l: "🏪 Local comercial" },
  { v: "Oficina", l: "💼 Oficina" }, { v: "Consultorio", l: "🩺 Consultorio" },
  { v: "Hotel", l: "🏨 Hotel / Hostal" }, { v: "Bodega", l: "📦 Bodega / Industrial" },
]

export const TIPO_GRUPO: Record<string, string> = {
  "Apartamento": "residencial", "Apartaestudio": "residencial", "Casa": "residencial",
  "Casa en condominio": "residencial", "Penthouse": "residencial", "Local comercial": "comercial",
  "Oficina": "comercial", "Hotel": "comercial", "Consultorio": "comercial",
  "Bodega": "industrial", "Lote urbano": "terreno", "Lote en condominio": "terreno",
  "Lote industrial": "terreno", "Finca": "terreno",
}

export const PAIS_CODE: Record<string, string> = {
  "Colombia": "co", "México": "mx", "Argentina": "ar", "Chile": "cl",
  "Perú": "pe", "Ecuador": "ec", "Uruguay": "uy", "Panamá": "pa",
}

export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1A1A1A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#AAAAAA" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#222222" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2A2A2A" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#777777" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#252525" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D1B1A" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1E1E1E" }] },
]

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ""

export const INITIAL_FORM_STATE = {
  pais: "Colombia", ciudad: "", barrio: "", direccion: "", tipo: "",
  areaConstruida: "", areaTerreno: "", antiguedad: "", estado: "",
  remodelado: "no", remodelAnios: "", remodelAreas: [],
  topografia: "", frenteVia: "", servicios: [],
  dormitorios: 2, banosC: 1, banosS: 0, acabados: "",
  altBodega: "", muellesT: "",
  piscina: false, gimnasio: false, salon: false, parque: false, sauna: false,
  ascensor: false, plantaElec: "", seguridad: "", adminM: "",
  parqueaderos: 0, parqT: "", parqAsig: "",
  precioRef: "", notas: "", lat: null, lng: null,
}
