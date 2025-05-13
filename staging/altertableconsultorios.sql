-- Deshabilitar temporalmente las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS = 0;

-- Generar y ejecutar dinámicamente los comandos DROP TABLE para todas las tablas
SELECT CONCAT('DROP TABLE IF EXISTS `', table_name, '`;')
FROM information_schema.tables
WHERE table_schema = DATABASE();

-- Habilitar nuevamente las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS = 1;