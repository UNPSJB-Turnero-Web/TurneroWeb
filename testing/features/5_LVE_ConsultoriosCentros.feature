# language: es
Característica: Gestión de Consultorios en Centros de Atención

Antecedentes:
  Dado que existe un sistema de gestión de centros de atención
  
Esquema del escenario: Creación de consultorios exitosos
  Dado que existe un centro de atención llamado "<Nombre>"
  Cuando se registra un consultorio con el número "<Numero>" y el nombre "<Nombre_consultorio>"
  Entonces el sistema responde con status_code "<status_code>" y status_text "<status_text>"

Ejemplos: Consultorios exitosos
  | Nombre                        | Numero | Nombre_consultorio        | status_code | status_text                         |
  | Centro Médico Integral        | 101    | Consultorio Norte         | 200         | Consultorio creado correctamente   |
  | Centro Médico Integral        | 102    | Consultorio Sur           | 200         | Consultorio creado correctamente   |
  | Centro Médico Integral        | 103    | Consultorio Este          | 200         | Consultorio creado correctamente   |
  | Clinica Rawson                | 201    | Consultorio Cardiología   | 200         | Consultorio creado correctamente   |
  | Trelew Salud                  | 301    | Consultorio 1             | 200         | Consultorio creado correctamente   |
  | Centro Médico Esperanza       | 506    | Consultorio 6             | 200         | Consultorio creado correctamente   |
  | Clinica Rawson                | 607    | Consultorio 7             | 200         | Consultorio creado correctamente   |
  | Centro de Rehabilitación      | 705    | Consultorio 5             | 200         | Consultorio creado correctamente   |
  | Instituto Médico Patagonia    | 805    | Consultorio 5             | 200         | Consultorio creado correctamente   |
  | Centro Odontológico Rawson    | 905    | Consultorio 5             | 200         | Consultorio creado correctamente   |
  | Centro Médico del Este        | 1007   | Consultorio 7             | 200         | Consultorio creado correctamente   |

Esquema del escenario: Creación de consultorios con conflicto
  Dado que existe un centro de atención llamado "<Nombre>"
  Cuando se registra un consultorio con el número "<Numero>" y el nombre "<Nombre_consultorio>"
  Entonces el sistema responde con status_code "<status_code>" y status_text "<status_text>"

Ejemplos: Consultorios con conflicto
  | Nombre                     | Numero | Nombre_consultorio         | status_code | status_text                                                       |
  | Centro Médico Integral     | 101    | Consultorio Repetido       | 409         |  El número de consultorio ya está en uso                 |
  | Centro Médico Integral     | 108    |                            | 409         |  El nombre del consultorio es obligatorio                    |
  | Trelew Salud               | 317    | Consultorio #Especial      | 409         |  El nombre del consultorio contiene caracteres no permitidos |

Escenario: Listar consultorios de un centro de atención
  Dado que existe un centro de atención llamado "Centro Médico Esperanza"
  Cuando se solicita la lista de consultorios del centro
  Entonces el sistema responde con el siguiente JSON:
    """
    {
      "status_code": 200,
      "status_text": "Consultorios recuperados correctamente",
      "data": [
        { "numero": 501, "Nombre_consultorio": "Consultorio 1" },
        { "numero": 502, "Nombre_consultorio": "Consultorio 2" },
        { "numero": 503, "Nombre_consultorio": "Consultorio 3" },
        { "numero": 504, "Nombre_consultorio": "Consultorio 4" },
        { "numero": 505, "Nombre_consultorio": "Consultorio 5" },
        { "numero": 506, "Nombre_consultorio": "Consultorio 6" }
      ]
    }
    """

Escenario: Listar todos los centros con sus consultorios
  Dado que existen múltiples centros de atención registrados
  Cuando se solicita la lista completa de centros con sus consultorios
  Entonces el sistema responde con el siguiente JSON:
    """
    {
      "status_code": 200,
      "status_text": "Consultorios recuperados correctamente",
      "data": [
        {
          "centro_atencion": "Centro Médico Integral",
          "consultorios": [
            { "numero": 101, "Nombre": "Consultorio Norte" },
            { "numero": 102, "Nombre": "Consultorio Sur" }
          ]
        },
        {
          "centro_atencion": "Clinica Rawson",
          "consultorios": [
            { "numero": 201, "Nombre": "Consultorio Cardiología" },
            { "numero": 607, "Nombre": "Consultorio 7" }
          ]
        },
        {
          "centro_atencion": "Trelew Salud",
          "consultorios": [
            { "numero": 301, "Nombre": "Consultorio 1" }
          ]
        },
        {
          "centro_atencion": "Centro Médico Esperanza",
          "consultorios": [
            { "numero": 506, "Nombre": "Consultorio 6" }
          ]
        },
        {
          "centro_atencion": "Centro de Rehabilitación",
          "consultorios": [
            { "numero": 705, "Nombre": "Consultorio 5" }
          ]
        },
        {
          "centro_atencion": "Instituto Médico Patagonia",
          "consultorios": [
            { "numero": 805, "Nombre": "Consultorio 5" }
          ]
        },
        {
          "centro_atencion": "Centro Odontológico Rawson",
          "consultorios": [
            { "numero": 905, "Nombre": "Consultorio 5" }
          ]
        },
        {
          "centro_atencion": "Centro Médico del Este",
          "consultorios": [
            { "numero": 1007, "Nombre": "Consultorio 7" }
          ]
        }
      ]
    }
    """
