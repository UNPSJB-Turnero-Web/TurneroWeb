-- Migration script to make esquema_turno_id optional in agenda table
-- This allows holidays to be created without being associated to a specific esquema_turno

-- Make the esquema_turno_id column nullable
ALTER TABLE agenda ALTER COLUMN esquema_turno_id DROP NOT NULL;

-- Add a check constraint to ensure that non-FERIADO agendas must have an esquema_turno_id
ALTER TABLE agenda ADD CONSTRAINT check_esquema_turno_required 
CHECK (
    (tipo_agenda = 'FERIADO' AND esquema_turno_id IS NULL) OR
    (tipo_agenda != 'FERIADO' AND esquema_turno_id IS NOT NULL) OR
    (tipo_agenda IS NULL AND esquema_turno_id IS NOT NULL)
);
