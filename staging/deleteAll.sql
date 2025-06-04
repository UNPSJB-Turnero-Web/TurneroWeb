-- Borrar las tablas en el orden correcto respetando las dependencias
DELETE FROM agenda;
DELETE FROM turno;

DELETE FROM esquema_turno_horarios;
DELETE FROM esquema_turno;

DELETE FROM disponibilidad_medico_horarios;
DELETE FROM disponibilidad_medico;

DELETE FROM staff_medico;
DELETE FROM centro_especialidad;
DELETE FROM consultorio;

DELETE FROM medico;
DELETE FROM especialidad;
DELETE FROM centro_atencion;

DELETE FROM paciente;
DELETE FROM obra_social;