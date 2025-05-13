DROP TABLE IF EXISTS centro_atencion CASCADE;

ALTER TABLE centro_atencion
ALTER COLUMN localidad SET NOT NULL;

ALTER TABLE centro_atencion
ALTER COLUMN provincia SET NOT NULL;

ALTER TABLE centro_atencion
ALTER COLUMN telefono SET NOT NULL;

ALTER TABLE centro_atencion
ALTER COLUMN latitud SET NOT NULL;

ALTER TABLE centro_atencion
ALTER COLUMN longitud SET NOT NULL;