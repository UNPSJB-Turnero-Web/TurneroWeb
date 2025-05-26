# language: es
Característica: Configuración de Agendas


Esquema del escenario: Crear disponibilidad médica
Cuando el administrador crea una disponibilidad médica con "<medico>", "<horaInicio>", "<horaFin>", "<diaSemana>"
    Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | medico             | horaInicio | horaFin | diaSemana                     | status_code | status_text                          |
    | Cecilia Morales    | 08:00      | 16:00   | LUNES, MARTES, MIERCOLES | 200         | Disponibilidad creada correctamente  |
    | Gustavo González   | 09:00      | 13:00   | LUNES, MIERCOLES         | 200         | Disponibilidad creada correctamente  |
    | Gabriela Torres    | 10:00      | 12:00   | MARTES, JUEVES           | 200         | Disponibilidad creada correctamente  |
    | Mario Rodríguez    | 08:00      | 12:00   | VIERNES                  | 200         | Disponibilidad creada correctamente  |
    | Cecilia Morales    | 08:00      | 16:00   | LUNES, MARTES, MIERCOLES | 409         | Conflicto: Disponibilidad ya existe  |
    | Gabriela Torres    | 10:00      | 09:00   | MARTES                   | 400         | Hora de inicio no puede ser mayor a hora de fin |
    | Cecilia Morales    | 08:00      | 16:00   |                          | 400         | Los días son obligatorios            |




Esquema del escenario: Crear esquema de turno
Cuando el administrador crea un esquema de turno con "<medico>", "<horaInicio>", "<horaFin>", "<intervalo>", "<diaSemana>"
    Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda

Ejemplos:
    | medico             | horaInicio | horaFin | intervalo | diaSemana                     | status_code | status_text                          |
    | Cecilia Morales    | 08:00      | 14:00   | 30        | LUNES, MARTES, MIERCOLES | 200         | Esquema de turno creado correctamente |
    | Gustavo González   | 09:00      | 13:00   | 20        | LUNES, MIERCOLES         | 200         | Esquema de turno creado correctamente |
    | Gabriela Torres    | 10:00      | 12:00   | 15        | MARTES, JUEVES           | 200         | Esquema de turno creado correctamente |
    | Mario Rodríguez    | 08:00      | 12:00   | 60        | VIERNES                  | 200         | Esquema de turno creado correctamente |
    | Cecilia Morales    | 08:00      | 14:00   | 30        | LUNES, MARTES, MIERCOLES | 409         | Conflicto: Esquema ya existe         |
    | Gabriela Torres    | 10:00      | 09:00   | 15        | MARTES                   | 400         | Hora de inicio no puede ser mayor a hora de fin |
    | Cecilia Morales    | 08:00      | 14:00   | 30        |                          | 400         | Los días son obligatorios            |
    | Cecilia Morales    | 08:00      | 14:00   | -10       | LUNES, MARTES            | 400         | El intervalo debe ser positivo       |


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
        | Consultorio 2  | 09:00      | 13:00   | Gustavo González | Gabriela Torres  | 10:00               | 12:00            | 409         | Conflicto de horarios en el consultorio |
        | Consultorio 3  | 08:00      | 12:00   | Mario Rodríguez  | Cecilia Morales  | 09:00               | 11:00            | 409         | Conflicto de horarios en el consultorio |

                Esquema del escenario: Intentar asignar a un médico en dos consultorios a la misma hora
        Dado que el Dr. "<medico>" está asignado al "<consultorio1>" de "<horaInicio>" a "<horaFin>"
        Cuando el administrador intenta asignarlo al "<consultorio2>" a la misma hora
        Entonces el sistema responde con status_code <status_code> y status_text "<status_text>" para agenda
        
        Ejemplos:
            | medico           | consultorio1    | horaInicio | horaFin | consultorio2    | status_code | status_text                                |
            | Mario Rodríguez  | Consultorio 3  | 08:00      | 12:00   | Consultorio 4   | 409         | El médico ya está asignado en otro consultorio |
            | Cecilia Morales  | Consultorio 1  | 09:00      | 13:00   | Consultorio 2   | 409         | El médico ya está asignado en otro consultorio |
