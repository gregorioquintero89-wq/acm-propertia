/**
 * FincaRaiz Scraper — ACM Propertia
 * Extrae comparables reales de fincaraiz.com.co
 *
 * En Railway: usa Playwright (Chromium real, sin bloqueos, sin límite de tiempo)
 * En Vercel:  usa ScraperAPI como fallback (si SCRAPERAPI_KEY está disponible)
 *
 * Path de datos confirmado:
 *   __NEXT_DATA__ → props.pageProps.fetchResult.searchFast.data
 *   precio → item.price.amount
 *   área   → item.m2Built || item.m2apto || item.m2
 */

const BASE_URL        = "https://fincaraiz.com.co"
const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY
const USE_PLAYWRIGHT  = process.env.USE_PLAYWRIGHT === "true"

const TIPO_SLUG = {
  Apartamento:    "apartamentos",
  Casa:           "casas",
  Oficina:        "oficinas",
  Local:          "locales-comerciales",
  Bodega:         "bodegas",
  Lote:           "lotes",
  "Casa-Lote":    "casas-lotes",
  Finca:          "fincas",
  Penthouse:      "apartamentos",
  Apartaestudio:  "apartamentos",
}

const CIUDAD_SLUG = {
  "Bogotá":        "bogota",
  "Medellín":      "medellin",
  "Cali":          "cali",
  "Barranquilla":  "barranquilla",
  "Cartagena":     "cartagena",
  "Bucaramanga":   "bucaramanga",
  "Pereira":       "pereira",
  "Manizales":     "manizales",
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "es-CO,es;q=0.9",
}

export async function scrapeFincaRaiz({ ciudad, barrio, tipo, area }) {
  const ciudadSlug = CIUDAD_SLUG[ciudad] || slugify(ciudad)
  const tipoSlug   = TIPO_SLUG[tipo] || "inmuebles"
  const barrioSlug = slugify(barrio)
  const searchUrl  = `${BASE_URL}/${tipoSlug}/venta/${ciudadSlug}/${barrioSlug}/`
  const fallbackUrl = `${BASE_URL}/${tipoSlug}/venta/${ciudadSlug}/`

  const modo = USE_PLAYWRIGHT ? "Playwright" : SCRAPER_API_KEY ? "ScraperAPI" : "directo"
  console.log(`[FincaRaiz] ${modo}: ${searchUrl}`)

  try {
    const html = await fetchHtml(searchUrl)
    const listings = extractListings(html, ciudad, barrio, tipo, area)
    if (listings.length > 0) {
      console.log(`[FincaRaiz] ${listings.length} comparables en ${barrio}, ${ciudad}`)
      return listings
    }
    // Fallback sin barrio
    const html2 = await fetchHtml(fallbackUrl)
    return extractListings(html2, ciudad, barrio, tipo, area)
  } catch (err) {
    console.error(`[FincaRaiz] Error ${ciudad}/${barrio}:`, err.message)
    return []
  }
}

// ── Extracción ─────────────────────────────────────────────────────────────

function extractListings(html, ciudad, barrio, tipo, area) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return []

  try {
    const data    = JSON.parse(match[1])
    const results = data?.props?.pageProps?.fetchResult?.searchFast?.data || []
    return results
      .slice(0, 12)
      .map(item => normalizeFincaRaizItem(item, ciudad, barrio, tipo))
      .filter(c => c && isReasonable(c, area))
  } catch (e) {
    console.error("[FincaRaiz] Error parseando __NEXT_DATA__:", e.message)
    return []
  }
}

function normalizeFincaRaizItem(item, ciudad, barrio, tipo) {
  const price   = item?.price?.amount || null
  const areaVal = item?.m2Built || item?.m2apto || item?.m2 || null

  if (!price || !areaVal || price < 10_000_000 || areaVal < 10) return null

  const precioM2 = Math.round(price / areaVal)
  if (precioM2 < 500_000 || precioM2 > 30_000_000) return null

  return {
    ciudad,
    barrio:         item?.locations?.[0]?.name || item?.address?.split(",")?.[0] || barrio,
    tipo,
    estrato:        item?.stratum || null,
    area:           parseFloat(areaVal),
    dormitorios:    item?.bedrooms || item?.rooms || null,
    banos:          item?.bathrooms || null,
    precio_mercado: Math.round(price),
    precio_m2:      precioM2,
    estado:         "Bueno",
    fuente:         "fincaraiz",
  }
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

async function fetchHtml(url) {
  // Railway con Playwright (import dinámico para no romper Vercel)
  if (USE_PLAYWRIGHT) {
    const { fetchWithBrowser } = await import("./browser.js")
    return fetchWithBrowser(url)
  }

  // Vercel con ScraperAPI
  if (SCRAPER_API_KEY) {
    const params = new URLSearchParams({
      api_key: SCRAPER_API_KEY, url,
      render: "false", country_code: "co",
    })
    return fetchRaw(`https://api.scraperapi.com?${params}`)
  }

  // Directo (puede ser bloqueado)
  return fetchRaw(url, { headers: HEADERS })
}

async function fetchRaw(url, options = {}, timeoutMs = 30000) {
  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

function isReasonable(comp, targetArea) {
  if (!targetArea) return true
  const ratio = comp.area / targetArea
  return ratio >= 0.5 && ratio <= 1.5
}

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}
