/**
 * MetroCuadrado Scraper — ACM Propertia
 *
 * En Railway: Playwright (Chromium real)
 * En Vercel:  ScraperAPI o fetch directo
 *
 * Estrategia:
 * 1. REST API JSON: GET /rest-search/search (si responde)
 * 2. HTML scraping con __NEXT_DATA__ como fallback
 */

const BASE_URL        = "https://www.metrocuadrado.com"
const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY
const USE_PLAYWRIGHT  = process.env.USE_PLAYWRIGHT === "true"

const TIPO_MC = {
  Apartamento:   "Apartamento",
  Casa:          "Casa",
  Oficina:       "Oficina",
  Local:         "Local comercial",
  Bodega:        "Bodega",
  Lote:          "Lote",
  "Casa-Lote":   "Casa",
  Finca:         "Finca",
  Penthouse:     "Apartamento",
  Apartaestudio: "Apartamento",
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/html, */*",
  "Accept-Language": "es-CO,es;q=0.9",
  Referer: "https://www.metrocuadrado.com/",
}

export async function scrapeMetroCuadrado({ ciudad, barrio, tipo, area }) {
  const tipoMC = TIPO_MC[tipo] || tipo

  // ── Intento 1: REST API (JSON directo, no necesita JS) ─────────────────
  try {
    const params = new URLSearchParams({
      realEstateTypeList: tipoMC, realEstateBusinessList: "Venta",
      city: ciudad, rows: "20", from: "0",
    })
    const apiUrl = `${BASE_URL}/rest-search/search?${params}`
    const data = await fetchJson(apiUrl)
    const results = data?.results || data?.listings || data?.data || []

    if (results.length > 0) {
      const listings = results.slice(0, 12)
        .map(item => normalizeMCItem(item, ciudad, barrio, tipo, area))
        .filter(Boolean)
      if (listings.length > 0) {
        console.log(`[MetroCuadrado] REST API: ${listings.length} comparables`)
        return listings
      }
    }
  } catch (err) {
    console.warn(`[MetroCuadrado] REST API falló: ${err.message}`)
  }

  // ── Intento 2: HTML scraping ──────────────────────────────────────────
  try {
    const htmlUrl = `${BASE_URL}/inmuebles/venta/${slugify(tipoMC)}/${slugify(ciudad)}/${slugify(barrio)}/`
    console.log(`[MetroCuadrado] HTML: ${htmlUrl}`)
    const html = await fetchHtml(htmlUrl)
    return extractFromHTML(html, ciudad, barrio, tipo, area)
  } catch (err2) {
    console.error(`[MetroCuadrado] Ambos métodos fallaron ${ciudad}/${barrio}: ${err2.message}`)
    return []
  }
}

// ── Normalización ──────────────────────────────────────────────────────────

function normalizeMCItem(item, ciudad, barrio, tipo, targetArea) {
  const price   = item?.salePrice || item?.price || null
  const areaVal = item?.area || item?.builtArea || null

  if (!price || !areaVal || price < 10_000_000 || areaVal < 10) return null

  const precioM2 = Math.round(price / areaVal)
  if (precioM2 < 500_000 || precioM2 > 30_000_000) return null

  if (targetArea) {
    const ratio = areaVal / targetArea
    if (ratio < 0.5 || ratio > 1.5) return null
  }

  return {
    ciudad: item?.city || ciudad,
    barrio: item?.neighborhood || item?.sector || barrio,
    tipo,
    estrato:        item?.stratum || null,
    area:           parseFloat(areaVal),
    dormitorios:    item?.rooms || item?.bedrooms || null,
    banos:          item?.bathrooms || null,
    precio_mercado: Math.round(price),
    precio_m2:      precioM2,
    estado:         "Bueno",
    fuente:         "metrocuadrado",
  }
}

function extractFromHTML(html, ciudad, barrio, tipo, area) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return []
  try {
    const data    = JSON.parse(match[1])
    const props   = data?.props?.pageProps
    const results = props?.listings?.results || props?.searchResults || props?.data?.listings || []
    return results.slice(0, 12)
      .map(item => normalizeMCItem(item, ciudad, barrio, tipo, area))
      .filter(Boolean)
  } catch (_) { return [] }
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

async function fetchHtml(url) {
  if (USE_PLAYWRIGHT) {
    const { fetchWithBrowser } = await import("./browser.js")
    return fetchWithBrowser(url)
  }
  if (SCRAPER_API_KEY) {
    const params = new URLSearchParams({
      api_key: SCRAPER_API_KEY, url,
      render: "false", country_code: "co",
    })
    return fetchRaw(`https://api.scraperapi.com?${params}`)
  }
  return fetchRaw(url, { headers: { ...HEADERS, Accept: "text/html" } })
}

async function fetchJson(url, timeoutMs = 15000) {
  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
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

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}
