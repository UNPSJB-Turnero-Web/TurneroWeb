-- Script SQL para crear usuarios iniciales del sistema TurneroWeb
-- Genera 1 cuenta de cada tipo: Administrador, Paciente, Médico y Operador
-- Contraseña para todos los usuarios: "password"

-- =====================================
-- 1. INSERTAR ROLES (verificar si existen)
-- =====================================

INSERT INTO roles (name, display_name, description, active, created_at) 
SELECT 'ADMINISTRADOR', 'Administrador', 'Administrador del sistema con acceso completo', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMINISTRADOR');

INSERT INTO roles (name, display_name, description, active, created_at) 
SELECT 'PACIENTE', 'Paciente', 'Usuario paciente que puede solicitar turnos', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'PACIENTE');

INSERT INTO roles (name, display_name, description, active, created_at) 
SELECT 'MEDICO', 'Médico', 'Profesional médico que atiende pacientes', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'MEDICO');

INSERT INTO roles (name, display_name, description, active, created_at) 
SELECT 'OPERADOR', 'Operador', 'Operador del sistema que gestiona turnos', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'OPERADOR');

-- =====================================
-- 2. INSERTAR OBRA SOCIAL (para paciente)
-- =====================================

INSERT INTO obra_social (id, nombre, codigo, descripcion) 
SELECT 1, 'OSDE', 'OSDE001', 'Obra Social de los Empleados de Comercio'
WHERE NOT EXISTS (SELECT 1 FROM obra_social WHERE id = 1);

-- =====================================
-- 3. INSERTAR ESPECIALIDAD (para médico)
-- =====================================

INSERT INTO especialidad (id, nombre, descripcion) 
SELECT 1, 'Cardiología', 'Especialidad médica que se ocupa del corazón y sistema cardiovascular'
WHERE NOT EXISTS (SELECT 1 FROM especialidad WHERE id = 1);

-- =====================================
-- 4. INSERTAR USUARIOS EN TABLA USERS
-- =====================================

-- Usuario Administrador
INSERT INTO users (
    nombre, apellido, dni, email, telefono, 
    hashed_password, role_id, enabled, account_non_expired, 
    account_non_locked, credentials_non_expired, email_verified
) 
SELECT 
    'Carlos', 'Administrador', 11111111, 'admin@turnero.com', '+5492804111111',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'ADMINISTRADOR'), 
    true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@turnero.com');

-- Usuario Paciente  
INSERT INTO users (
    nombre, apellido, dni, email, telefono,
    hashed_password, role_id, enabled, account_non_expired,
    account_non_locked, credentials_non_expired, email_verified
) 
SELECT 
    'María', 'González', 22222222, 'paciente@turnero.com', '+5492804222222',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'PACIENTE'),
    true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'paciente@turnero.com');

-- Usuario Médico
INSERT INTO users (
    nombre, apellido, dni, email, telefono,
    hashed_password, role_id, enabled, account_non_expired,
    account_non_locked, credentials_non_expired, email_verified
) 
SELECT 
    'Dr. Juan', 'Pérez', 33333333, 'medico@turnero.com', '+5492804333333',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'MEDICO'),
    true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'medico@turnero.com');

-- Usuario Operador
INSERT INTO users (
    nombre, apellido, dni, email, telefono,
    hashed_password, role_id, enabled, account_non_expired,
    account_non_locked, credentials_non_expired, email_verified
) 
SELECT 
    'Ana', 'Operadora', 44444444, 'operador@turnero.com', '+5492804444444',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'OPERADOR'),
    true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'operador@turnero.com');

-- =====================================
-- 5. INSERTAR EN TABLAS ESPECÍFICAS
-- =====================================

-- Tabla Paciente
INSERT INTO paciente (id, nombre, apellido, dni, email, telefono, fecha_nacimiento, obra_social_id) 
SELECT 1, 'María', 'González', 22222222, 'paciente@turnero.com', '+5492804222222', 
       '1990-05-15', 1
WHERE NOT EXISTS (SELECT 1 FROM paciente WHERE id = 1);

-- Tabla Medico
INSERT INTO medico (id, nombre, apellido, dni, email, telefono, matricula) 
SELECT 1, 'Dr. Juan', 'Pérez', 33333333, 'medico@turnero.com', '+5492804333333', 'MP-12345'
WHERE NOT EXISTS (SELECT 1 FROM medico WHERE id = 1);

-- Tabla Operador
INSERT INTO operador (nombre, apellido, dni, email, telefono, activo) 
SELECT 'Ana', 'Operadora', 44444444, 'operador@turnero.com', '+5492804444444', true
WHERE NOT EXISTS (SELECT 1 FROM operador WHERE email = 'operador@turnero.com');

-- =====================================
-- 6. RELACIONES ADICIONALES
-- =====================================

-- Relacionar médico con especialidad
INSERT INTO medico_especialidad (medico_id, especialidad_id) 
SELECT 1, 1
WHERE NOT EXISTS (
    SELECT 1 FROM medico_especialidad 
    WHERE medico_id = 1 AND especialidad_id = 1
);

-- =====================================
-- 7. ACTUALIZAR SECUENCIAS
-- =====================================

SELECT setval(pg_get_serial_sequence('obra_social', 'id'), 
              COALESCE((SELECT MAX(id) FROM obra_social), 1));
              
SELECT setval(pg_get_serial_sequence('especialidad', 'id'), 
              COALESCE((SELECT MAX(id) FROM especialidad), 1));
              
SELECT setval(pg_get_serial_sequence('paciente', 'id'), 
              COALESCE((SELECT MAX(id) FROM paciente), 1));
              
SELECT setval(pg_get_serial_sequence('medico', 'id'), 
              COALESCE((SELECT MAX(id) FROM medico), 1));

-- =====================================
-- 8. VERIFICACIÓN FINAL
-- =====================================

SELECT 'Script ejecutado exitosamente. Usuarios creados:' AS mensaje;
SELECT u.email, r.display_name as rol, u.enabled as habilitado
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email IN ('admin@turnero.com', 'paciente@turnero.com', 'medico@turnero.com', 'operador@turnero.com');