-- =====================================
-- SCRIPT PARA INSERTAR MÉDICOS CON ESPECIALIDADES
-- =====================================

-- =====================================
-- 1. INSERTAR MÉDICOS DE PRUEBA (50 médicos)
-- =====================================

INSERT INTO medico (id, apellido, dni, email, nombre, telefono, matricula) VALUES
-- Cardiología (5 médicos)
(2001, 'Pérez', 12345678, 'juan.perez@turnero.com', 'Juan', '+5492804123456', 'MP12345'),
(2002, 'González', 12345679, 'carolina.gonzalez@turnero.com', 'Carolina', '+5492804123457', 'MP12346'),
(2003, 'Silva', 12345680, 'marcos.silva@turnero.com', 'Marcos', '+5492804123458', 'MP12347'),
(2004, 'Torres', 12345681, 'laura.torres@turnero.com', 'Laura', '+5492804123459', 'MP12348'),
(2005, 'Ramírez', 12345682, 'diego.ramirez@turnero.com', 'Diego', '+5492804123460', 'MP12349'),

-- Pediatría (5 médicos)
(2006, 'García', 23456789, 'maria.garcia@turnero.com', 'María', '+5492804234567', 'MP23456'),
(2007, 'López', 23456790, 'sofia.lopez@turnero.com', 'Sofía', '+5492804234568', 'MP23457'),
(2008, 'Martínez', 23456791, 'javier.martinez@turnero.com', 'Javier', '+5492804234569', 'MP23458'),
(2009, 'Rodríguez', 23456792, 'valentina.rodriguez@turnero.com', 'Valentina', '+5492804234570', 'MP23459'),
(2010, 'Fernández', 23456793, 'mateo.fernandez@turnero.com', 'Mateo', '+5492804234571', 'MP23460'),

-- Traumatología (5 médicos)
(2011, 'Rodríguez', 34567890, 'carlos.rodriguez@turnero.com', 'Carlos', '+5492804345678', 'MP34567'),
(2012, 'Sánchez', 34567891, 'andrea.sanchez@turnero.com', 'Andrea', '+5492804345679', 'MP34568'),
(2013, 'Morales', 34567892, 'gustavo.morales@turnero.com', 'Gustavo', '+5492804345680', 'MP34569'),
(2014, 'Jiménez', 34567893, 'camila.jimenez@turnero.com', 'Camila', '+5492804345681', 'MP34570'),
(2015, 'Ruiz', 34567894, 'facundo.ruiz@turnero.com', 'Facundo', '+5492804345682', 'MP34571'),

-- Ginecología (5 médicos)
(2016, 'López', 45678901, 'ana.lopez@turnero.com', 'Ana', '+5492804456789', 'MP45678'),
(2017, 'Hernández', 45678902, 'florencia.hernandez@turnero.com', 'Florencia', '+5492804456790', 'MP45679'),
(2018, 'Díaz', 45678903, 'manuel.diaz@turnero.com', 'Manuel', '+5492804456791', 'MP45680'),
(2019, 'Vargas', 45678904, 'lucia.vargas@turnero.com', 'Lucía', '+5492804456792', 'MP45681'),
(2020, 'Castro', 45678905, 'agustin.castro@turnero.com', 'Agustín', '+5492804456793', 'MP45682'),

-- Neurología (5 médicos)
(2021, 'Martínez', 56789012, 'roberto.martinez@turnero.com', 'Roberto', '+5492804567890', 'MP56789'),
(2022, 'Gómez', 56789013, 'elena.gomez@turnero.com', 'Elena', '+5492804567891', 'MP56790'),
(2023, 'Álvarez', 56789014, 'pablo.alvarez@turnero.com', 'Pablo', '+5492804567892', 'MP56791'),
(2024, 'Romero', 56789015, 'mariajose.romero@turnero.com', 'María José', '+5492804567893', 'MP56792'),
(2025, 'Navarro', 56789016, 'santiago.navarro@turnero.com', 'Santiago', '+5492804567894', 'MP56793'),

-- Medicina General (5 médicos)
(2026, 'Fernández', 67890123, 'luis.fernandez@turnero.com', 'Luis', '+5492804678901', 'MP67890'),
(2027, 'Moreno', 67890124, 'catalina.moreno@turnero.com', 'Catalina', '+5492804678902', 'MP67891'),
(2028, 'Alonso', 67890125, 'tomas.alonso@turnero.com', 'Tomás', '+5492804678903', 'MP67892'),
(2029, 'Gutierrez', 67890126, 'isabella.gutierrez@turnero.com', 'Isabella', '+5492804678904', 'MP67893'),
(2030, 'Ramos', 67890127, 'benjamin.ramos@turnero.com', 'Benjamín', '+5492804678905', 'MP67894'),

