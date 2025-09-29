-- Script SQL para insertar registros de auditoría en TurneroWeb
-- Usando la estructura de tabla existente

INSERT INTO public.audit_log (id, "action", entity_id, entity_type, estado_anterior, estado_nuevo, new_values, old_values, performed_at, performed_by, reason, turno_id) VALUES

(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'OPERADOR', NULL, 'activo', 0, 0, '2024-09-01 08:30:00', 'admin', 'Creación inicial del operador', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'OPERADOR', NULL, 'activo', 0, 0, '2024-09-01 09:15:00', 'admin', 'Creación inicial del operador', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE', 3, 'OPERADOR', 'activo', 'activo', 0, 0, '2024-09-02 10:20:00', 'admin', 'Actualización de teléfono', NULL),
(nextval('audit_log_id_seq'::regclass), 'USER_DISABLE', 4, 'OPERADOR', 'activo', 'inactivo', 0, 0, '2024-09-03 14:30:00', 'admin', 'Operador dado de baja por solicitud', NULL),
(nextval('audit_log_id_seq'::regclass), 'USER_ENABLE', 5, 'OPERADOR', 'inactivo', 'activo', 0, 0, '2024-09-04 11:45:00', 'admin', 'Reactivación del operador', NULL),

-- Registros de auditoría para TURNOS
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-05 09:00:00', 'operador1', 'Turno creado por paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'CONFIRM', 1, 'TURNO', 'PROGRAMADO', 'CONFIRMADO', 0, 0, '2024-09-06 10:30:00', 'operador2', 'Confirmación de turno por llamada telefónica', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-05 10:15:00', 'operador1', 'Turno solicitado por paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'CANCEL', 2, 'TURNO', 'PROGRAMADO', 'CANCELADO', 0, 0, '2024-09-07 16:20:00', 'operador3', 'Cancelación por enfermedad del paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 3, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-05 11:30:00', 'paciente_directo', 'Turno creado desde portal de pacientes', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE_STATUS', 3, 'TURNO', 'PROGRAMADO', 'COMPLETADO', 0, 0, '2024-09-08 08:45:00', 'operador1', 'Turno completado exitosamente', NULL),

-- Registros de auditoría para MÉDICOS
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'MEDICO', NULL, 'activo', 0, 0, '2024-09-01 07:00:00', 'admin', 'Registro inicial del médico', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'MEDICO', NULL, 'activo', 0, 0, '2024-09-01 07:15:00', 'admin', 'Registro inicial del médico', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE', 3, 'MEDICO', 'activo', 'activo', 0, 0, '2024-09-09 12:00:00', 'admin', 'Actualización de datos de contacto', NULL),

-- Registros de auditoría para PACIENTES
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'PACIENTE', NULL, 'activo', 0, 0, '2024-09-02 08:00:00', 'operador1', 'Registro de nuevo paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'PACIENTE', NULL, 'activo', 0, 0, '2024-09-02 08:30:00', 'operador2', 'Registro de nuevo paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE', 3, 'PACIENTE', 'activo', 'activo', 0, 0, '2024-09-10 15:30:00', 'operador1', 'Actualización de teléfono de contacto', NULL),

-- Registros de auditoría para CONSULTORIOS
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'CONSULTORIO', NULL, 'activo', 0, 0, '2024-09-01 06:30:00', 'admin', 'Creación de consultorio', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'CONSULTORIO', NULL, 'activo', 0, 0, '2024-09-01 06:45:00', 'admin', 'Creación de consultorio', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE', 3, 'CONSULTORIO', 'activo', 'inactivo', 0, 0, '2024-09-11 09:15:00', 'admin', 'Consultorio temporalmente fuera de servicio', NULL),

-- Registros de auditoría para CENTROS DE ATENCIÓN
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'CENTRO_ATENCION', NULL, 'activo', 0, 0, '2024-08-30 10:00:00', 'admin', 'Creación del centro principal', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'CENTRO_ATENCION', NULL, 'activo', 0, 0, '2024-08-30 10:30:00', 'admin', 'Creación del centro norte', NULL),

-- Registros de auditoría para ESPECIALIDADES
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'ESPECIALIDAD', NULL, 'activo', 0, 0, '2024-08-29 14:00:00', 'admin', 'Creación de especialidad', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'ESPECIALIDAD', NULL, 'activo', 0, 0, '2024-08-29 14:15:00', 'admin', 'Creación de especialidad', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 3, 'ESPECIALIDAD', NULL, 'activo', 0, 0, '2024-08-29 14:30:00', 'admin', 'Creación de especialidad', NULL),

