export const PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined

let placesScriptLoaded = false
export function loadPlacesScript(): Promise<void> {
  if (!PLACES_KEY) return Promise.resolve()
  if (window.google?.maps?.places) return Promise.resolve()
  return new Promise(res => {
    if (placesScriptLoaded) {
      const check = setInterval(() => { if (window.google?.maps?.places) { clearInterval(check); res() } }, 50)
      return
    }
    placesScriptLoaded = true
    const s = document.createElement("script")
    s.src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_KEY}&libraries=places&language=es`
    s.async = true
    s.onload = () => {
      const check = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(check); res() }
      }, 50)
    }
    document.head.appendChild(s)
  })
}
