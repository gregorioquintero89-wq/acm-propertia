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
app.use(express.json({ limit: "2mb" }))

// ── Rutas API ──────────────────────────────────────────────────────────────
app.post("/api/analyze",         analyzeHandler)
app.post("/api/save-analysis",   saveAnalysisHandler)
app.get("/api/cron/update-comparables", updateComparablesHandler)

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
