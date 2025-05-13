UPDATE centro_atencion
SET latitud = 0.0, longitud = 0.0
WHERE latitud IS NULL OR longitud IS NULL;