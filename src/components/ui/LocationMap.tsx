import { useEffect, useRef, useState } from "react"
import { AnalysisForm } from "../../types/analysis"
import { C, DARK_MAP_STYLE } from "../../constants/analysis"
import { loadPlacesScript, PLACES_KEY } from "../../lib/google-maps"

export function LocationMap({ form }: { form: AnalysisForm }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle")

  useEffect(() => {
    if (!PLACES_KEY || !form.barrio || !form.ciudad) { setStatus("idle"); return }
    setStatus("loading")
    let markerInstance: unknown = null

    loadPlacesScript().then(() => {
      try {
        const geocoder = new window.google.maps.Geocoder()
        const address = [form.direccion, form.barrio, form.ciudad, form.pais].filter(Boolean).join(", ")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geocoder.geocode({ address }, (results: any[], gStatus: string) => {
          if (gStatus !== "OK" || !results?.[0]) { setStatus("idle"); return }
          const loc = results[0].geometry.location
          if (!mapRef.current) return
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: loc, zoom: 14, styles: DARK_MAP_STYLE,
            mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            backgroundColor: "#0A0A0A",
          })
          markerInstance = new window.google.maps.Marker({ position: loc, map: mapInstance })
          setStatus("ready")
        })
      } catch (_) { setStatus("idle") }
    }).catch(() => setStatus("idle"))

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (markerInstance) (markerInstance as any).setMap(null)
    }
  }, [form.barrio, form.ciudad, form.direccion, form.pais])

  if (!PLACES_KEY || status === "idle" || !form.barrio || !form.ciudad) return null
  return (
    <div style={{ position: "relative" }}>
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg2, borderRadius: 12, border: `1px solid ${C.border}`, color: C.gray }}>
          <p style={{ fontSize: 13, color: C.grayL }}>Cargando mapa...</p>
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: 220, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, opacity: status === "ready" ? 1 : 0.4 }} />
    </div>
  )
}
