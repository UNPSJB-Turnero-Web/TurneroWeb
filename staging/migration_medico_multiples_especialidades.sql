-- Migración: Permitir múltiples especialidades por médico
-- Fecha: 2025-09-05
-- Descripción: Cambia la relación de Medico-Especialidad de Many-to-One a Many-to-Many
--              y agrega especialidad directa a StaffMedico

-- 1. Crear tabla intermedia para medico-especialidad (si no existe)
CREATE TABLE IF NOT EXISTS medico_especialidad (
    medico_id INTEGER NOT NULL,
    especialidad_id INTEGER NOT NULL,
    PRIMARY KEY (medico_id, especialidad_id),
    FOREIGN KEY (medico_id) REFERENCES medico(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidad_id) REFERENCES especialidad(id) ON DELETE CASCADE
);

-- 2. Migrar datos existentes de medico.especialidad_id a la tabla intermedia (evitar duplicados)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT id, especialidad_id 
FROM medico 
WHERE especialidad_id IS NOT NULL
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- 3. Agregar columna especialidad_id a staff_medico (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_medico' AND column_name = 'especialidad_id'
    ) THEN
        ALTER TABLE staff_medico ADD COLUMN especialidad_id INTEGER;
    END IF;
END $$;

-- 4. Migrar especialidades de medico a staff_medico
-- (Asumimos que cada staff_medico usará la especialidad actual del médico)
UPDATE staff_medico 
SET especialidad_id = (
    SELECT especialidad_id 
    FROM medico 
    WHERE medico.id = staff_medico.medico_id
)
WHERE staff_medico.especialidad_id IS NULL;

-- 5. Verificar que no hay registros NULL antes de hacer la columna obligatoria
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM staff_medico WHERE especialidad_id IS NULL) THEN
        RAISE EXCEPTION 'Error: Existen registros de staff_medico sin especialidad_id. No se puede proceder con la migración.';
    END IF;
END $$;

-- 6. Hacer la columna especialidad_id obligatoria en staff_medico
ALTER TABLE staff_medico 
ALTER COLUMN especialidad_id SET NOT NULL;

-- 7. Agregar foreign key constraint para staff_medico.especialidad_id (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_staff_medico_especialidad'
    ) THEN
        ALTER TABLE staff_medico 
        ADD CONSTRAINT fk_staff_medico_especialidad 
        FOREIGN KEY (especialidad_id) REFERENCES especialidad(id);
    END IF;
END $$;

-- 8. Eliminar la columna especialidad_id de la tabla medico
-- COMENTADO POR SEGURIDAD - Ejecutar manualmente después de verificar que todo funciona
-- ALTER TABLE medico 
-- DROP COLUMN especialidad_id;

-- Verificaciones post-migración
-- SELECT COUNT(*) FROM medico_especialidad; -- Debe tener al menos tantos registros como médicos con especialidad
-- SELECT COUNT(*) FROM staff_medico WHERE especialidad_id IS NULL; -- Debe ser 0
