# language: es

Característica: Crear disponibilidades de médicos

Antecedentes:
  Dado que existe un sistema de gestión de disponibilidades médicas

Esquema del escenario: Crear una disponibilidad médica exitosamente
  Cuando el administrador crea una disponibilidad para el médico con matrícula "<matricula>" con los siguientes horarios:
    | dia    | horaInicio | horaFin |
    | <dia>  | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para disponibilidades

Ejemplos: Disponibilidades médicas exitosas
  | matricula | dia       | inicio | fin   | status_code | status_text                              |
  | 20735-0   | LUNES     | 08:00  | 12:00 | 200         | Disponibilidad creada correctamente     |
  | 87698-3   | MARTES    | 14:00  | 18:00 | 200         | Disponibilidad creada correctamente     |
  | 52188-5   | MIÉRCOLES | 09:00  | 13:00 | 200         | Disponibilidad creada correctamente     |
  | 99281-1   | JUEVES    | 15:00  | 19:00 | 200         | Disponibilidad creada correctamente     |
  | 47904-3   | VIERNES   | 07:00  | 11:00 | 200         | Disponibilidad creada correctamente     |
  | 19123-8   | SÁBADO    | 10:00  | 14:00 | 200         | Disponibilidad creada correctamente     |

Esquema del escenario: Crear múltiples horarios para un médico
  Cuando el administrador crea una disponibilidad para el médico con matrícula "13311-4" con los siguientes horarios:
    | dia     | horaInicio | horaFin |
    | LUNES   | 08:00      | 12:00   |
    | LUNES   | 14:00      | 18:00   |
    | MARTES  | 09:00      | 13:00   |
  Entonces el sistema responde con 200 y "Disponibilidad creada correctamente" para disponibilidades

Esquema del escenario: Crear disponibilidad con errores
  Cuando el administrador crea una disponibilidad para el médico con matrícula "<matricula>" con los siguientes horarios:
    | dia    | horaInicio | horaFin |
    | <dia>  | <inicio>   | <fin>   |
  Entonces el sistema responde con <status_code> y "<status_text>" para disponibilidades

Ejemplos: Disponibilidades con errores
  | matricula  | dia       | inicio | fin   | status_code | status_text                               |
  | 99999-9    | LUNES     | 08:00  | 12:00 | 400         | No existe el médico con esa matrícula     |
  | 20735-0    |           | 08:00  | 12:00 | 400         | El día de la semana es obligatorio        |
  | 20735-0    | LUNES     |        | 12:00 | 400         | La hora de inicio es obligatoria          |
  | 20735-0    | LUNES     | 08:00  |       | 400         | La hora de fin es obligatoria             |
  | 20735-0    | LUNES     | 18:00  | 12:00 | 400         | La hora de fin debe ser posterior al inicio |
  | 20735-0    | LUNESSSS  | 08:00  | 12:00 | 400         | El día de la semana no es válido          |

Escenario: Recuperar todas las disponibilidades médicas registradas
  Dado que existen disponibilidades médicas registradas en el sistema
  Cuando un usuario del sistema solicita la lista de disponibilidades médicas
  Entonces el sistema responde con un JSON de disponibilidades:
  """
  {
    "status_code": 200,
    "status_text": "Disponibilidades recuperadas correctamente",
    "data": [
      {
        "id": 1,
        "staffMedicoId": 1,
        "horarios": [
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

Escenario: Recuperar disponibilidades de un médico específico
  Dado que existen disponibilidades médicas registradas en el sistema
  Cuando un usuario solicita las disponibilidades del médico con matrícula "20735-0"
  Entonces el sistema responde con un JSON de disponibilidades del médico:
  """
  {
    "status_code": 200,
    "status_text": "Disponibilidades del staff médico recuperadas correctamente",
    "data": [
      {
        "id": 1,
        "staffMedicoId": 1,
        "horarios": [
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