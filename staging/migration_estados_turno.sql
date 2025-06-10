-- Migración de estados de turno
-- Cambiar todos los turnos con estado 'PENDIENTE' a 'PROGRAMADO'
-- Fecha: 2025-06-10

-- Verificar los estados actuales antes de la migración
SELECT estado, COUNT(*) as cantidad
FROM turno 
GROUP BY estado;

-- Actualizar todos los turnos con estado PENDIENTE a PROGRAMADO
UPDATE turno 
SET estado = 'PROGRAMADO' 
WHERE estado = 'PENDIENTE';

-- Verificar los estados después de la migración
SELECT estado, COUNT(*) as cantidad
FROM turno 
GROUP BY estado;

-- Mostrar todos los turnos afectados (opcional, para verificación)
SELECT id, fecha, hora_inicio, hora_fin, estado
FROM turno 
WHERE estado = 'PROGRAMADO'
ORDER BY fecha, hora_inicio;
