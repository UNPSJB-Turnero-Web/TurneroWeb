-- Migration script to add personalized opening hours per consultorio
-- This enhancement adds flexibility by allowing each consultorio to have its own specific operating hours

-- Add default opening and closing hours to consultorio table
ALTER TABLE consultorio ADD COLUMN hora_apertura_default TIME;
ALTER TABLE consultorio ADD COLUMN hora_cierre_default TIME;

-- Create table for weekly schedules per consultorio
CREATE TABLE horario_consultorio (
    id BIGSERIAL PRIMARY KEY,
    consultorio_id BIGINT NOT NULL,
    dia_semana VARCHAR(10) NOT NULL,
    hora_apertura TIME,
    hora_cierre TIME,
    activo BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (consultorio_id) REFERENCES consultorio(id) ON DELETE CASCADE,
    UNIQUE(consultorio_id, dia_semana)
);

-- Add index for better performance on consultorio queries
CREATE INDEX idx_horario_consultorio_id ON horario_consultorio(consultorio_id);
CREATE INDEX idx_horario_consultorio_dia ON horario_consultorio(dia_semana);


-- Set default values for existing consultorios (8:00 AM to 5:00 PM)
UPDATE consultorio 
SET hora_apertura_default = '08:00:00', 
    hora_cierre_default = '17:00:00' 
WHERE hora_apertura_default IS NULL OR hora_cierre_default IS NULL;

-- Insert default weekly schedules for existing consultorios (Monday to Friday)
INSERT INTO horario_consultorio (consultorio_id, dia_semana, hora_apertura, hora_cierre, activo)
SELECT 
    c.id,
    dias.dia,
    c.hora_apertura_default,
    c.hora_cierre_default,
    CASE WHEN dias.dia IN ('SABADO', 'DOMINGO') THEN false ELSE true END
FROM consultorio c
CROSS JOIN (
    VALUES 
        ('LUNES'), ('MARTES'), ('MIERCOLES'), ('JUEVES'), 
        ('VIERNES'), ('SABADO'), ('DOMINGO')
) AS dias(dia)
WHERE NOT EXISTS (
    SELECT 1 FROM horario_consultorio hc 
    WHERE hc.consultorio_id = c.id AND hc.dia_semana = dias.dia
);