-- Oftalmología (4 médicos)
(2031, 'Sosa', 78901234, 'miguel.sosa@turnero.com', 'Miguel', '+5492804789012', 'MP78901'),
(2032, 'Acosta', 78901235, 'antonella.acosta@turnero.com', 'Antonella', '+5492804789013', 'MP78902'),
(2033, 'Reyes', 78901236, 'lucas.reyes@turnero.com', 'Lucas', '+5492804789014', 'MP78903'),
(2034, 'Flores', 78901237, 'emilia.flores@turnero.com', 'Emilia', '+5492804789015', 'MP78904'),

-- Dermatología (4 médicos)
(2035, 'Mendoza', 89012345, 'nicolas.mendoza@turnero.com', 'Nicolás', '+5492804890123', 'MP89012'),
(2036, 'Ortiz', 89012346, 'martina.ortiz@turnero.com', 'Martina', '+5492804890124', 'MP89013'),
(2037, 'Delgado', 89012347, 'thiago.delgado@turnero.com', 'Thiago', '+5492804890125', 'MP89014'),
(2038, 'Pérez', 89012348, 'olivia.perez@turnero.com', 'Olivia', '+5492804890126', 'MP89015'),

-- Otorrinolaringología (3 médicos)
(2039, 'Cabrera', 90123456, 'matias.cabrera@turnero.com', 'Matías', '+5492804901234', 'MP90123'),
(2040, 'Vega', 90123457, 'abril.vega@turnero.com', 'Abril', '+5492804901235', 'MP90124'),
(2041, 'Santos', 90123458, 'joaquin.santos@turnero.com', 'Joaquín', '+5492804901236', 'MP90125'),

-- Psiquiatría (3 médicos)
(2042, 'Luna', 11234567, 'bianca.luna@turnero.com', 'Bianca', '+5492804112345', 'MP11234'),
(2043, 'Guerrero', 11234568, 'felipe.guerrero@turnero.com', 'Felipe', '+5492804112346', 'MP11235'),
(2044, 'Herrera', 11234569, 'celeste.herrera@turnero.com', 'Celeste', '+5492804112347', 'MP11236'),

-- Gastroenterología (2 médicos)
(2045, 'Medina', 22345678, 'alexander.medina@turnero.com', 'Alexander', '+5492804223456', 'MP22345'),
(2046, 'Cortés', 22345679, 'renata.cortes@turnero.com', 'Renata', '+5492804223457', 'MP22346'),

-- Endocrinología (2 médicos)
(2047, 'Ponce', 33456789, 'victoria.ponce@turnero.com', 'Victoria', '+5492804334567', 'MP33456'),
(2048, 'Salazar', 33456790, 'maximiliano.salazar@turnero.com', 'Maximiliano', '+5492804334568', 'MP33457'),

-- Nefrología (1 médico)
(2049, 'Ríos', 44567890, 'valentin.rios@turnero.com', 'Valentín', '+5492804445678', 'MP44567'),

-- Neumonología (1 médico)
(2050, 'Molina', 55678901, 'sara.molina@turnero.com', 'Sara', '+5492804556789', 'MP55678')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 2. INSERTAR RELACIONES MÉDICO-ESPECIALIDAD
-- =====================================

-- Cardiología (IDs 2001-2005)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2001), (2002), (2003), (2004), (2005)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%cardi%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Pediatría (IDs 2006-2010)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2006), (2007), (2008), (2009), (2010)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%pediat%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Traumatología (IDs 2011-2015)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2011), (2012), (2013), (2014), (2015)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%traumat%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Ginecología (IDs 2016-2020)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2016), (2017), (2018), (2019), (2020)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%ginec%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Neurología (IDs 2021-2025)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2021), (2022), (2023), (2024), (2025)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%neurol%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Medicina General (IDs 2026-2030)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2026), (2027), (2028), (2029), (2030)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%general%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Oftalmología (IDs 2031-2034)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2031), (2032), (2033), (2034)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%oftalm%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Dermatología (IDs 2035-2038)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2035), (2036), (2037), (2038)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%dermat%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Otorrinolaringología (IDs 2039-2041)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2039), (2040), (2041)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%otorr%' OR LOWER(nombre) LIKE '%rino%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Psiquiatría (IDs 2042-2044)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2042), (2043), (2044)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%psiqu%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Gastroenterología (IDs 2045-2046)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2045), (2046)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%gastro%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Endocrinología (IDs 2047-2048)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id 
FROM (VALUES (2047), (2048)) AS m(id)
CROSS JOIN (SELECT id FROM especialidad WHERE LOWER(nombre) LIKE '%endocr%' LIMIT 1) AS e
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Nefrología (ID 2049)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT 2049, id FROM especialidad WHERE LOWER(nombre) LIKE '%nefrol%' LIMIT 1
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;

-- Neumonología (ID 2050)
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT 2050, id FROM especialidad WHERE LOWER(nombre) LIKE '%neum%' OR LOWER(nombre) LIKE '%pulmon%' LIMIT 1
ON CONFLICT (medico_id, especialidad_id) DO NOTHING;