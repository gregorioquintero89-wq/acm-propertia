/**
 * API Handler — Análisis Comparativo de Mercado (ACM)
 * ACM Propertia
 *
 * Flujo:
 * 1. Consultar Supabase: ¿hay comparables reales guardados para este mercado?
 * 2. Si hay < 3 comparables en DB → scraping en tiempo real (FincaRaiz + MetroCuadrado)
 * 3. Pasar datos reales + datos del formulario a Claude (claude-sonnet-4-6)
 * 4. Claude genera análisis estructurado usando comparables reales como base
 */

import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import { scrapeComparables, summarizeComparables } from "./scraper/index.js"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { formData } = req.body
  if (!formData) return res.status(400).json({ error: "Faltan datos" })

  try {
    // ── 1. Buscar comparables en Supabase (datos históricos del cron) ────────
    let dbComparables = []
    const { data: dbData } = await supabase
      .from("comparables")
      .select("*")
      .eq("ciudad", formData.ciudad)
      .eq("tipo", formData.tipo)
      .or(`barrio.ilike.%${formData.barrio}%`)
      .order("created_at", { ascending: false })
      .limit(15)

    if (dbData?.length) {
      dbComparables = dbData
      console.log(`[Analyze] DB cache: ${dbComparables.length} comparables para ${formData.barrio}`)
    }

    // ── 2. Si hay pocos datos en DB → scraping en tiempo real ──────────────
    let freshComparables = []
    if (dbComparables.length < 3) {
      console.log(`[Analyze] Scraping en tiempo real para ${formData.barrio}, ${formData.ciudad}`)
      freshComparables = await scrapeComparables({
        ciudad:     formData.ciudad,
        barrio:     formData.barrio,
        tipo:       formData.tipo,
        estrato:    formData.estrato,
        area:       parseFloat(formData.areaConstruida) || null,
        maxResults: 8,
      })
      console.log(`[Analyze] Scraped en tiempo real: ${freshComparables.length}`)
    }

    // Combinar: comparables frescos primero, luego los de DB
    const allComparables = [...freshComparables, ...dbComparables]
    const summary        = summarizeComparables(allComparables)

    // ── 3. Construir prompt para Claude ────────────────────────────────────
    const prompt = buildPrompt(formData, summary)

    // ── 4. Llamar a Claude ─────────────────────────────────────────────────
    console.log(`[Analyze] Llamando a Claude con ${allComparables.length} comparables reales`)

    const message = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 2500,
      messages:   [{ role: "user", content: prompt }],
    })

    const rawText    = message.content[0]?.text || ""
    const cleanText  = rawText.replace(/```json|```/g, "").trim()
    const result     = JSON.parse(cleanText)

    // Adjuntar metadata de scraping para transparencia en el frontend
    result._meta = {
      comparables_db:    dbComparables.length,
      comparables_fresh: freshComparables.length,
      precio_m2_real:    summary?.precio_m2_avg || null,
      fuentes:           summary?.fuentes || "claude_knowledge",
    }

    // Guardar comparables frescos en DB para el próximo análisis
    if (freshComparables.length > 0) {
      await supabase.from("comparables").insert(
        freshComparables.map(c => ({ ...c, fuente: `${c.fuente}_realtime` }))
      ).then(({ error }) => {
        if (error) console.warn("[Analyze] No se pudieron guardar comparables frescos:", error.message)
      })
    }

    return res.status(200).json(result)

  } catch (error) {
    console.error("[Analyze] Error:", error)

    // Si el error es de parseo JSON, devolver el texto crudo para debug
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: "Error parseando respuesta de Claude. Intenta de nuevo.",
        debug: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }

    return res.status(500).json({ error: "Error al generar el análisis. Intenta de nuevo." })
  }
}

// ── Construcción del prompt ────────────────────────────────────────────────

