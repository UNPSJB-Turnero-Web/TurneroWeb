# language: es

Característica: Gestión de Especialidades
  Como administrador del sistema,
  Quiero poder gestionar especialidades médicas,
  Para asociarlas a médicos y centros de atención.
  
  # Escenarios para crear especialidades
  Esquema del escenario: Crear una especialidad exitosamente
    Cuando el administrador crea una especialidad con el nombre "<nombre>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad creada correctamente" para la especialidad

    Ejemplos:
      | nombre                      |
      | Alergia e Inmunología       |
      | Cardiología                 |

  Esquema del escenario: Intentar crear una especialidad con nombre duplicado
    Cuando el administrador crea una especialidad con el nombre "<nombre>"
    Entonces el sistema responde con el status code 409 y el status text "Ya existe una especialidad con el nombre: <nombre>" para la especialidad

    Ejemplos:
      | nombre              |
      | Cardiología         |
      | Gastroenterología   |

  # Escenarios para listar especialidades
  Escenario: Recuperar todas las especialidades registradas en el sistema
    Dado que no existen especialidades en el sistema
    Cuando un usuario del sistema solicita la lista de especialidades
    Entonces el sistema responde con un JSON para la especialidad:
    """
    {
        "status_code": 200,
        "status_text": "Especialidades recuperadas correctamente",
        "data": [
            { "nombre": "Alergia e Inmunología" },
            { "nombre": "Cardiología" }
        ]
    }
    """

  # Escenarios para modificar especialidades
  Esquema del escenario: Modificar una especialidad exitosamente
    Dado que la especialidad "<nombre_original>" existe en el sistema
    Cuando el administrador edita la especialidad "<nombre_original>" cambiando su nombre a "<nombre_nuevo>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad editada exitosamente" para la especialidad

    Ejemplos:
      | nombre_original | nombre_nuevo         |
      | Cardiología     | Cardiología Avanzada |

  # Escenarios para eliminar especialidades
  Esquema del escenario: Eliminar una especialidad exitosamente
    Dado que la especialidad "<nombre>" existe en el sistema
    Cuando el administrador elimina la especialidad "<nombre>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad eliminada exitosamente" para la especialidad

    Ejemplos:
      | nombre                 |
      | Terapia Intensiva      |
      | Medicina Estética      |

