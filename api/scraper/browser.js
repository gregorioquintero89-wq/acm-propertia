/**
 * Browser helper — ACM Propertia
 * Abstrae Playwright para scraping con navegador real.
 * Railway soporta Chromium nativo — sin ScraperAPI, sin límites de timeout.
 */

import { chromium } from "playwright"

let browserInstance = null

/**
 * Devuelve una instancia reutilizable de Chromium.
 * Railway mantiene el proceso vivo → reutilizamos el browser entre requests.
 */
async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) return browserInstance
  browserInstance = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  })
  console.log("[Browser] Chromium iniciado")
  return browserInstance
}

/**
 * Abre una página, navega a la URL y devuelve el HTML renderizado.
 * Espera a que la red esté idle para asegurar que el JS cargó.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {number} [options.timeoutMs]
 * @param {string} [options.waitUntil]  - "networkidle" | "domcontentloaded"
 * @returns {Promise<string>} HTML completo de la página
 */
export async function fetchWithBrowser(url, { timeoutMs = 30000, waitUntil = "networkidle" } = {}) {
  const browser = await getBrowser()
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale:    "es-CO",
    extraHTTPHeaders: {
      "Accept-Language": "es-CO,es;q=0.9",
    },
  })

  const page = await context.newPage()
  try {
    await page.goto(url, { timeout: timeoutMs, waitUntil })
    const html = await page.content()
    return html
  } finally {
    await context.close()
  }
}

/**
 * Cierra el browser (usar al apagar el servidor)
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