function buildPrompt(formData, comparablesData) {
  const comparablesSection = comparablesData
    ? `
COMPARABLES REALES DEL MERCADO (obtenidos de FincaRaiz y MetroCuadrado):
- Cantidad encontrada: ${comparablesData.cantidad} propiedades similares
- Precio/m² promedio: $${comparablesData.precio_m2_avg?.toLocaleString("es-CO")} COP
- Precio/m² mediana: $${comparablesData.precio_m2_med?.toLocaleString("es-CO")} COP
- Rango precio/m²: $${comparablesData.precio_m2_min?.toLocaleString("es-CO")} — $${comparablesData.precio_m2_max?.toLocaleString("es-CO")} COP
- Fuentes: ${comparablesData.fuentes}
- Muestra de propiedades comparables reales:
${comparablesData.items.map((c, i) =>
  `  ${i+1}. ${c.area}m² | $${c.precio?.toLocaleString("es-CO")} | $${c.precio_m2?.toLocaleString("es-CO")}/m² | ${c.dorms || "?"}d/${c.banos || "?"}b | ${c.barrio} | Fuente: ${c.fuente}`
).join("\n")}

USA ESTOS DATOS REALES como base principal para calcular el precio. No los ignores.`
    : `
NOTA: No se encontraron comparables en tiempo real. Usa tu conocimiento actualizado del mercado colombiano 2024-2025 para estimar precios, siendo conservador.`

  return `Eres un tasador inmobiliario colombiano experto con 20 años de experiencia en Cali, Bogotá y Medellín.
Genera un ACM (Análisis Comparativo de Mercado) profesional con datos PRECISOS.
${comparablesSection}

PROPIEDAD A VALUAR:
- Tipo: ${formData.tipo} en ${formData.barrio}, ${formData.ciudad} · Estrato ${formData.estrato}
- Área construida: ${formData.areaConstruida}m²${formData.areaTerreno ? ` / Terreno: ${formData.areaTerreno}m²` : ""}
- Antigüedad: ${formData.antiguedad} años · Estado: ${formData.estado}
- Remodelado: ${formData.remodelado === "si" ? `Sí (${formData.remodelAnios} años, áreas: ${(formData.remodelAreas||[]).join(", ")})` : "No"}
- ${formData.dormitorios||2} dormitorios · ${formData.banosC||1} baños completos · ${formData.banosS||0} baños sociales
- Acabados: ${formData.acabados||"estándar"} · Cocina: ${formData.cocina||"N/A"} · Altura techos: ${formData.altTechos||"estándar"}
- Balcón: ${formData.balcon ? `Sí (${formData.balconM2}m²)` : "No"} · Sótano: ${formData.sotano?"Sí":"No"}
- Piscina: ${formData.piscina ? `Sí (${formData.piscinaT||""})` : "No"} · Gimnasio: ${formData.gimnasio?"Sí":"No"} · Salón social: ${formData.salon?"Sí":"No"} · Sauna: ${formData.sauna?"Sí":"No"} · Ascensor: ${formData.ascensor?"Sí":"No"}
- Seguridad: ${(formData.seguridad||[]).join(", ")||"básica"} · Administración: ${formData.adminM ? `$${parseInt(formData.adminM).toLocaleString("es-CO")}/mes` : "N/A"}
- Parqueaderos: ${formData.parqueaderos||0}${formData.parqT?` (${formData.parqT})`:""}
- Vista: ${formData.vista||"N/A"} (calidad: ${formData.calidadV||"N/A"}) · Orientación: ${formData.orientacion||"N/A"}
- Proximidad: Restaurantes: ${formData.proxGastro||"N/A"} · Comercio: ${formData.proxComercio||"N/A"} · Transporte: ${formData.proxTransp||"N/A"}
- Zona: ${formData.zonaEst||"N/A"} · Plazo deseado de venta: ${formData.plazo||"N/A"}
${formData.precioRef ? `- Precio referencia del propietario: $${parseInt(formData.precioRef).toLocaleString("es-CO")} COP` : ""}
${formData.notas ? `- Notas adicionales: ${formData.notas}` : ""}

INSTRUCCIONES:
- El precio_m2_base DEBE estar basado en los comparables reales proporcionados arriba (si los hay)
- Ajusta según las características específicas de esta propiedad vs los comparables
- Los "comparables" en el JSON deben incluir los comparables reales que recibiste, no inventados
- Sé específico en los factores: menciona qué comparables justifican el ajuste
- Responde ÚNICAMENTE con JSON válido (sin markdown, sin texto antes o después)

JSON a devolver:
{
  "resumen_ejecutivo": "2-3 oraciones sobre la propiedad y el mercado actual con datos concretos",
  "precio_m2_base": número (basado en comparables reales),
  "precio_oportunidad": número (precio bajo para venta rápida, -10% a -15%),
  "precio_mercado": número (precio justo de mercado),
  "precio_aspiracion": número (precio alto, +10% a +20%),
  "comparables": [
    {"nombre":"string","zona":"string","area":número,"precio":número,"dormitorios":número,"banos":número,"antiguedad":número,"estado":"Excelente|Bueno|Regular"}
  ],
  "factores": [
    {"factor":"string","impacto":"string","positivo":boolean,"descripcion":"string"}
  ],
  "tendencia": [{"mes":"string","precio":número}],
  "zonas_precio": [{"zona":"string","precio":número}],
  "recomendaciones": {
    "precio_inicial":"string",
    "estrategia":"string",
    "atributos":"string",
    "objeciones":"string"
  },
  "plazo_oportunidad":"string",
  "plazo_mercado":"string",
  "plazo_aspiracion":"string"
}
Exactamente: 5 comparables, 6 factores, 12 meses en tendencia, 6 zonas.`
}
