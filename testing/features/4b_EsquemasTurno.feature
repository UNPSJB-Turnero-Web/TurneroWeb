# language: es

Característica: Crear esquemas de turno

Antecedentes:
  Dado que existe un sistema de gestión de esquemas de turno
  Y que existen disponibilidades médicas registradas para esquemas de turno
  Y que existen consultorios disponibles en los centros de atención

Esquema del escenario: Crear un esquema de turno exitosamente
  Cuando el administrador crea un esquema de turno para el médico con matrícula "<matricula>" en el centro "<centro_id>" con los siguientes datos:
    | intervalo | consultorio_id | disponibilidad_id | horarios                           |
    | <intervalo> | <consultorio_id> | <disponibilidad_id> | <dia>:<inicio>-<fin>         |
  Entonces el sistema responde con <status_code> y "<status_text>" para esquemas de turno

Ejemplos: Esquemas de turno exitosos
  | matricula | centro_id | intervalo | consultorio_id | disponibilidad_id | dia       | inicio | fin   | status_code | status_text                           |
  | 20735-0   | 1         | 15        | 1              | 1                 | LUNES     | 08:00  | 12:00 | 200         | Esquema de turno creado correctamente |
  | 87698-3   | 1         | 30        | 2              | 2                 | MARTES    | 14:00  | 18:00 | 200         | Esquema de turno creado correctamente |
  | 52188-5   | 2         | 20        | 3              | 3                 | MIÉRCOLES | 09:00  | 13:00 | 200         | Esquema de turno creado correctamente |
  | 99281-1   | 2         | 15        | 4              | 4                 | JUEVES    | 15:00  | 19:00 | 200         | Esquema de turno creado correctamente |
  | 47904-3   | 3         | 45        | 5              | 5                 | VIERNES   | 07:00  | 11:00 | 200         | Esquema de turno creado correctamente |

Esquema del escenario: Crear esquema de turno con múltiples horarios
  Cuando el administrador crea un esquema de turno para el médico con matrícula "13311-4" en el centro "1" con los siguientes horarios:
    | intervalo | consultorio_id | disponibilidad_id | dia     | horaInicio | horaFin |
    | 15        | 1              | 6                 | LUNES   | 08:00      | 12:00   |
    | 15        | 1              | 6                 | LUNES   | 14:00      | 18:00   |
    | 15        | 1              | 6                 | MARTES  | 09:00      | 13:00   |
  Entonces el sistema responde con 200 y "Esquema de turno creado correctamente" para esquemas de turno

Esquema del escenario: Crear esquema de turno con errores de validación
  Cuando el administrador crea un esquema de turno para el médico con matrícula "<matricula>" en el centro "<centro_id>" con los siguientes datos:
    | intervalo | consultorio_id | disponibilidad_id | dia    | horaInicio | horaFin |
    | <intervalo> | <consultorio_id> | <disponibilidad_id> | <dia>  | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para esquemas de turno

Ejemplos: Esquemas de turno con errores
  | matricula  | centro_id | intervalo | consultorio_id | disponibilidad_id | dia       | inicio | fin   | status_code | status_text                                    |
  | 99999-9    | 1         | 15        | 1              | 1                 | LUNES     | 08:00  | 12:00 | 400         | No existe el médico con esa matrícula          |
  | 20735-0    | 999       | 15        | 1              | 1                 | LUNES     | 08:00  | 12:00 | 400         | No existe el centro de atención especificado  |
  | 20735-0    | 1         | 0         | 1              | 1                 | LUNES     | 08:00  | 12:00 | 400         | El intervalo debe ser mayor a 0 minutos        |
  | 20735-0    | 1         | 15        | 999            | 1                 | LUNES     | 08:00  | 12:00 | 400         | No existe el consultorio especificado         |
  | 20735-0    | 1         | 15        | 1              | 999               | LUNES     | 08:00  | 12:00 | 400         | No existe la disponibilidad médica especificada |
  | 20735-0    | 1         | 15        | 1              | 1                 |           | 08:00  | 12:00 | 400         | El día de la semana es obligatorio             |
  | 20735-0    | 1         | 15        | 1              | 1                 | LUNES     |        | 12:00 | 400         | La hora de inicio es obligatoria               |
  | 20735-0    | 1         | 15        | 1              | 1                 | LUNES     | 08:00  |       | 400         | La hora de fin es obligatoria                  |
  | 20735-0    | 1         | 15        | 1              | 1                 | LUNES     | 18:00  | 12:00 | 400         | La hora de fin debe ser posterior al inicio    |
  | 20735-0    | 1         | 200       | 1              | 1                 | LUNES     | 08:00  | 12:00 | 400         | El intervalo no puede ser mayor a 120 minutos  |

