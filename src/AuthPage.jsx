import { useState } from "react"
import { supabase } from "./lib/supabase"

const S = {
  surface: "#f7f9fb", "container-lowest": "#ffffff", "container-low": "#f2f4f6",
  "container-high": "#e6e8ea", "on-surface": "#191c1e", "on-surface-variant": "#45464d",
  primary: "#000000", "on-primary": "#ffffff", secondary: "#006c49",
  "on-secondary": "#ffffff", outline: "#76777d", "outline-variant": "#c6c6cd",
}

export default function AuthPage({ onAuthSuccess }) {
  const [tab, setTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError("")
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    setLoading(false)
    onAuthSuccess()
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setError("")
    if (!companyName.trim()) { setError("Ingresa el nombre de tu inmobiliaria"); setLoading(false); return }
    const { data, error: authErr } = await supabase.auth.signUp({
      email, password,
      options: { data: { company_name: companyName.trim() } },
    })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    if (data?.user?.identities?.length === 0) { setError("Este email ya está registrado. Inicia sesión."); setLoading(false); return }
    setLoading(false)
    onAuthSuccess()
  }

  const inputStyle = {
    width:"100%", padding:"12px 16px", borderRadius:8, border:`1px solid ${S["outline-variant"]}`,
    fontSize:15, outline:"none", background:S["container-lowest"], boxSizing:"border-box",
  }

  const btnStyle = {
    width:"100%", padding:"12px", borderRadius:8, border:"none",
    background:S.primary, color:S["on-primary"], fontSize:15, fontWeight:600,
    cursor:"pointer", opacity:loading?0.6:1,
  }

  return (
    <div style={{ minHeight:"100vh", background:S.surface, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, sans-serif", padding:16 }}>
      <div style={{ maxWidth:400, width:"100%", background:S["container-lowest"], borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:24, fontWeight:700, color:S.primary, letterSpacing:"-0.02em" }}>EstateAnalytix</div>
          <p style={{ fontSize:14, color:S["on-surface-variant"], margin:"4px 0 0" }}>
            {tab === "login" ? "Inicia sesión en tu cuenta" : "Crea tu cuenta profesional"}
          </p>
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:24, background:S["container-low"], borderRadius:8, padding:4 }}>
          {["login","register"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"8px", borderRadius:6, border:"none", cursor:"pointer",
              background: tab===t ? S["container-lowest"] : "transparent",
              color: tab===t ? S.primary : S["on-surface-variant"],
              fontWeight: tab===t ? 600 : 400, fontSize:14,
              boxShadow: tab===t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition:"all .15s",
            }}>
              {t === "login" ? "Iniciar Sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background:"#ffdad6", color:"#ba1a1a", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={tab === "login" ? handleLogin : handleRegister} style={{ display:"grid", gap:16 }}>
          {tab === "register" && (
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:S["on-surface-variant"], display:"block", marginBottom:6 }}>
                Nombre de tu inmobiliaria *
              </label>
              <input
                value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="Ej: Propertia Realty" style={inputStyle}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:S["on-surface-variant"], display:"block", marginBottom:6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" style={inputStyle} required
            />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:S["on-surface-variant"], display:"block", marginBottom:6 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} required minLength={6}
            />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Procesando..." : tab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <p style={{ fontSize:12, color:S["on-surface-variant"], textAlign:"center", marginTop:16 }}>
          {tab === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <span onClick={() => { setTab(tab==="login"?"register":"login"); setError("") }}
            style={{ color:S.secondary, cursor:"pointer", fontWeight:600, textDecoration:"underline" }}>
            {tab === "login" ? "Regístrate" : "Inicia Sesión"}
          </span>
        </p>
      </div>
    </div>
  )
}
