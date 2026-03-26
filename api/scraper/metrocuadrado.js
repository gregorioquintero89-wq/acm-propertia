/**
 * MetroCuadrado Scraper — ACM Propertia
 * Extrae comparables reales de metrocuadrado.com
 *
 * MetroCuadrado expone un endpoint REST interno (/rest-search/search)
 * que devuelve JSON directamente — más fiable que parsear HTML.
 *
 * Endpoint: GET https://www.metrocuadrado.com/rest-search/search
 * Params: realEstateTypeList, realEstateBusinessList, city, rows, from
 */

const BASE_URL = "https://www.metrocuadrado.com"

const TIPO_MC = {
  Apartamento:    "Apartamento",
  Casa:           "Casa",
  Oficina:        "Oficina",
  Local:          "Local comercial",
  Bodega:         "Bodega",
  Lote:           "Lote",
  "Casa-Lote":    "Casa",
  Finca:          "Finca",
  Penthouse:      "Apartamento",
  Apartaestudio:  "Apartamento",
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:       "application/json, text/plain, */*",
  "Accept-Language": "es-CO,es;q=0.9",
  Referer:      "https://www.metrocuadrado.com/",
  "x-requested-with": "XMLHttpRequest",
}

/**
 * Busca comparables en MetroCuadrado para una propiedad dada
 * @param {object} params
 * @param {string} params.ciudad
 * @param {string} params.barrio
 * @param {string} params.tipo
 * @param {number} params.estrato
 * @param {number} params.area
 * @returns {Array} comparables normalizados
 */
export async function scrapeMetroCuadrado({ ciudad, barrio, tipo, estrato, area }) {
  const tipoMC = TIPO_MC[tipo] || tipo

  // ── Intento 1: REST API JSON ───────────────────────────────────────────
  try {
    const params = new URLSearchParams({
      realEstateTypeList:     tipoMC,
      realEstateBusinessList: "Venta",
      city:                   ciudad,
      rows:                   "20",
      from:                   "0",
    })

    const apiUrl = `${BASE_URL}/rest-search/search?${params}`
    console.log(`[MetroCuadrado] API: ${apiUrl}`)

    const data = await fetchJson(apiUrl, { headers: HEADERS })
    const results = data?.results || data?.listings || data?.data || []

    if (results.length > 0) {
      const listings = []
      for (const item of results.slice(0, 12)) {
        const comp = normalizeMCItem(item, ciudad, barrio, tipo, area)
        if (comp) listings.push(comp)
      }
      console.log(`[MetroCuadrado] REST API: ${listings.length} comparables`)
      if (listings.length > 0) return listings
    }
  } catch (err) {
    console.warn(`[MetroCuadrado] REST API falló: ${err.message}`)
  }

  // ── Intento 2: Scraping de página de resultados ───────────────────────
  try {
    const ciudadSlug  = slugify(ciudad)
    const tipoSlug    = tipoMC.toLowerCase().replace(/\s+/g, "-")
    const barrioSlug  = slugify(barrio)
    const htmlUrl     = `${BASE_URL}/inmuebles/venta/${tipoSlug}/${ciudadSlug}/${barrioSlug}/`

    console.log(`[MetroCuadrado] HTML: ${htmlUrl}`)
    const html = await fetchText(htmlUrl, { headers: { ...HEADERS, Accept: "text/html" } })
    const listings = extractFromHTML(html, ciudad, barrio, tipo, area)
    console.log(`[MetroCuadrado] HTML: ${listings.length} comparables`)
    return listings
  } catch (err2) {
    console.error(`[MetroCuadrado] Ambos métodos fallaron para ${ciudad}/${barrio}: ${err2.message}`)
    return []
  }
}

// ── Normalización ─────────────────────────────────────────────────────────

function normalizeMCItem(item, ciudad, barrio, tipo, targetArea) {
  // MetroCuadrado estructura de respuesta REST
  const price =
    item?.salePrice ||
    item?.price ||
    item?.listingData?.salePrice ||
    null

  const areaVal =
    item?.area ||
    item?.builtArea ||
    item?.listingData?.area ||
    null

  if (!price || !areaVal || price < 10_000_000 || areaVal < 10) return null

  const precioM2 = Math.round(price / areaVal)
  if (precioM2 < 500_000 || precioM2 > 30_000_000) return null

  // Filtro de área similar
  if (targetArea) {
    const ratio = areaVal / targetArea
    if (ratio < 0.5 || ratio > 1.5) return null
  }

  return {
    ciudad:         item?.city || ciudad,
    barrio:         item?.neighborhood || item?.sector || barrio,
    tipo,
    estrato:        item?.stratum || item?.estrato || null,
    area:           parseFloat(areaVal),
    dormitorios:    item?.rooms || item?.bedrooms || null,
    banos:          item?.bathrooms || null,
    precio_mercado: Math.round(price),
    precio_m2:      precioM2,
    estado:         "Bueno",
    fuente:         "metrocuadrado",
  }
}

function extractFromHTML(html, ciudad, barrio, tipo, targetArea) {
  const listings = []

  // Intento: __NEXT_DATA__
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return listings

  try {
    const nextData = JSON.parse(match[1])
    const props = nextData?.props?.pageProps
    const results =
      props?.listings?.results ||
      props?.searchResults ||
      props?.data?.listings ||
      []

    for (const item of results.slice(0, 12)) {
      const comp = normalizeMCItem(item, ciudad, barrio, tipo, targetArea)
      if (comp) listings.push(comp)
    }
  } catch (_) { /* Skip */ }

  return listings
}

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

async function fetchJson(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchText(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}
