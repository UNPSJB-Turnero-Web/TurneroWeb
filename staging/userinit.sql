-- Script SQL para crear usuarios iniciales del sistema TurneroWeb
-- Genera 1 cuenta de cada tipo: Administrador, Paciente, Médico y Operador
-- Contraseña para todos los usuarios: "password"

-- =====================================
-- 1. INSERTAR ROLES (si no existen)
-- =====================================

INSERT INTO roles (name, display_name, description, active, created_at) VALUES
('ADMINISTRADOR', 'Administrador', 'Administrador del sistema con acceso completo', true, NOW()),
('PACIENTE', 'Paciente', 'Usuario paciente que puede solicitar turnos', true, NOW()),
('MEDICO', 'Médico', 'Profesional médico que atiende pacientes', true, NOW()),
('OPERADOR', 'Operador', 'Operador del sistema que gestiona turnos', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- =====================================
-- 2. INSERTAR OBRA SOCIAL (para paciente)
-- =====================================

INSERT INTO obra_social (id, nombre, codigo, descripcion) VALUES
(99999, 'OSDE', 'OSDE001', 'Obra Social de los Empleados de Comercio')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================
-- 3. INSERTAR ESPECIALIDAD (para médico)
-- =====================================

INSERT INTO especialidad (id, nombre, descripcion) 
SELECT 99998, 'Cardiología', 'Especialidad médica que se ocupa del corazón y sistema cardiovascular'
WHERE NOT EXISTS (SELECT 1 FROM especialidad WHERE nombre = 'Cardiología');

-- =====================================
-- 4. INSERTAR USUARIOS EN TABLA USERS
-- =====================================

-- Usuario Administrador
-- Email: admin@turnero.com, Password: password
INSERT INTO users (
    nombre, apellido, dni, email, telefono, 
    hashed_password, role_id, enabled, account_non_expired, 
    account_non_locked, credentials_non_expired, email_verified
) VALUES (
    'Carlos', 'Administrador', 11111111, 'admin@turnero.com', '+5492804111111',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'ADMINISTRADOR'), 
    true, true, true, true, true
)
ON CONFLICT (email) DO NOTHING;

-- Usuario Paciente  
-- Email: paciente@turnero.com, Password: password
INSERT INTO users (
    nombre, apellido, dni, email, telefono,
    hashed_password, role_id, enabled, account_non_expired,
    account_non_locked, credentials_non_expired, email_verified
) VALUES (
    'María', 'González', 22222222, 'paciente@turnero.com', '+5492804222222',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'PACIENTE'),
    true, true, true, true, true
)
ON CONFLICT (email) DO NOTHING;

-- Usuario Médico
-- Email: medico@turnero.com, Password: password  
INSERT INTO users (
    nombre, apellido, dni, email, telefono,
    hashed_password, role_id, enabled, account_non_expired,
    account_non_locked, credentials_non_expired, email_verified
) VALUES (
    'Dr. Juan', 'Pérez', 33333333, 'medico@turnero.com', '+5492804333333',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'MEDICO'),
    true, true, true, true, true
)
ON CONFLICT (email) DO NOTHING;

-- Usuario Operador
-- Email: operador@turnero.com, Password: password
INSERT INTO users (
    nombre, apellido, dni, email, telefono,
    hashed_password, role_id, enabled, account_non_expired,
    account_non_locked, credentials_non_expired, email_verified
) VALUES (
    'Ana', 'Operadora', 44444444, 'operador@turnero.com', '+5492804444444',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    (SELECT id FROM roles WHERE name = 'OPERADOR'),
    true, true, true, true, true
)
ON CONFLICT (email) DO NOTHING;

-- =====================================
-- 5. INSERTAR EN TABLAS ESPECÍFICAS
-- =====================================

-- Tabla Administrador (comentada - no existe en la DB actual)
-- INSERT INTO administrador (nombre, apellido, dni, email, telefono) VALUES
-- ('Carlos', 'Administrador', 11111111, 'admin@turnero.com', '+5492804111111')
-- ON CONFLICT (email) DO NOTHING;

-- Tabla Paciente
INSERT INTO paciente (id, nombre, apellido, dni, email, telefono, fecha_nacimiento, obra_social_id) 
SELECT 99997, 'María', 'González', 22222222, 'paciente@turnero.com', '+5492804222222', 
       '1990-05-15', os.id
FROM obra_social os 
WHERE os.codigo = 'OSDE001'
AND NOT EXISTS (SELECT 1 FROM paciente WHERE dni = 22222222);

-- Tabla Medico
INSERT INTO medico (id, nombre, apellido, dni, email, telefono, matricula) VALUES
(99996, 'Dr. Juan', 'Pérez', 33333333, 'medico@turnero.com', '+5492804333333', 'MP-12345')
ON CONFLICT (dni) DO NOTHING;

-- Tabla Operador
INSERT INTO operador (nombre, apellido, dni, email, telefono, activo) VALUES
('Ana', 'Operadora', 44444444, 'operador@turnero.com', '+5492804444444', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================
-- 6. RELACIONES ADICIONALES
-- =====================================

-- Relacionar médico con especialidad
INSERT INTO medico_especialidad (medico_id, especialidad_id) 
SELECT m.id, e.id
FROM medico m, especialidad e
WHERE m.dni = 33333333 
  AND e.nombre = 'Cardiología'
  AND NOT EXISTS (
    SELECT 1 FROM medico_especialidad me
    WHERE me.medico_id = m.id AND me.especialidad_id = e.id
);

-- =====================================
-- RESUMEN DE USUARIOS CREADOS:
-- =====================================
-- 
-- 1. ADMINISTRADOR:
--    Email: admin@turnero.com
--    Password: password
--    DNI: 11111111
--
-- 2. PACIENTE:
--    Email: paciente@turnero.com  
--    Password: password
--    DNI: 22222222
--    Obra Social: OSDE
--
-- 3. MÉDICO:
--    Email: medico@turnero.com
--    Password: password
--    DNI: 33333333
--    Matrícula: MP-12345
--    Especialidad: Cardiología
--
-- 4. OPERADOR:
--    Email: operador@turnero.com
--    Password: password
--    DNI: 44444444
--
-- =====================================
-- 7. ACTUALIZAR SECUENCIAS (evitar conflictos futuros)
-- =====================================

-- Actualizar secuencias para evitar conflictos con IDs futuros
SELECT setval(pg_get_serial_sequence('obra_social', 'id'), 
              COALESCE((SELECT MAX(id) FROM obra_social), 1), true);
              
SELECT setval(pg_get_serial_sequence('especialidad', 'id'), 
              COALESCE((SELECT MAX(id) FROM especialidad), 1), true);
              
SELECT setval(pg_get_serial_sequence('paciente', 'id'), 
              COALESCE((SELECT MAX(id) FROM paciente), 1), true);
              
SELECT setval(pg_get_serial_sequence('medico', 'id'), 
              COALESCE((SELECT MAX(id) FROM medico), 1), true);

-- =====================================

SELECT 'Script ejecutado exitosamente. Usuarios creados:' AS mensaje;
SELECT u.email, r.display_name as rol, u.enabled as habilitado
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email IN ('admin@turnero.com', 'paciente@turnero.com', 'medico@turnero.com', 'operador@turnero.com');