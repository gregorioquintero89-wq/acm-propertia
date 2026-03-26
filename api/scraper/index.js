/**
 * Scraper Combinado — ACM Propertia
 * Orquesta FincaRaiz + MetroCuadrado, deduplicando y priorizando calidad.
 *
 * Uso:
 *   import { scrapeComparables } from './api/scraper/index.js'
 *   const comparables = await scrapeComparables({ ciudad, barrio, tipo, estrato, area })
 */

import { scrapeFincaRaiz }     from "./fincaraiz.js"
import { scrapeMetroCuadrado } from "./metrocuadrado.js"

/**
 * Obtiene comparables reales de múltiples portales
 * @param {object} params
 * @param {string} params.ciudad
 * @param {string} params.barrio
 * @param {string} params.tipo
 * @param {number} [params.estrato]
 * @param {number} [params.area]       - m² construidos
 * @param {number} [params.maxResults] - límite de resultados (default 10)
 * @returns {Promise<Array>} comparables normalizados y deduplicados
 */
export async function scrapeComparables({ ciudad, barrio, tipo, estrato, area, maxResults = 10 }) {
  console.log(`[Scraper] Buscando comparables: ${tipo} en ${barrio}, ${ciudad}`)

  // Ejecutar ambos scrapers en paralelo para mayor velocidad
  const [fincaraizResults, metrocuadradoResults] = await Promise.allSettled([
    scrapeFincaRaiz({ ciudad, barrio, tipo, estrato, area }),
    scrapeMetroCuadrado({ ciudad, barrio, tipo, estrato, area }),
  ])

  const fromFR = fincaraizResults.status  === "fulfilled" ? fincaraizResults.value  : []
  const fromMC = metrocuadradoResults.status === "fulfilled" ? metrocuadradoResults.value : []

  // Log de resultados por fuente
  console.log(`[Scraper] FincaRaiz: ${fromFR.length} | MetroCuadrado: ${fromMC.length}`)

  // Combinar y deduplicar (por precio_m2 similar ± 5%)
  const combined = [...fromFR, ...fromMC]
  const deduped  = deduplicateByPrice(combined)

  // Ordenar por relevancia (con estrato más cercano primero)
  const sorted = sortByRelevance(deduped, { estrato, area })

  const result = sorted.slice(0, maxResults)
  console.log(`[Scraper] Total final: ${result.length} comparables`)

  return result
}

/**
 * Resumen estadístico para incluir en el prompt de Claude
 */
export function summarizeComparables(comparables) {
  if (!comparables.length) return null

  const precios = comparables.map(c => c.precio_m2).filter(Boolean)
  const preciosMercado = comparables.map(c => c.precio_mercado).filter(Boolean)

  const avg     = arr => arr.reduce((a, b) => a + b, 0) / arr.length
  const median  = arr => { const s = [...arr].sort((a,b)=>a-b); const m = Math.floor(s.length/2); return s.length%2 ? s[m] : (s[m-1]+s[m])/2 }
  const min     = arr => Math.min(...arr)
  const max     = arr => Math.max(...arr)

  return {
    cantidad:       comparables.length,
    precio_m2_avg:  Math.round(avg(precios)),
    precio_m2_med:  Math.round(median(precios)),
    precio_m2_min:  Math.round(min(precios)),
    precio_m2_max:  Math.round(max(precios)),
    precio_avg:     Math.round(avg(preciosMercado)),
    fuentes:        [...new Set(comparables.map(c => c.fuente))].join(", "),
    items:          comparables.slice(0, 5).map(c => ({
      area:      c.area,
      precio:    c.precio_mercado,
      precio_m2: c.precio_m2,
      barrio:    c.barrio,
      dorms:     c.dormitorios,
      banos:     c.banos,
      fuente:    c.fuente,
    }))
  }
}

// ── Helpers internos ───────────────────────────────────────────────────────

function deduplicateByPrice(comparables) {
  const seen = []
  return comparables.filter(comp => {
    const isDup = seen.some(s => {
      const diff = Math.abs(s.precio_m2 - comp.precio_m2) / s.precio_m2
      return diff < 0.05 && Math.abs((s.area || 0) - (comp.area || 0)) < 5
    })
    if (!isDup) seen.push(comp)
    return !isDup
  })
}

function sortByRelevance(comparables, { estrato, area }) {
  return [...comparables].sort((a, b) => {
    let scoreA = 0, scoreB = 0

    // Premio por estrato similar
    if (estrato) {
      if (a.estrato === estrato) scoreA += 3
      if (b.estrato === estrato) scoreB += 3
      if (a.estrato && Math.abs(a.estrato - estrato) === 1) scoreA += 1
      if (b.estrato && Math.abs(b.estrato - estrato) === 1) scoreB += 1
    }

    // Premio por área similar
    if (area && a.area && b.area) {
      const ratioA = Math.abs(a.area - area) / area
      const ratioB = Math.abs(b.area - area) / area
      if (ratioA < 0.15) scoreA += 2
      if (ratioB < 0.15) scoreB += 2
    }

    // Premio por fuente confiable
    if (a.fuente === "fincaraiz") scoreA += 1
    if (b.fuente === "fincaraiz") scoreB += 1

    return scoreB - scoreA
  })
}
