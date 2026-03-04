import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { formData, result, userId } = req.body;

  try {
    // 1. Guardar el análisis completo
    const { data: analysis, error: analysisError } = await supabase
      .from('analisis')
      .insert({
        user_id: userId || null,
        ciudad: formData.ciudad,
        barrio: formData.barrio,
        tipo: formData.tipo,
        estrato: formData.estrato,
        area_construida: parseFloat(formData.areaConstruida) || null,
        area_terreno: parseFloat(formData.areaTerreno) || null,
        antiguedad: parseInt(formData.antiguedad) || null,
        estado: formData.estado,
        dormitorios: formData.dormitorios || 2,
        banos: formData.banosC || 1,
        acabados: formData.acabados,
        tiene_piscina: !!formData.piscina,
        tiene_gimnasio: !!formData.gimnasio,
        tiene_ascensor: !!formData.ascensor,
        parqueaderos: formData.parqueaderos || 0,
        precio_oportunidad: result.precio_oportunidad,
        precio_mercado: result.precio_mercado,
        precio_aspiracion: result.precio_aspiracion,
        precio_m2: result.precio_m2_base,
        resumen_ejecutivo: result.resumen_ejecutivo,
        resultado_completo: result,
        form_completo: formData,
      })
      .select()
      .single()

    if (analysisError) throw analysisError

    // 2. Guardar como comparable para futuros análisis
    const { error: compError } = await supabase
      .from('comparables')
      .insert({
        ciudad: formData.ciudad,
        barrio: formData.barrio,
        tipo: formData.tipo,
        estrato: formData.estrato,
        area: parseFloat(formData.areaConstruida) || null,
        dormitorios: formData.dormitorios || 2,
        banos: formData.banosC || 1,
        precio_mercado: result.precio_mercado,
        precio_m2: result.precio_m2_base,
        acabados: formData.acabados,
        tiene_piscina: !!formData.piscina,
        tiene_gimnasio: !!formData.gimnasio,
        parqueaderos: formData.parqueaderos || 0,
        estado: formData.estado,
        analisis_id: analysis.id,
        fuente: 'acm_usuario',
      })

    if (compError) console.warn("Error guardando comparable:", compError)

    // 3. Guardar punto de tendencia de precio por zona
    const { error: tendError } = await supabase
      .from('tendencias_zona')
      .insert({
        ciudad: formData.ciudad,
        barrio: formData.barrio,
        precio_m2: result.precio_m2_base,
        mes: new Date().toISOString().slice(0, 7), // "2025-03"
        tipo: formData.tipo,
        estrato: formData.estrato,
      })

    if (tendError) console.warn("Error guardando tendencia:", tendError)

    return res.status(200).json({ success: true, analysisId: analysis.id })

  } catch (error) {
    console.error("Error guardando en Supabase:", error)
    return res.status(500).json({ error: "Error al guardar el análisis" })
  }
}
