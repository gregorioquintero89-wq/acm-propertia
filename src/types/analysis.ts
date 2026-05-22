export interface AnalysisForm {
  pais: string
  ciudad: string
  barrio: string
  direccion: string
  tipo: string
  areaConstruida: string
  areaTerreno: string
  antiguedad: string
  estado: string
  remodelado: "si" | "no"
  remodelAnios: string
  remodelAreas: string[]
  topografia: string
  frenteVia: string
  servicios: string[]
  dormitorios: number
  banosC: number
  banosS: number
  acabados: string
  altBodega: string
  muellesT: string
  piscina: boolean
  gimnasio: boolean
  salon: boolean
  parque: boolean
  sauna: boolean
  ascensor: boolean
  plantaElec: string
  seguridad: string
  adminM: string
  parqueaderos: number
  parqT: string
  parqAsig: string
  precioRef: string
  notas: string
  lat: number | null
  lng: number | null
}

export interface Comparable {
  nombre: string
  zona: string
  area: number
  precio: number
  dormitorios: number
  banos: number
  antiguedad: number
  estado: string
}

export interface AnalysisResult {
  precio_oportunidad: number
  precio_mercado: number
  precio_aspiracion: number
  precio_m2_base: number
  resumen_ejecutivo: string
  factores?: Array<{ factor: string; impacto: string; descripcion?: string; positivo: boolean }>
  recomendaciones?: {
    precio_inicial: string
    estrategia: string
    atributos: string
    objeciones: string
  }
  comparables?: Comparable[]
  tendencia?: Array<{ mes: string; precio: number }>
  zonas_precio?: Array<{ zona: string; precio: number }>
  plazo_oportunidad?: string
  plazo_mercado?: string
  plazo_aspiracion?: string
  _meta?: {
    fuentes?: string
    comparables_fresh?: number
    comparables_db?: number
    precio_m2_real?: number
  }
}

export type PhaseProps = { f: AnalysisForm; s: React.Dispatch<React.SetStateAction<AnalysisForm>> }
export type AppView = "landing" | "auth" | "onboarding" | "dashboard" | "analysis"
