/**
 * Servidor Express — ACM Propertia Backend
 * Corre en Railway como proceso persistente (sin timeout).
 *
 * Rutas:
 *   POST /api/analyze          → Análisis con Claude + scraping
 *   POST /api/save-analysis    → Guardar análisis en Supabase
 *   GET  /api/cron/update-comparables → Trigger manual del cron
 *   GET  /health               → Health check para Railway
 */

import express        from "express"
import cors           from "cors"
import cron           from "node-cron"
import analyzeHandler          from "../api/analyze.js"
import saveAnalysisHandler     from "../api/save-analysis.js"
import updateComparablesHandler from "../api/cron/update-comparables.js"

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://acm-propertia.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  methods: ["GET", "POST"],
}))
app.use(express.json({ limit: "10mb" }))

// ── Rutas API ──────────────────────────────────────────────────────────────
app.post("/api/analyze",         analyzeHandler)
app.post("/api/save-analysis",   saveAnalysisHandler)
app.get("/api/cron/update-comparables", updateComparablesHandler)

// ── Upload Logo ────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js"

app.post("/api/upload-logo", async (req, res) => {
  try {
    const { image_base64, user_id } = req.body
    if (!image_base64 || !user_id) return res.status(400).json({ error: "Faltan datos" })

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const ext = image_base64.split(";")[0].split("/")[1] || "png"
    const fileName = `logos/${user_id}/logo.${ext}`

    const { data, error } = await supabase.storage
      .from("logos")
      .upload(fileName, buffer, { contentType: `image/${ext}`, upsert: true })

    if (error) {
      if (error.message?.includes("bucket") || error.message?.includes("not found")) {
        return res.status(400).json({ error: "El bucket 'logos' no existe. Créalo en Supabase Storage." })
      }
      return res.status(500).json({ error: error.message })
    }

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName)
    res.json({ url: publicUrl })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "acm-propertia-backend", ts: new Date().toISOString() })
})

// ── Cron automático (Railway lo corre como proceso persistente) ────────────
// Todos los días a las 6 AM hora Colombia (UTC-5 → 11 AM UTC)
cron.schedule("0 11 * * *", async () => {
  console.log("[Cron] Iniciando actualización diaria de comparables...")
  const mockReq = {
    method: "GET",
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }
  const mockRes = {
    status: (code) => ({ json: (data) => console.log(`[Cron] Resultado ${code}:`, JSON.stringify(data)) }),
    json:   (data) => console.log("[Cron] Resultado:", JSON.stringify(data)),
  }
  await updateComparablesHandler(mockReq, mockRes)
}, { timezone: "America/Bogota" })

// ── Arrancar servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] ACM Propertia backend corriendo en puerto ${PORT}`)
  console.log(`[Server] Cron programado: todos los días 6 AM Colombia`)
})
