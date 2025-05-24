CREATE TABLE centro_especialidad (
    especialidad_id INT NOT NULL,
    centro_atencion_id INT NOT NULL,
    PRIMARY KEY (especialidad_id, centro_atencion_id),
    FOREIGN KEY (especialidad_id) REFERENCES especialidad(id),
    FOREIGN KEY (centro_atencion_id) REFERENCES centro_atencion(id)
);