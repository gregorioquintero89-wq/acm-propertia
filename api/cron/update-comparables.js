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

// Cada cron solo procesa un lote — rotamos diariamente para cubrir todos los mercados
// sin exceder el timeout de 60s de Vercel Hobby.
// El índice del lote se determina por el día del mes (mod cantidad de lotes).
const TODOS_LOS_MERCADOS = [
  // Lote 0 — Cali norte
  { ciudad: "Cali", barrio: "Granada",          tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "Santa Teresita",   tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "San Fernando",     tipo: "Apartamento" },
  // Lote 1 — Cali sur
  { ciudad: "Cali", barrio: "Ciudad Jardín",    tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "Valle del Lili",   tipo: "Apartamento" },
  { ciudad: "Cali", barrio: "El Ingenio",       tipo: "Casa" },
  // Lote 2 — Cali casas
  { ciudad: "Cali", barrio: "Bochalema",        tipo: "Casa" },
  { ciudad: "Cali", barrio: "Alfaguara",        tipo: "Casa" },
  { ciudad: "Cali", barrio: "Pance",            tipo: "Casa" },
  // Lote 3 — Bogotá y Medellín
  { ciudad: "Bogotá",   barrio: "Chapinero",    tipo: "Apartamento" },
  { ciudad: "Bogotá",   barrio: "Rosales",      tipo: "Apartamento" },
  { ciudad: "Medellín", barrio: "El Poblado",   tipo: "Apartamento" },
]

const LOTE_SIZE  = 3
const NUM_LOTES  = Math.ceil(TODOS_LOS_MERCADOS.length / LOTE_SIZE)
const loteIndex  = new Date().getDate() % NUM_LOTES
const MERCADOS   = TODOS_LOS_MERCADOS.slice(loteIndex * LOTE_SIZE, (loteIndex + 1) * LOTE_SIZE)

// Sin delay — ScraperAPI maneja el rate limiting internamente
const DELAY_MS = 500

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
        render:     true,   // Cron: ScraperAPI renderiza JS completo para máximos datos
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
