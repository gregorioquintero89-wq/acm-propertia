-- Política: usuarios solo ven sus propios análisis
CREATE POLICY "Users can view their own analyses"
ON analisis FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Habilitar RLS en analisis si no está habilitado
ALTER TABLE analisis ENABLE ROW LEVEL SECURITY;
