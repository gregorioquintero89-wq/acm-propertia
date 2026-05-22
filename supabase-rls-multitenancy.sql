-- Fix multi-tenancy: each user can only see their own analyses
-- Run this in Supabase > SQL Editor

DROP POLICY IF EXISTS "Análisis públicos" ON analisis;

CREATE POLICY "Users see own analyses"
  ON analisis FOR SELECT
  USING (auth.uid() = user_id);
