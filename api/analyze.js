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
        area:       parseFloat(formData.areaConstruida) || null,
        maxResults: 8,
        render:     false,
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
      model:      "claude-3-5-sonnet-latest",
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

  const pais = formData.pais || "Colombia"
  const moneda = {
    "Colombia": "COP", "México": "MXN", "Argentina": "ARS",
    "Chile": "CLP", "Perú": "PEN", "Ecuador": "USD",
    "Uruguay": "UYU", "Panamá": "USD"
  }[pais] || "USD"

  return `Eres un tasador inmobiliario experto con 20 años de experiencia en mercados de ${pais} y LATAM.
Genera un ACM (Análisis Comparativo de Mercado) profesional con datos PRECISOS para el mercado de ${pais}.
Usa precios en ${moneda}. Si el país no es Colombia, usa tu conocimiento actualizado del mercado inmobiliario local.
${comparablesSection}

PROPIEDAD A VALUAR:
- País: ${pais}
- Tipo: ${formData.tipo} en ${formData.barrio}, ${formData.ciudad}
- Área construida: ${formData.areaConstruida}m²${formData.areaTerreno ? ` / Terreno: ${formData.areaTerreno}m²` : ""}
- Antigüedad: ${formData.antiguedad} años · Estado: ${formData.estado}
- Remodelado: ${formData.remodelado === "si" ? `Sí (${formData.remodelAnios} años, áreas: ${(formData.remodelAreas||[]).join(", ")})` : "No"}
- ${formData.dormitorios||2} dormitorios · ${formData.banosC||1} baños completos · ${formData.banosS||0} baños sociales
- Acabados: ${formData.acabados||"estándar"}
${formData.topografia ? `- Topografía: ${formData.topografia}` : ""}
${formData.servicios?.length ? `- Servicios: ${formData.servicios.join(", ")}` : ""}
${formData.altBodega ? `- Altura bodega: ${formData.altBodega}` : ""}
- Piscina: ${formData.piscina?"Sí":"No"} · Gimnasio: ${formData.gimnasio?"Sí":"No"} · Salón social: ${formData.salon?"Sí":"No"} · Sauna: ${formData.sauna?"Sí":"No"} · Ascensor: ${formData.ascensor?"Sí":"No"}
- Seguridad: ${formData.seguridad||"Sin seguridad"}${formData.adminM ? ` · Administración: $${parseInt(formData.adminM).toLocaleString("es-CO")}/mes` : ""}
- Parqueaderos: ${formData.parqueaderos||0}${formData.parqT?` (${formData.parqT})`:""}
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
  "precio_oportunidad": número (precio inmediato, cierre < 30 días, -12% a -18%),
  "precio_mercado": número (precio de mercado, venta en 1-6 meses),
  "precio_aspiracion": número (precio óptimo máximo, +10% a +20%, venta lenta),
  "comparables": [
    {"nombre":"string","zona":"string","area":número,"precio":número,"dormitorios":número,"banos":número,"antiguedad":número,"estado":"Excelente|Bueno|Regular"}
  ],
  "factores": [
    {"factor":"string","impacto":"string","positivo":boolean,"descripcion":"string"}
  ],
  "tendencia": [{"mes":"string","precio":número}],
  "zonas_precio": [{"zona":"string","precio":número}],
  "recomendaciones": {
    "precio_inicial":"string (qué precio publicar primero y por qué)",
    "estrategia":"string (estrategia de negociación y cierre — NO mencionar portales inmobiliarios ni FincaRaiz ni MetroCuadrado)",
    "atributos":"string (atributos clave a destacar en la promoción)",
    "objeciones":"string (cómo manejar objeciones comunes de compradores)"
  },
  "plazo_oportunidad":"string",
  "plazo_mercado":"string",
  "plazo_aspiracion":"string"
}
Exactamente: 5 comparables, 6 factores, 12 meses en tendencia, 6 zonas.`
}