Esquema del escenario: Validar compatibilidad con disponibilidad médica
  Cuando el administrador crea un esquema de turno para el médico con matrícula "<matricula>" en el centro "<centro_id>" con horarios que <compatibilidad> con la disponibilidad médica:
    | intervalo | consultorio_id | disponibilidad_id | dia    | horaInicio | horaFin |
    | 15        | 1              | <disponibilidad_id> | <dia>  | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para esquemas de turno

Ejemplos: Compatibilidad con disponibilidad médica
  | matricula | centro_id | disponibilidad_id | dia    | inicio | fin   | compatibilidad      | status_code | status_text                                           |
  | 20735-0   | 1         | 1                 | LUNES  | 08:00  | 12:00 | son compatibles     | 200         | Esquema de turno creado correctamente                 |
  | 20735-0   | 1         | 1                 | MARTES | 08:00  | 12:00 | no son compatibles  | 400         | El esquema no es compatible con la disponibilidad médica |
  | 20735-0   | 1         | 1                 | LUNES  | 06:00  | 14:00 | se superponen       | 400         | El horario excede la disponibilidad del médico       |

Esquema del escenario: Validar compatibilidad con horarios de consultorio
  Cuando el administrador crea un esquema de turno para el consultorio "<consultorio_id>" con horarios que <situacion_consultorio> con el horario de atención del consultorio:
    | matricula | centro_id | intervalo | consultorio_id | disponibilidad_id | dia    | horaInicio | horaFin |
    | 20735-0   | 1         | 15        | <consultorio_id> | 1               | <dia>  | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para esquemas de turno

Ejemplos: Compatibilidad con horarios de consultorio
  | consultorio_id | dia       | inicio | fin   | situacion_consultorio                | status_code | status_text                                                |
  | 1              | LUNES     | 08:00  | 12:00 | están dentro del horario             | 200         | Esquema de turno creado correctamente                      |
  | 1              | LUNES     | 06:00  | 08:00 | están antes del horario              | 400         | El horario del esquema está fuera del horario del consultorio |
  | 1              | LUNES     | 18:00  | 20:00 | están después del horario            | 400         | El horario del esquema está fuera del horario del consultorio |
  | 1              | LUNES     | 07:00  | 13:00 | se extienden fuera del horario       | 400         | El horario del esquema excede el horario del consultorio   |
  | 2              | DOMINGO   | 08:00  | 12:00 | el consultorio está cerrado          | 400         | El consultorio no atiende en el día especificado          |

Esquema del escenario: Validar triple compatibilidad (médico, consultorio y disponibilidad)
  Cuando el administrador crea un esquema de turno con triple validación para el médico con matrícula "<matricula>":
    | centro_id | intervalo | consultorio_id | disponibilidad_id | dia    | horaInicio | horaFin |
    | 1         | 15        | <consultorio_id> | <disponibilidad_id> | <dia> | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para esquemas de turno

Ejemplos: Triple compatibilidad
  | matricula | consultorio_id | disponibilidad_id | dia     | inicio | fin   | status_code | status_text                                                    |
  | 20735-0   | 1              | 1                 | LUNES   | 09:00  | 11:00 | 200         | Esquema de turno creado correctamente                          |
  | 20735-0   | 1              | 2                 | MARTES  | 09:00  | 11:00 | 400         | La disponibilidad no corresponde al médico especificado       |
  | 20735-0   | 1              | 1                 | MARTES  | 09:00  | 11:00 | 400         | El médico no tiene disponibilidad en ese día                  |
  | 20735-0   | 1              | 1                 | LUNES   | 06:00  | 08:00 | 400         | El horario está fuera de los horarios del consultorio         |
  | 20735-0   | 1              | 1                 | LUNES   | 13:00  | 15:00 | 400         | El horario excede la disponibilidad del médico                |

