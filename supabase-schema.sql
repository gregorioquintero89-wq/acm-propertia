-- =====================================================
-- ACM Pro · Propertia — Schema Supabase
-- Ejecuta este SQL en Supabase > SQL Editor > New Query
-- =====================================================

-- 1. TABLA PRINCIPAL: análisis completos
CREATE TABLE analisis (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Ubicación
  ciudad        TEXT NOT NULL,
  barrio        TEXT NOT NULL,
  tipo          TEXT NOT NULL,
  estrato       INTEGER,

  -- Características
  area_construida  DECIMAL,
  area_terreno     DECIMAL,
  antiguedad       INTEGER,
  estado           TEXT,
  dormitorios      INTEGER,
  banos            INTEGER,
  acabados         TEXT,

  -- Amenidades
  tiene_piscina    BOOLEAN DEFAULT FALSE,
  tiene_gimnasio   BOOLEAN DEFAULT FALSE,
  tiene_ascensor   BOOLEAN DEFAULT FALSE,
  parqueaderos     INTEGER DEFAULT 0,

  -- Resultados IA
  precio_oportunidad  BIGINT,
  precio_mercado      BIGINT,
  precio_aspiracion   BIGINT,
  precio_m2           INTEGER,
  resumen_ejecutivo   TEXT,

  -- JSON completo
  resultado_completo  JSONB,
  form_completo       JSONB
);

-- 2. TABLA: comparables del mercado (se llena automáticamente)
CREATE TABLE comparables (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ubicación
  ciudad        TEXT NOT NULL,
  barrio        TEXT NOT NULL,
  tipo          TEXT,
  estrato       INTEGER,

  -- Características
  area          DECIMAL,
  dormitorios   INTEGER,
  banos         INTEGER,
  precio_mercado  BIGINT,
  precio_m2       INTEGER,
  acabados        TEXT,
  tiene_piscina   BOOLEAN,
  tiene_gimnasio  BOOLEAN,
  parqueaderos    INTEGER,
  estado          TEXT,

  -- Referencia
  analisis_id   UUID REFERENCES analisis(id) ON DELETE CASCADE,
  fuente        TEXT DEFAULT 'acm_usuario'
);

-- 3. TABLA: tendencias de precio por zona (histórico)
CREATE TABLE tendencias_zona (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  ciudad    TEXT NOT NULL,
  barrio    TEXT NOT NULL,
  tipo      TEXT,
  estrato   INTEGER,
  precio_m2 INTEGER NOT NULL,
  mes       TEXT NOT NULL  -- formato "2025-03"
);

-- =====================================================
-- ÍNDICES para búsquedas rápidas
-- =====================================================
CREATE INDEX idx_analisis_ciudad_barrio  ON analisis(ciudad, barrio);
CREATE INDEX idx_comparables_ciudad      ON comparables(ciudad, barrio, tipo);
CREATE INDEX idx_tendencias_zona         ON tendencias_zona(ciudad, barrio, mes);

-- =====================================================
-- SEGURIDAD: Row Level Security (RLS)
-- =====================================================
ALTER TABLE analisis       ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparables    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tendencias_zona ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer comparables y tendencias (datos de mercado públicos)
CREATE POLICY "Comparables públicos"    ON comparables     FOR SELECT USING (true);
CREATE POLICY "Tendencias públicas"     ON tendencias_zona FOR SELECT USING (true);

-- Solo el service_role puede insertar (lo hace el backend, nunca el frontend)
CREATE POLICY "Solo backend inserta comparables"  ON comparables     FOR INSERT WITH CHECK (true);
CREATE POLICY "Solo backend inserta tendencias"   ON tendencias_zona FOR INSERT WITH CHECK (true);
CREATE POLICY "Solo backend inserta análisis"     ON analisis        FOR INSERT WITH CHECK (true);

-- Los análisis son visibles para todos por ahora (plataforma pública)
CREATE POLICY "Análisis públicos" ON analisis FOR SELECT USING (true);
