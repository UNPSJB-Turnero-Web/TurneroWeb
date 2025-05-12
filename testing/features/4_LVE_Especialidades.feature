# language: es

Característica: Gestión de Especialidades
  Como administrador del sistema,
  Quiero poder gestionar especialidades médicas,
  Para asociarlas a médicos y centros de atención.

  # Escenarios para crear especialidades
  Esquema del escenario: Crear una especialidad exitosamente
    Cuando el administrador crea una especialidad con el nombre "<nombre>" y la descripción "<descripcion>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad creada correctamente" para la especialidad

    Ejemplos:
      | nombre                      | descripcion                                                     |
      | Alergia e Inmunología       | Diagnóstico y tratamiento de enfermedades alérgicas e inmunológicas. |
      | Cardiología                 | Diagnóstico y tratamiento de enfermedades del corazón y el sistema circulatorio. |

  Esquema del escenario: Intentar crear una especialidad con nombre duplicado
    Dado que la especialidad "<nombre>" ya existe en el sistema
    Cuando el administrador crea una especialidad con el nombre "<nombre>" y la descripción "<descripcion>"
    Entonces el sistema responde con el status code 409 y el status text "Ya existe una especialidad con ese nombre" para la especialidad

    Ejemplos:
      | nombre             | descripcion                                  |
      | Cardiología        | Especialidad que estudia el sistema cardíaco |
      | Gastroenterología  | Especialidad del sistema digestivo           |

  # Escenarios para listar especialidades
  Escenario: Recuperar todas las especialidades registradas en el sistema
    Dado que no existen especialidades en el sistema
    Cuando un usuario del sistema solicita la lista de especialidades
    Entonces el sistema responde con el status code 200 y el status text "Especialidades recuperadas correctamente" para la especialidad

  # Escenarios para modificar especialidades
  Esquema del escenario: Modificar una especialidad exitosamente
    Dado que la especialidad "<nombre_original>" existe en el sistema con la descripción "<descripcion_original>"
    Cuando el administrador edita la especialidad "<nombre_original>" cambiando su nombre a "<nombre_nuevo>" y su descripción a "<descripcion_nueva>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad editada exitosamente" para la especialidad

    Ejemplos:
      | nombre_original | descripcion_original                         | nombre_nuevo         | descripcion_nueva                           |
      | Cardiología     | Diagnóstico y tratamiento de enfermedades del corazón y el sistema circulatorio. | Cardiología Avanzada | Especialidad avanzada en cardiología.       |

  Esquema del escenario: Intentar modificar una especialidad con un nombre duplicado
    Dado que la especialidad "<nombre_original>" existe en el sistema
    Y otra especialidad con el nombre "<nombre_existente>" ya está registrada
    Cuando el administrador intenta cambiar el nombre de "<nombre_original>" a "<nombre_existente>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad editada exitosamente" para la especialidad
#TEST HARCODEADO curl -X GET http://localhost:8080/especialidad curl -X PUT http://localhost:8080/especialidad/{id_de_cardiologia} \
#-H "Content-Type: application/json" \
#-d '{
# "nombre": "pediatría",
#  "descripcion": "Diagnóstico y tratamiento avanzado de enfermedades del corazón."
#}'
    Ejemplos:
      | nombre_original | nombre_existente |
      | Cardiología     | Pediatría        |

  # Escenarios para eliminar especialidades
  Esquema del escenario: Eliminar una especialidad exitosamente
    Dado que la especialidad "<nombre>" existe en el sistema
    Cuando el administrador elimina la especialidad "<nombre>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad eliminada exitosamente" para la especialidad

    Ejemplos:
      | nombre                 |
      | Terapia Intensiva      |
      | Medicina Estética      |

