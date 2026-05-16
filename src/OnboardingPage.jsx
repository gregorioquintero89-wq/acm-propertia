import { useState, useRef } from "react"
import { supabase } from "./lib/supabase"

const S = {
  surface: "#f7f9fb", "container-lowest": "#ffffff", "container-low": "#f2f4f6",
  "container-high": "#e6e8ea", "on-surface": "#191c1e", "on-surface-variant": "#45464d",
  primary: "#000000", "on-primary": "#ffffff", secondary: "#006c49",
  "on-secondary": "#ffffff", outline: "#76777d", "outline-variant": "#c6c6cd",
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""

export default function OnboardingPage({ user, onComplete }) {
  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState(user?.user_metadata?.company_name || "")
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoUrl, setLogoUrl] = useState(user?.user_metadata?.logo_url || "")

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const saveCompanyName = async () => {
    if (!companyName.trim()) return
    setIsSaving(true)
    await supabase.auth.updateUser({ data: { company_name: companyName.trim() } })
    setIsSaving(false)
    setStep(2)
  }

  const uploadLogo = async () => {
    if (!logoPreview) { setStep(3); return }
    setIsSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/upload-logo`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: logoPreview, user_id: user.id }),
      })
      const data = await res.json()
      if (data.url) {
        setLogoUrl(data.url)
        await supabase.auth.updateUser({ data: { logo_url: data.url } })
      }
    } catch (err) { console.warn(err) }
    setIsSaving(false)
    setStep(3)
  }

  const btnStyle = {
    padding:"12px 32px", borderRadius:8, border:"none",
    background:S.secondary, color:S["on-secondary"], fontSize:15, fontWeight:600,
    cursor: "pointer", opacity: isSaving ? 0.6 : 1,
  }

  return (
    <div style={{ minHeight:"100vh", background:S.surface, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, sans-serif", padding:16 }}>
      <div style={{ maxWidth:480, width:"100%", background:S["container-lowest"], borderRadius:16, padding:40, boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:12, fontWeight:600, color:S.secondary, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Paso {step} de 3</div>
          <h2 style={{ margin:0, fontSize:24, fontWeight:700, color:S.primary }}>
            {step === 1 ? "¿Cuál es el nombre de tu inmobiliaria?" :
             step === 2 ? "Sube el logo de tu empresa" : "¡Listo!"}
          </h2>
          <p style={{ fontSize:14, color:S["on-surface-variant"], margin:"8px 0 0" }}>
            {step === 1 ? "Aparecerá en tus informes y dashboard." :
             step === 2 ? "Tu logo se mostrará en los reportes PDF." :
             "Tu perfil está configurado. Puedes cambiarlo después."}
          </p>
        </div>

        {step === 1 && (
          <div>
            <input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Ej: Propertia Realty"
              style={{
                width:"100%", padding:"14px 16px", fontSize:18, fontWeight:600,
                textAlign:"center", borderRadius:8,
                border:`1px solid ${S["outline-variant"]}`, outline:"none",
                background:S["container-lowest"], boxSizing:"border-box",
              }}
              autoFocus
            />
            <button onClick={saveCompanyName} disabled={!companyName.trim() || isSaving}
              style={{ ...btnStyle, width:"100%", marginTop:16, opacity: !companyName.trim() ? 0.4 : (isSaving?0.6:1) }}>
              {isSaving ? "Guardando..." : "Continuar →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign:"center" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width:160, height:160, borderRadius:12, border:`2px dashed ${S["outline-variant"]}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 20px", cursor:"pointer", overflow:"hidden",
                background:S["container-low"], transition:"all .2s",
              }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="logo preview" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />
              ) : (
                <div style={{ textAlign:"center", color:S["on-surface-variant"] }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🏢</div>
                  <div style={{ fontSize:13 }}>Click para subir logo</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelect} style={{ display:"none" }} />
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={() => setStep(3)} style={{ ...btnStyle, background:"transparent", color:S["on-surface-variant"], border:`1px solid ${S["outline-variant"]}` }}>
                Omitir
              </button>
              <button onClick={uploadLogo} disabled={!logoPreview || isSaving} style={{
                ...btnStyle, opacity: (!logoPreview || isSaving) ? 0.6 : 1,
              }}>
                {isSaving ? "Subiendo..." : "Subir Logo →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <p style={{ fontSize:16, color:S["on-surface-variant"], marginBottom:24, lineHeight:1.6 }}>
              Tu perfil de <strong style={{ color:S.primary }}>{companyName}</strong> está listo.
              {logoUrl && <><br/>Tu logo se usará en los informes PDF.</>}
            </p>
            <button onClick={onComplete} disabled={isSaving} style={btnStyle}>
              Ir al Dashboard →
            </button>
          </div>
        )}

        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:32 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width:8, height:8, borderRadius:"50%",
              background: s === step ? S.secondary : S["outline-variant"],
              transition:"all .3s",
            }}/>
          ))}
        </div>
      </div>
    </div>
  )
}