-- Registros de auditoría para USUARIOS/AUTENTICACIÓN
(nextval('audit_log_id_seq'::regclass), 'LOGIN', 1, 'USUARIO', NULL, NULL, 0, 0, '2024-09-12 08:00:00', 'operador1', 'Inicio de sesión exitoso', NULL),
(nextval('audit_log_id_seq'::regclass), 'LOGIN', 2, 'USUARIO', NULL, NULL, 0, 0, '2024-09-12 08:15:00', 'operador2', 'Inicio de sesión exitoso', NULL),
(nextval('audit_log_id_seq'::regclass), 'LOGOUT', 1, 'USUARIO', NULL, NULL, 0, 0, '2024-09-12 17:30:00', 'operador1', 'Cierre de sesión', NULL),
(nextval('audit_log_id_seq'::regclass), 'PASSWORD_CHANGE', 3, 'USUARIO', NULL, NULL, 0, 0, '2024-09-11 10:00:00', 'operador3', 'Cambio de contraseña por vencimiento', NULL),

-- Más registros de turnos con diferentes estados
(nextval('audit_log_id_seq'::regclass), 'CREATE', 4, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-06 13:20:00', 'operador1', 'Turno creado por paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'RESCHEDULE', 4, 'TURNO', 'PROGRAMADO', 'PROGRAMADO', 0, 0, '2024-09-13 09:30:00', 'operador2', 'Reprogramación por solicitud del paciente', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 5, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-07 15:45:00', 'operador3', 'Turno solicitado por teléfono', NULL),
(nextval('audit_log_id_seq'::regclass), 'CANCEL', 5, 'TURNO', 'PROGRAMADO', 'CANCELADO', 0, 0, '2024-09-14 11:20:00', 'operador1', 'Cancelación por cambio de médico', NULL),

-- Registros de operaciones masivas o administrativas
(nextval('audit_log_id_seq'::regclass), 'USER_ENABLE', NULL, 'OPERADOR', NULL, NULL, 0, 0, '2024-09-10 08:00:00', 'admin', 'Activación masiva de operadores', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE', NULL, 'MEDICO', NULL, NULL, 0, 0, '2024-09-10 09:00:00', 'admin', 'Actualización masiva de horarios médicos', NULL),

-- Registros de errores o intentos fallidos
(nextval('audit_log_id_seq'::regclass), 'LOGIN', 4, 'USUARIO', NULL, 'fallido', 0, 0, '2024-09-12 09:00:00', 'operador4', 'Intento de login fallido', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 6, 'TURNO', NULL, 'fallido', 0, 0, '2024-09-08 12:00:00', 'operador1', 'Intento de crear turno en horario ocupado', NULL),

-- Registros más recientes para testing
(nextval('audit_log_id_seq'::regclass), 'CREATE', 6, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-15 10:00:00', 'operador1', 'Turno creado recientemente', NULL),
(nextval('audit_log_id_seq'::regclass), 'CONFIRM', 6, 'TURNO', 'PROGRAMADO', 'CONFIRMADO', 0, 0, '2024-09-16 14:30:00', 'operador2', 'Confirmación de turno', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 7, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-16 11:15:00', 'operador3', 'Turno para control mensual', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 8, 'TURNO', NULL, 'PROGRAMADO', 0, 0, '2024-09-17 16:45:00', 'paciente_directo', 'Turno solicitado desde app móvil', NULL),

-- Registros de auditoría para OPERADORES (continuación)
(nextval('audit_log_id_seq'::regclass), 'UPDATE', 6, 'OPERADOR', 'activo', 'activo', 0, 0, '2024-09-18 10:30:00', 'admin', 'Cambio de email corporativo', NULL),
(nextval('audit_log_id_seq'::regclass), 'USER_DISABLE', 7, 'OPERADOR', 'activo', 'inactivo', 0, 0, '2024-09-19 12:00:00', 'admin', 'Suspensión temporal por vacaciones', NULL),
(nextval('audit_log_id_seq'::regclass), 'USER_ENABLE', 8, 'OPERADOR', 'inactivo', 'activo', 0, 0, '2024-09-20 08:15:00', 'admin', 'Reactivación después de vacaciones', NULL),

-- Registros de auditoría para OBRAS SOCIALES
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'OBRA_SOCIAL', NULL, 'activo', 0, 0, '2024-08-28 09:00:00', 'admin', 'Registro de obra social', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'OBRA_SOCIAL', NULL, 'activo', 0, 0, '2024-08-28 09:15:00', 'admin', 'Registro de obra social', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 3, 'OBRA_SOCIAL', NULL, 'activo', 0, 0, '2024-08-28 09:30:00', 'admin', 'Registro de obra social', NULL),

-- Registros finales para completar el set de datos
(nextval('audit_log_id_seq'::regclass), 'CREATE', 1, 'NOTIFICACION', NULL, 'enviada', 0, 0, '2024-09-21 10:00:00', 'system', 'Notificación automática de recordatorio', NULL),
(nextval('audit_log_id_seq'::regclass), 'CREATE', 2, 'NOTIFICACION', NULL, 'enviada', 0, 0, '2024-09-21 10:05:00', 'system', 'Notificación de confirmación de turno', NULL),
(nextval('audit_log_id_seq'::regclass), 'UPDATE', 1, 'AGENDA', NULL, NULL, 0, 0, '2024-09-22 07:30:00', 'system', 'Actualización automática de agenda diaria', NULL);