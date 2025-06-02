# language: es
Característica: Configuración de Agendas


Esquema del escenario: Crear disponibilidad médica
Cuando el administrador crea una disponibilidad médica con "<medico>", "<horarios>"
    Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | medico             | horarios                                                                                     | status_code | status_text                          |
    | Cecilia Morales    | [{\"dia\":\"LUNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"16:00\"},{\"dia\":\"MARTES\",\"horaInicio\":\"08:00\",\"horaFin\":\"16:00\"},{\"dia\":\"MIERCOLES\",\"horaInicio\":\"08:00\",\"horaFin\":\"16:00\"}] | 200         | Disponibilidad creada correctamente  |
    | Gustavo González   | [{\"dia\":\"LUNES\",\"horaInicio\":\"09:00\",\"horaFin\":\"13:00\"},{\"dia\":\"MIERCOLES\",\"horaInicio\":\"09:00\",\"horaFin\":\"13:00\"}] | 200         | Disponibilidad creada correctamente  |
    | Gabriela Torres    | [{\"dia\":\"MARTES\",\"horaInicio\":\"10:00\",\"horaFin\":\"12:00\"},{\"dia\":\"JUEVES\",\"horaInicio\":\"10:00\",\"horaFin\":\"12:00\"}] | 200         | Disponibilidad creada correctamente  |
    | Carlos López    | [{\"dia\":\"VIERNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}]                                   | 200         | Disponibilidad creada correctamente  |
    | Cecilia Morales    | [{\"dia\":\"LUNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"16:00\"},{\"dia\":\"MARTES\",\"horaInicio\":\"08:00\",\"horaFin\":\"16:00\"},{\"dia\":\"MIERCOLES\",\"horaInicio\":\"08:00\",\"horaFin\":\"16:00\"}] | 409         | Ya existe una disponibilidad para este staff médico en el mismo día y horario.  |
    | Gabriela Torres    | [{\"dia\":\"MARTES\",\"horaInicio\":\"10:00\",\"horaFin\":\"09:00\"}]                                    | 400         | Error al crear la disponibilidad: La hora de inicio no puede ser mayor a la hora de fin. |
    | Cecilia Morales    | []                                                                                           | 400         | Error al crear la disponibilidad: Debe proporcionar al menos un día y horario.            |



Esquema del escenario: Crear esquema de turno
Cuando el administrador crea un esquema de turno con "<medico>", <intervalo>, "<consultorio>", "<horarios>"
    Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | medico             | intervalo | consultorio        | horarios                                                                                     | status_code | status_text                          |
    | Cecilia Morales    | 20        | Consultorio 1      | [{\"dia\":\"LUNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"},{\"dia\":\"MARTES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}] | 200         | Esquema de turno creado correctamente |
    | Gustavo González   | 30        | Consultorio 2      | [{\"dia\":\"MIERCOLES\",\"horaInicio\":\"09:00\",\"horaFin\":\"13:00\"}]                                                             | 200         | Esquema de turno creado correctamente |
    | Gabriela Torres    | 15        | Consultorio 3      | [{\"dia\":\"JUEVES\",\"horaInicio\":\"10:00\",\"horaFin\":\"14:00\"}]                                                               | 200         | Esquema de turno creado correctamente |
    | Carlos López       | 10        | Consultorio Norte  | [{\"dia\":\"VIERNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}]                                                              | 200         | Esquema de turno creado correctamente |
    | Cecilia Morales    | 0         | Consultorio 1      | [{\"dia\":\"LUNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}]                                                               | 400         | Error al crear el esquema de turno: El intervalo debe ser positivo |
    | Gustavo González   | -10       | Consultorio 2      | [{\"dia\":\"MIERCOLES\",\"horaInicio\":\"09:00\",\"horaFin\":\"13:00\"}]                                                           | 400         | Error al crear el esquema de turno: El intervalo debe ser positivo |
    | Gabriela Torres    | 15        | Consultorio X      | [{\"dia\":\"JUEVES\",\"horaInicio\":\"10:00\",\"horaFin\":\"14:00\"}]                                                               | 400         | Error al crear el esquema de turno: El consultorio no existe. |
    | Carlos López       | 60        |                    | [{\"dia\":\"VIERNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}]                                                              | 400         | Error al crear el esquema de turno: El campo consultorio es obligatorio. |
    |                    | 30        | Consultorio 1      | [{\"dia\":\"LUNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}]                                                               | 400         | Error al crear el esquema de turno: El campo staffMedicoId es obligatorio. |
    | Cecilia Morales    | 30        | Consultorio 1      | [{\"dia\":\"LUNES\",\"horaInicio\":\"08:00\",\"horaFin\":\"12:00\"}]                                                               | 409         | Conflicto: Esquema ya existe. |



Esquema del escenario: Generar agenda basada en esquema de turno
Cuando el administrador genera una agenda con "<esquemaTurnoId>", "<fecha>", "<horaInicio>", "<horaFin>"
Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | esquemaTurnoId | fecha       | horaInicio | horaFin  | status_code | status_text                          |
    | 1              | 2025-05-26 | 08:00      | 12:00    | 200         | Agenda generada correctamente        |
    | 2              | 2025-05-27 | 09:00      | 13:00    | 200         | Agenda generada correctamente        |
    | 3              | 2025-05-28 | 10:00      | 14:00    | 200         | Agenda generada correctamente        |
    | 4              | 2025-05-29 | 08:00      | 12:00    | 400         | Error al generar la agenda: Esquema de turno no encontrado |
    | 1              | 2025-05-26 | 12:00      | 08:00    | 400         | Error al generar la agenda: La hora de inicio no puede ser mayor a la hora de fin |
    | 1              | 2025-05-26 | 08:00      | 12:00    | 409         | Ya existe una agenda en ese horario para este consultorio |