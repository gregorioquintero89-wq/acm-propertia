import { useState, useEffect, useRef } from "react"
import { C, PAIS_CODE } from "../../constants/analysis"
import { loadPlacesScript } from "../../lib/google-maps"

interface PlaceResult { barrio: string; ciudad: string; pais: string }

export const PlacesInput = ({ value, onChange, onPlace, pais, placeholder }: {
  value: string; onChange: (v: string) => void; onPlace: (p: PlaceResult) => void; pais: string; placeholder?: string
}) => {
  const [query, setQuery] = useState(value || "")
  const [predictions, setPredictions] = useState<unknown[]>([])
  const [open, setOpen] = useState(false)
  const svcRef = useRef<unknown>(null)
  const geocRef = useRef<unknown>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onPlaceRef = useRef(onPlace)
  onPlaceRef.current = onPlace

  useEffect(() => { if (!value) setQuery("") }, [value])

  useEffect(() => {
    loadPlacesScript().then(() => {
      svcRef.current = new window.google.maps.places.AutocompleteService()
      geocRef.current = new window.google.maps.Geocoder()
    })
  }, [])

  const fetchPredictions = (input: string) => {
    if (!svcRef.current || !input.trim()) { setPredictions([]); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(svcRef.current as any).getPlacePredictions(
      { input, componentRestrictions: { country: PAIS_CODE[pais] || "co" }, types: ["geocode"] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (results: any[], status: string) => {
        setPredictions(status === "OK" ? (results || []) : [])
        if (status === "OK" && results?.length) setOpen(true)
      }
    )
  }

  const handleChange = (v: string) => {
    setQuery(v); onChange(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchPredictions(v), 280)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (pred: any) => {
    const text = pred.structured_formatting.main_text
    setQuery(text); onChange(text)
    setPredictions([]); setOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(geocRef.current as any)?.geocode({ placeId: pred.place_id }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.[0]) return
      let barrio = "", ciudad = "", paisDet = ""
      for (const comp of results[0].address_components) {
        const t = comp.types
        if (!barrio && (t.includes("neighborhood") || t.includes("sublocality_level_1") || t.includes("sublocality")))
          barrio = comp.long_name
        if (!ciudad && (t.includes("locality") || t.includes("administrative_area_level_2")))
          ciudad = comp.long_name
        if (t.includes("country")) paisDet = comp.long_name
      }
      if (!barrio) barrio = text
      setQuery(barrio); onChange(barrio)
      onPlaceRef.current({ barrio, ciudad, pais: paisDet || pais })
    })
  }

  const inpStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    border: `1px solid ${query ? C.green + "60" : C.border}`,
    fontSize: 14, color: query ? C.white : C.gray,
    background: C.bg3, outline: "none", transition: "border .2s", boxSizing: "border-box",
  }

  return (
    <div style={{ position: "relative" }}>
      <input type="text" value={query} onChange={e => handleChange(e.target.value)}
        onFocus={() => predictions.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder || "Escribe el barrio..."} autoComplete="off" style={inpStyle}
      />
      {open && predictions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8,
          zIndex: 50, maxHeight: 220, overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.7)"
        }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(predictions as any[]).map(pred => (
            <div key={pred.place_id} onMouseDown={e => e.preventDefault()} onClick={() => handleSelect(pred)}
              style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}22`, fontSize: 13.5 }}>
              <div style={{ color: C.white, fontWeight: 600 }}>{pred.structured_formatting.main_text}</div>
              <div style={{ color: C.gray, fontSize: 11, marginTop: 2 }}>{pred.structured_formatting.secondary_text}</div>
            </div>
          ))}
          <div style={{ padding: "5px 14px", fontSize: 10, color: C.gray, textAlign: "right" }}>powered by Google</div>
        </div>
      )}
    </div>
  )
}
