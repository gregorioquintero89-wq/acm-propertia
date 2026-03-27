/**
 * FincaRaiz Scraper — ACM Propertia
 * Extrae comparables reales de fincaraiz.com.co
 *
 * Estrategia:
 * 1. Fetch HTML via ScraperAPI (rota IPs residenciales, bypasea bloqueos)
 * 2. Extrae JSON embebido en __NEXT_DATA__ o window.__data
 * 3. Normaliza al formato de comparables de Supabase
 *
 * render=true  → ScraperAPI ejecuta JS antes de devolver el HTML (cron, lento ~10s)
 * render=false → Solo rota IP, sin JS (tiempo real, más rápido ~3s)
 */

const BASE_URL       = "https://fincaraiz.com.co"
const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY

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
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "es-CO,es;q=0.9",
  "Cache-Control": "no-cache",
}

/**
 * Busca comparables en FincaRaiz para una propiedad dada
 * @param {object} params
 * @param {string} params.ciudad
 * @param {string} params.barrio
 * @param {string} params.tipo      - "Apartamento", "Casa", etc.
 * @param {number} params.estrato
 * @param {number} params.area      - m² construidos (para filtrar similares)
 * @param {boolean} params.render   - true = ScraperAPI renderiza JS (más lento, más datos)
 * @returns {Array} comparables normalizados
 */
export async function scrapeFincaRaiz({ ciudad, barrio, tipo, estrato, area, render = false }) {
  const ciudadSlug = CIUDAD_SLUG[ciudad] || ciudad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
  const tipoSlug   = TIPO_SLUG[tipo] || "inmuebles"
  const barrioSlug = barrio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
  const searchUrl  = `${BASE_URL}/${tipoSlug}/venta/${ciudadSlug}/${barrioSlug}/`

  console.log(`[FincaRaiz] Scraping via ${SCRAPER_API_KEY ? "ScraperAPI" : "directo"}: ${searchUrl}`)

  try {
    const html = await fetchWithTimeout(wrapScraperApi(searchUrl, render), { headers: HEADERS })
    const listings = extractListings(html, ciudad, barrio, tipo, estrato, area)
    console.log(`[FincaRaiz] Encontrados ${listings.length} comparables en ${barrio}, ${ciudad}`)
    return listings
  } catch (err) {
    // Intentar con URL sin barrio si la anterior falla
    try {
      const fallbackUrl = `${BASE_URL}/${tipoSlug}/venta/${ciudadSlug}/`
      console.log(`[FincaRaiz] Fallback URL: ${fallbackUrl}`)
      const html = await fetchWithTimeout(wrapScraperApi(fallbackUrl, render), { headers: HEADERS })
      const listings = extractListings(html, ciudad, barrio, tipo, estrato, area)
      return listings
    } catch (err2) {
      console.error(`[FincaRaiz] Error scraping ${ciudad}/${barrio}:`, err2.message)
      return []
    }
  }
}

// ── Extracción de datos ────────────────────────────────────────────────────

function extractListings(html, ciudad, barrio, tipo, estrato, area) {
  const listings = []

  // Intento 1: __NEXT_DATA__ (Next.js)
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1])
      const props = nextData?.props?.pageProps
      const results =
        props?.listings?.results ||
        props?.searchResults?.listings ||
        props?.data?.listings ||
        []

      for (const item of results.slice(0, 10)) {
        const comp = normalizeFincaRaizItem(item, ciudad, barrio, tipo)
        if (comp && isReasonable(comp, area)) listings.push(comp)
      }
      if (listings.length > 0) return listings
    } catch (_) { /* Continuar con siguiente método */ }
  }

  // Intento 2: window.__INITIAL_STATE__ o window.dataCache
  const stateMatch = html.match(/window\.__(?:INITIAL_STATE|dataCache|data)__\s*=\s*(\{[\s\S]*?\});\s*(?:window|<\/script)/)
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1])
      const results =
        state?.listings?.items ||
        state?.search?.results ||
        []

      for (const item of results.slice(0, 10)) {
        const comp = normalizeFincaRaizItem(item, ciudad, barrio, tipo)
        if (comp && isReasonable(comp, area)) listings.push(comp)
      }
      if (listings.length > 0) return listings
    } catch (_) { /* Continuar */ }
  }

  // Intento 3: JSON-LD de listado
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  for (const match of jsonLdMatches) {
    try {
      const ld = JSON.parse(match[1])
      if (ld["@type"] === "RealEstateListing" || ld["@type"] === "Product") {
        const comp = normalizeJsonLD(ld, ciudad, barrio, tipo)
        if (comp && isReasonable(comp, area)) listings.push(comp)
      }
    } catch (_) { /* Skip */ }
  }

  return listings
}

function normalizeFincaRaizItem(item, ciudad, barrio, tipo) {
  // FincaRaiz puede tener distintas estructuras según versión del API
  const price =
    item?.price ||
    item?.sale_price ||
    item?.listingData?.price ||
    item?.attributes?.sale_price ||
    null

  const areaVal =
    item?.area ||
    item?.built_area ||
    item?.listingData?.area ||
    item?.attributes?.area ||
    null

  if (!price || !areaVal || price < 10_000_000 || areaVal < 10) return null

  const precioM2 = Math.round(price / areaVal)
  // Sanity check: precios COP por m² razonables (500k - 30M)
  if (precioM2 < 500_000 || precioM2 > 30_000_000) return null

  return {
    ciudad,
    barrio: item?.neighborhood || item?.barrio || barrio,
    tipo,
    estrato: item?.stratum || item?.estrato || null,
    area: parseFloat(areaVal),
    dormitorios: item?.rooms || item?.bedrooms || item?.dormitorios || null,
    banos: item?.bathrooms || item?.banos || null,
    precio_mercado: Math.round(price),
    precio_m2: precioM2,
    estado: "Bueno",
    fuente: "fincaraiz",
  }
}

function normalizeJsonLD(ld, ciudad, barrio, tipo) {
  const price = ld?.offers?.price || ld?.price
  const area  = ld?.floorSize?.value || ld?.area

  if (!price || !area) return null

  const precioM2 = Math.round(price / area)
  if (precioM2 < 500_000 || precioM2 > 30_000_000) return null

  return {
    ciudad,
    barrio,
    tipo,
    estrato: null,
    area: parseFloat(area),
    dormitorios: ld?.numberOfRooms || null,
    banos: ld?.numberOfBathroomsTotal || null,
    precio_mercado: Math.round(price),
    precio_m2: precioM2,
    estado: "Bueno",
    fuente: "fincaraiz_ld",
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isReasonable(comp, targetArea) {
  if (!targetArea) return true
  // Solo incluir propiedades con área ±50% de la objetivo
  const ratio = comp.area / targetArea
  return ratio >= 0.5 && ratio <= 1.5
}

/**
 * Envuelve una URL con ScraperAPI si hay key disponible.
 * Sin key → fetch directo (puede ser bloqueado por los portales).
 * render=true → ScraperAPI ejecuta el JS de la página antes de devolver HTML.
 */
function wrapScraperApi(url, render = false) {
  if (!SCRAPER_API_KEY) return url
  const params = new URLSearchParams({
    api_key: SCRAPER_API_KEY,
    url,
    render: render ? "true" : "false",
    country_code: "co",  // IPs de Colombia → menos sospechoso para portales locales
  })
  return `https://api.scraperapi.com?${params}`
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
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
