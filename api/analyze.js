export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { formData } = req.body;
  if (!formData) return res.status(400).json({ error: "Faltan datos" });

  const prompt = `Eres un experto tasador inmobiliario colombiano con 20 años de experiencia. 
Genera un ACM profesional con datos REALISTAS y PRECISOS para el mercado colombiano 2024-2025.

PROPIEDAD:
- ${formData.tipo} en ${formData.barrio}, ${formData.ciudad} · Estrato ${formData.estrato}
- Área: ${formData.areaConstruida}m²${formData.areaTerreno ? ` / Terreno: ${formData.areaTerreno}m²` : ""}
- Antigüedad: ${formData.antiguedad} años · Estado: ${formData.estado}
- Remodelado: ${formData.remodelado === "si" ? `Sí (${formData.remodelAnios} años, ${(formData.remodelAreas||[]).join(", ")})` : "No"}
- ${formData.dormitorios||2} dorm · ${formData.banosC||1} baños · ${formData.banosS||0} baños sociales
- Acabados: ${formData.acabados||"estándar"} · Cocina: ${formData.cocina||"N/A"} · Techos: ${formData.altTechos||"estándar"}
- Balcón: ${formData.balcon ? `Sí (${formData.balconM2}m²)` : "No"} · Sótano: ${formData.sotano?"Sí":"No"}
- Piscina: ${formData.piscina ? `Sí (${formData.piscinaT||""})` : "No"} · Gimnasio: ${formData.gimnasio?"Sí":"No"} · Salón: ${formData.salon?"Sí":"No"} · Sauna: ${formData.sauna?"Sí":"No"} · Ascensor: ${formData.ascensor?"Sí":"No"}
- Seguridad: ${(formData.seguridad||[]).join(", ")||"básica"} · Admin: ${formData.adminM ? `$${parseInt(formData.adminM).toLocaleString("es-CO")}` : "N/A"}
- Parqueaderos: ${formData.parqueaderos||0} ${formData.parqT?`(${formData.parqT})`:""}
- Vista: ${formData.vista||"N/A"} (${formData.calidadV||"N/A"}) · Orientación: ${formData.orientacion||"N/A"}
- Gastro: ${formData.proxGastro||"N/A"} · Comercio: ${formData.proxComercio||"N/A"} · Transporte: ${formData.proxTransp||"N/A"}
- Zona: ${formData.zonaEst||"N/A"} · Plazo: ${formData.plazo||"N/A"}
${formData.precioRef ? `- Precio referencia propietario: $${parseInt(formData.precioRef).toLocaleString("es-CO")}` : ""}
${formData.notas ? `- Notas: ${formData.notas}` : ""}

IMPORTANTE: Usa precios reales del mercado colombiano. Por ejemplo:
- Chapinero/Bogotá estrato 4: ~8-10M COP/m²
- El Poblado/Medellín estrato 6: ~12-15M COP/m²
- Granada/Cali estrato 5: ~7-9M COP/m²

Responde SOLO con JSON (sin markdown):
{
  "resumen_ejecutivo": "2-3 oraciones sobre la propiedad y mercado actual",
  "precio_m2_base": número,
  "precio_oportunidad": número,
  "precio_mercado": número,
  "precio_aspiracion": número,
  "comparables": [{"nombre":"string","zona":"string","area":número,"precio":número,"dormitorios":número,"banos":número,"antiguedad":número,"estado":"Excelente|Bueno|Regular"}],
  "factores": [{"factor":"string","impacto":"string","positivo":boolean,"descripcion":"string"}],
  "tendencia": [{"mes":"string","precio":número}],
  "zonas_precio": [{"zona":"string","precio":número}],
  "recomendaciones": {"precio_inicial":"string","estrategia":"string","atributos":"string","objeciones":"string"},
  "plazo_oportunidad":"string","plazo_mercado":"string","plazo_aspiracion":"string"
}
Exactamente: 5 comparables, 6 factores, 12 meses tendencia, 6 zonas.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error("OpenAI API error");

    const data = await response.json();
    const rawText =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.message?.content?.[0]?.text ||
      "";

    const cleanedText = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanedText);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error al generar el análisis. Intenta de nuevo." });
  }
}
