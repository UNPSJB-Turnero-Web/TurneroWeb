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
Cuando el administrador crea un esquema de turno con "<medico>", <intervalo>, "<consultorio>"
    Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | medico             | intervalo | consultorio    | status_code | status_text                          |
    | Cecilia Morales    | 30        | Consultorio 1  | 200         | Esquema de turno creado correctamente |
    | Gustavo González   | 20        | Consultorio 2  | 200         | Esquema de turno creado correctamente |
    | Gabriela Torres    | 15        | Consultorio 3  | 200         | Esquema de turno creado correctamente |
    | Carlos López       | 60        | Consultorio 4  | 200         | Esquema de turno creado correctamente |

Esquema del escenario: Crear una agenda sin conflictos
Dado que el administrador configura la agenda del "<consultorio>"
Y define el horario de atención de "<horaInicio>" a "<horaFin>" de lunes a viernes
Y asigna al Dr. "<medico>" con especialidad "<especialidad>"
Cuando guarda la configuración
Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | consultorio    | horaInicio | horaFin | medico           | especialidad         | status_code | status_text       |
    | Consultorio 1  | 08:00      | 14:00   | Cecilia Morales  | Medicina Estética    | 200         | OK                |
    | Consultorio 2  | 09:00      | 13:00   | Gustavo González | Cardiología          | 200         | OK                |
    | Consultorio 3  | 10:00      | 12:00   | Gabriela Torres  | Medicina General     | 200         | OK                |

        Esquema del escenario: Intentar asignar horarios en conflicto en el mismo consultorio
    Dado que el administrador configura la agenda del "<consultorio>"
    Y define el horario de atención de "<horaInicio>" a "<horaFin>" para el Dr. "<medico>"
    Y luego intenta asignar al Dr. "<medicoConflicto>" de "<horaInicioConflicto>" a "<horaFinConflicto>" en el mismo consultorio
    Cuando guarda la configuración
    Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda
    
    Ejemplos:
        | consultorio    | horaInicio | horaFin | medico           | medicoConflicto  | horaInicioConflicto | horaFinConflicto | status_code | status_text                           |
        | Consultorio 3  | 08:00      | 12:00   | Mario Rodríguez  | Cecilia Morales  | 09:00               | 11:00            | 409         | Conflicto de horarios en el consultorio |

                Esquema del escenario: Intentar asignar a un médico en dos consultorios a la misma hora
        Dado que el Dr. "<medico>" está asignado al "<consultorio1>" de "<horaInicio>" a "<horaFin>"
        Cuando el administrador intenta asignarlo al "<consultorio2>" a la misma hora
        Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda
        
        Ejemplos:
            | medico           | consultorio1    | horaInicio | horaFin | consultorio2    | status_code | status_text                                |
            | Mario Rodríguez  | Consultorio 3  | 08:00      | 12:00   | Consultorio 4   | 409         | El médico ya está asignado en otro consultorio |
            | Cecilia Morales  | Consultorio 1  | 09:00      | 13:00   | Consultorio 2   | 409         | El médico ya está asignado en otro consultorio |
