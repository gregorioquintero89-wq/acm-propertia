/**
 * ScraperAPI Client — ACM Propertia
 * Unified client for making requests via ScraperAPI.
 */

const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY;

/**
 * Fetches content via ScraperAPI
 * @param {string} url - Target URL
 * @param {object} options - ScraperAPI options (render, country_code, etc.)
 * @returns {Promise<string>}
 */
export async function fetchViaScraperAPI(url, { render = false, country_code = "co" } = {}) {
  if (!SCRAPER_API_KEY) {
    throw new Error("SCRAPERAPI_KEY is not defined in environment variables");
  }

  const params = new URLSearchParams({
    api_key: SCRAPER_API_KEY,
    url,
    render: render.toString(),
    country_code,
  });

  const apiUrl = `https://api.scraperapi.com?${params}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`ScraperAPI request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.text();
}
