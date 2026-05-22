import { useEffect, useRef, useState } from "react"
import { AnalysisForm, AnalysisResult } from "../../types/analysis"
import { C, DARK_MAP_STYLE } from "../../constants/analysis"
import { loadPlacesScript, PLACES_KEY } from "../../lib/google-maps"

export function MapView({ form, result }: { form: AnalysisForm; result: AnalysisResult }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "no_key" | "no_address" | "error">("loading")

  const fmt = (n: number): string =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

  useEffect(() => {
    if (!PLACES_KEY) { setStatus("no_key"); return }
    if (!form.barrio) { setStatus("no_address"); return }
    let markerInstance: unknown = null
    let infoInstance: unknown = null

    loadPlacesScript().then(() => {
      try {
        const geocoder = new window.google.maps.Geocoder()
        const address = [form.direccion, form.barrio, form.ciudad, form.pais].filter(Boolean).join(", ")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geocoder.geocode({ address }, (results: any[], gStatus: string) => {
          if (gStatus !== "OK" || !results?.[0]) { setStatus("error"); return }
          const loc = results[0].geometry.location
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: loc, zoom: 14, styles: DARK_MAP_STYLE,
            mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            backgroundColor: "#0A0A0A",
          })
          markerInstance = new window.google.maps.Marker({ position: loc, map: mapInstance })
          infoInstance = new window.google.maps.InfoWindow({
            content: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:6px;min-width:180px">
                <div style="font-size:13px;font-weight:700;color:#00D084;margin-bottom:4px">${form.tipo}</div>
                <div style="font-size:11px;color:#666;margin-bottom:6px">${form.barrio}, ${form.ciudad}</div>
                <div style="border-top:1px solid #eee;margin:4px 0;padding-top:6px">
                  <div style="font-size:11px;color:#60A5FA">Inmediato: <strong>${fmt(result.precio_oportunidad)}</strong></div>
                  <div style="font-size:11px;color:#00D084">Mercado: <strong>${fmt(result.precio_mercado)}</strong></div>
                  <div style="font-size:11px;color:#A78BFA">Óptimo: <strong>${fmt(result.precio_aspiracion)}</strong></div>
                </div>
              </div>
            `,
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(markerInstance as any).addListener("click", () => (infoInstance as any).open(mapInstance, markerInstance))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(infoInstance as any).open(mapInstance, markerInstance)
          setStatus("ready")
        })
      } catch (_) { setStatus("error") }
    }).catch(() => setStatus("error"))

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (infoInstance) (infoInstance as any).close()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (markerInstance) (markerInstance as any).setMap(null)
    }
  }, [form, result])

  return (
    <div>
      <div style={{ position: "relative" }}>
        {status !== "ready" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg2, borderRadius: 12, border: `1px solid ${C.border}`, color: C.gray }}>
            {status === "no_key" && (<><div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div><p style={{ fontSize: 14, color: C.white, margin: "0 0 4px" }}>Mapa no disponible</p><p style={{ fontSize: 12, margin: 0 }}>Configura <code style={{ color: C.green }}>VITE_GOOGLE_PLACES_KEY</code> para ver la ubicación</p></>)}
            {status === "no_address" && (<><div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div><p style={{ fontSize: 14, color: C.white, margin: "0 0 4px" }}>Ingresa un barrio para ver el mapa</p></>)}
            {status === "loading" && (<><div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 16px" }}><div style={{ width: 60, height: 60, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.green}`, borderRadius: "50%", animation: "spin .8s linear infinite" }} /><div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 24 }}>🗺️</div></div><p style={{ margin: 0, fontSize: 14, color: C.grayL }}>Cargando mapa...</p></>)}
            {status === "error" && (<><div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div><p style={{ fontSize: 14, color: C.white, margin: "0 0 4px" }}>No se pudo cargar el mapa</p><p style={{ fontSize: 12, margin: 0 }}>Verifica que la dirección sea correcta</p></>)}
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: 420, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }} />
      </div>
      {(result.zonas_precio?.length ?? 0) > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>💰 Precio /m² por Zona</div>
          <div style={{ display: "grid", gap: 6 }}>
            {result.zonas_precio!.map((z, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <span style={{ color: z.zona === form.barrio ? C.green : C.white, fontWeight: z.zona === form.barrio ? 700 : 600, fontSize: 13 }}>{z.zona}</span>
                <span style={{ color: C.gray, fontWeight: 700, fontSize: 13 }}>
                  {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(z.precio)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