Escenario: Recuperar todos los esquemas de turno registrados
  Dado que existen esquemas de turno registrados en el sistema
  Cuando un usuario del sistema solicita la lista de esquemas de turno
  Entonces el sistema responde con un JSON de esquemas de turno:
  """
  {
    "status_code": 200,
    "status_text": "Esquemas de turno recuperados correctamente",
    "data": [
      {
        "id": 1,
        "intervalo": 15,
        "disponibilidadMedicoId": 1,
        "staffMedicoId": 1,
        "centroId": 1,
        "consultorioId": 1,
        "horarios": [
          {
            "dia": "LUNES",
            "horaInicio": "08:00",
            "horaFin": "12:00"
          }
        ],
        "horariosDisponibilidad": [
          {
            "dia": "LUNES",
            "horaInicio": "08:00:00",
            "horaFin": "12:00:00"
          }
        ]
      }
    ]
  }
  """

Escenario: Recuperar esquemas de turno por centro de atención
  Dado que existen esquemas de turno registrados en el sistema
  Cuando un usuario solicita los esquemas de turno del centro de atención con ID "1"
  Entonces el sistema responde con un JSON de esquemas de turno del centro:
  """
  {
    "status_code": 200,
    "status_text": "Esquemas de turno del centro recuperados correctamente",
    "data": [
      {
        "id": 1,
        "intervalo": 15,
        "disponibilidadMedicoId": 1,
        "staffMedicoId": 1,
        "centroId": 1,
        "consultorioId": 1,
        "horarios": [
          {
            "dia": "LUNES",
            "horaInicio": "08:00",
            "horaFin": "12:00"
          }
        ]
      }
    ]
  }
  """

Escenario: Redistribuir consultorios de esquemas existentes
  Dado que existen esquemas de turno con consultorios asignados en un centro
  Y que los médicos tienen porcentajes de distribución configurados
  Cuando el administrador solicita redistribuir los consultorios del centro "1"
  Entonces el sistema responde con un JSON de redistribución:
  """
  {
    "status_code": 200,
    "status_text": "Redistribución completada. 5 esquemas procesados.",
    "data": 5
  }
  """

Esquema del escenario: Actualizar esquema de turno existente
  Cuando el administrador actualiza el esquema de turno con ID "<esquema_id>" con los siguientes datos:
    | campo             | valor_anterior | valor_nuevo |
    | <campo>           | <anterior>     | <nuevo>     |
  Entonces el sistema responde con <status_code> y "<status_text>" para actualización de esquemas

Ejemplos: Actualizaciones de esquemas de turno
  | esquema_id | campo          | anterior | nuevo | status_code | status_text                              |
  | 1          | intervalo      | 15       | 30    | 200         | Esquema de turno actualizado correctamente |
  | 1          | consultorioId  | 1        | 2     | 200         | Esquema de turno actualizado correctamente |
  | 999        | intervalo      | 15       | 30    | 404         | No se encontró el esquema de turno         |

Escenario: Eliminar esquema de turno
  Dado que existe un esquema de turno con ID "1"
  Cuando el administrador elimina el esquema de turno con ID "1"
  Entonces el sistema responde con 200 y "Esquema de turno eliminado correctamente" para eliminación
  Y el esquema de turno ya no existe en el sistema

Esquema del escenario: Validar conflictos de horarios en consultorios
  Cuando el administrador intenta crear un esquema de turno que <situacion_conflicto> con otro esquema existente:
    | matricula | centro_id | intervalo | consultorio_id | dia    | horaInicio | horaFin |
    | <matricula> | 1       | 15        | <consultorio_id> | <dia> | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para esquemas de turno

Ejemplos: Conflictos de horarios en consultorios
  | matricula | consultorio_id | dia    | inicio | fin   | situacion_conflicto           | status_code | status_text                                      |
  | 87698-3   | 1              | LUNES  | 08:00  | 12:00 | no tiene conflicto            | 200         | Esquema de turno creado correctamente            |
  | 52188-5   | 1              | LUNES  | 10:00  | 14:00 | se superpone parcialmente     | 400         | Conflicto de horarios en el consultorio          |
  | 99281-1   | 1              | LUNES  | 08:00  | 12:00 | tiene el mismo horario        | 400         | Ya existe un esquema en ese horario y consultorio |
  | 47904-3   | 2              | LUNES  | 08:00  | 12:00 | usa diferente consultorio     | 200         | Esquema de turno creado correctamente            |