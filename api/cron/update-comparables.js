/**
 * Vercel Cron Job — Actualizar Comparables de Mercado
 * ACM Propertia
 *
 * Corre diariamente (configurado en vercel.json).
 * Scrapa FincaRaiz + MetroCuadrado para las combinaciones más comunes
 * de ciudad/barrio/tipo y los guarda en Supabase tabla `comparables`.
 *
 * Solo corre si el header Authorization incluye CRON_SECRET.
 * Vercel lo inyecta automáticamente en crons programados.
 *
 * Para correr manualmente:
 *   curl -X GET https://acm-propertia.vercel.app/api/cron/update-comparables \
 *     -H "Authorization: Bearer TU_CRON_SECRET"
 */

import { createClient } from "@supabase/supabase-js"
import { scrapeComparables } from "../scraper/index.js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Combinaciones que se actualizan diariamente
// Priorizar los mercados más activos del portafolio Propertia
const MERCADOS = [
  // Cali — principal mercado
  { ciudad: "Cali", barrio: "Granada",          tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "El Ingenio",       tipo: "Casa" },
  { ciudad: "Cali", barrio: "Ciudad Jardín",    tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "San Fernando",     tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "Valle del Lili",   tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "Bochalema",        tipo: "Casa" },
  { ciudad: "Cali", barrio: "Alfaguara",        tipo: "Casa" },
  { ciudad: "Cali", barrio: "Pance",            tipo: "Casa" },
  { ciudad: "Cali", barrio: "La Flora",         tipo: "Casa" },
  { ciudad: "Cali", barrio: "Santa Teresita",   tipo: "Apartamento" },
  // Bogotá
  { ciudad: "Bogotá", barrio: "Chapinero",      tipo: "Apartamento" },
  { ciudad: "Bogotá", barrio: "Usaquén",        tipo: "Casa" },
  { ciudad: "Bogotá", barrio: "Rosales",        tipo: "Apartamento" },
  // Medellín
  { ciudad: "Medellín", barrio: "El Poblado",   tipo: "Apartamento" },
  { ciudad: "Medellín", barrio: "Laureles",     tipo: "Casa" },
]

// Delay entre scrapers para no sobrecargar los portales
const DELAY_MS = 3000

export default async function handler(req, res) {
  // Verificar autenticación del cron
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const startTime = Date.now()
  const results   = { success: 0, failed: 0, inserted: 0, errors: [] }

  console.log(`[Cron] Iniciando actualización de comparables — ${new Date().toISOString()}`)
  console.log(`[Cron] Mercados a procesar: ${MERCADOS.length}`)

  for (const mercado of MERCADOS) {
    try {
      // Scraping de portales
      const comparables = await scrapeComparables({
        ciudad:     mercado.ciudad,
        barrio:     mercado.barrio,
        tipo:       mercado.tipo,
        maxResults: 8,
      })

      if (comparables.length === 0) {
        console.log(`[Cron] Sin resultados: ${mercado.tipo} en ${mercado.barrio}, ${mercado.ciudad}`)
        results.failed++
        await sleep(DELAY_MS)
        continue
      }

      // Marcar los comparables con timestamp del scraping
      const toInsert = comparables.map(c => ({
        ...c,
        fuente: `${c.fuente}_cron`,
        // analisis_id null — son datos de mercado, no de un análisis específico
      }))

      // Upsert en Supabase (evitar duplicados exactos)
      const { data, error } = await supabase
        .from("comparables")
        .insert(toInsert)
        .select()

      if (error) {
        console.error(`[Cron] Error insertando ${mercado.barrio}:`, error.message)
        results.errors.push(`${mercado.barrio}: ${error.message}`)
        results.failed++
      } else {
        results.success++
        results.inserted += data?.length || 0
        console.log(`[Cron] ✅ ${mercado.tipo} · ${mercado.barrio}, ${mercado.ciudad} — ${data?.length || 0} registros`)
      }

      // Actualizar tendencias
      if (comparables.length > 0) {
        const precio_m2_avg = Math.round(
          comparables.reduce((s, c) => s + (c.precio_m2 || 0), 0) / comparables.length
        )

        await supabase.from("tendencias_zona").insert({
          ciudad:   mercado.ciudad,
          barrio:   mercado.barrio,
          tipo:     mercado.tipo,
          precio_m2: precio_m2_avg,
          mes:      new Date().toISOString().slice(0, 7),
        })
      }

    } catch (err) {
      console.error(`[Cron] Error en ${mercado.barrio}:`, err.message)
      results.errors.push(`${mercado.barrio}: ${err.message}`)
      results.failed++
    }

    // Delay cortés entre peticiones
    await sleep(DELAY_MS)
  }

  const duration = Math.round((Date.now() - startTime) / 1000)

  console.log(`[Cron] Completado en ${duration}s — Éxitos: ${results.success} | Errores: ${results.failed} | Registros: ${results.inserted}`)

  return res.status(200).json({
    ok: true,
    duration_s: duration,
    mercados_procesados: MERCADOS.length,
    ...results,
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
