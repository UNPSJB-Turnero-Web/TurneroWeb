# language: es
Característica: Gestión de Consultorios en Centros de Atención

Antecedentes:
  Dado que existe un sistema de gestión de centros de atención
  Y los siguientes centros de atención han sido registrados test5:
    | Nombre                     | Dirección                               | Localidad     | Provincia | Teléfono   | Coordenadas      |
    | Centro Médico Integral     | Calle 9 de Julio 123, Piso 2, Oficina A | Puerto Madryn | Chubut    | 1234567890 | -42.765,-65.034  |
    | Clinica Rawson             | Avenida Libertad 456                    | Rawson        | Chubut    | 9876543210 | -43.305,-65.102  |
    | Trelew Salud               | Rivadavia 789, Barrio Centro            | Trelew        | Chubut    | 1122334455 | -43.252,-65.308  |
    | Centro Médico Esperanza    | Belgrano 753                            | Trelew        | Chubut    | 2233445566 | -43.272,-65.311  |
    | Centro de Rehabilitación   | Hipólito Yrigoyen 852                   | Puerto Madryn | Chubut    | 3344556677 | -42.755,-65.044  |
    | Instituto Médico Patagonia | San Martín 1025, 1er Piso               | Trelew        | Chubut    | 4455667788 | -43.248,-65.301  |
    | Centro Odontológico Rawson | Gobernador Gallina 789                  | Rawson        | Chubut    | 5566778899 | -43.322,-65.123  |
    | Centro Médico del Este     | Avenida Fontana 987                     | Puerto Madryn | Chubut    | 6677889900 | -42.777,-65.011  |

Esquema del escenario: Creación de consultorios exitosos
  Dado que existe un centro de atención llamado "<centro_atencion>"
  Cuando se registra un consultorio con el número "<numero>" y el nombre "<nombre_consultorio>"
  Entonces el sistema responde con status_code "<status_code>" y status_text "<status_text>"

Ejemplos: Consultorios exitosos
  | centro_atencion               | numero | nombre_consultorio        | status_code | status_text                         |
  | Centro Médico Integral        | 101    | Consultorio Norte         | 200         | Consultorios creados correctamente   |
  | Centro Médico Integral        | 102    | Consultorio Sur           | 200         | Consultorios creados correctamente   |
  | Centro Médico Integral        | 103    | Consultorio Este          | 200         | Consultorios creados correctamente   |
  | Clinica Rawson                | 201    | Consultorio Cardiología   | 200         | Consultorios creados correctamente   |
  | Trelew Salud                  | 301    | Consultorio 1             | 200         | Consultorios creados correctamente   |
  | Centro Médico Esperanza       | 506    | Consultorio 6             | 200         | Consultorios creados correctamente   |
  | Clinica Rawson                | 607    | Consultorio 7             | 200         | Consultorios creados correctamente   |
  | Centro de Rehabilitación      | 705    | Consultorio 5             | 200         | Consultorios creados correctamente   |
  | Instituto Médico Patagonia    | 805    | Consultorio 5             | 200         | Consultorios creados correctamente   |
  | Centro Odontológico Rawson    | 905    | Consultorio 5             | 200         | Consultorios creados correctamente   |
  | Centro Médico del Este        | 1007   | Consultorio 7             | 200         | Consultorios creados correctamente   |

Esquema del escenario: Creación de consultorios con conflicto
  Dado que existe un centro de atención llamado "<centro_atencion>"
  Cuando se registra un consultorio con el número "<numero>" y el nombre "<nombre_consultorio>"
  Entonces el sistema responde con status_code "<status_code>" y status_text "<status_text>"

Ejemplos: Consultorios con conflicto
  | centro_atencion            | numero | nombre_consultorio         | status_code | status_text                                                       |
  | Centro Médico Integral     | 101    | Consultorio Repetido       | 409         | Error: El número de consultorio ya está registrado                 |
  | Centro Médico Integral     | 108    |                            | 409         | Error: El nombre del consultorio es obligatorio                    |
  | Trelew Salud               | 317    | Consultorio #Especial      | 409         | Error: El nombre del consultorio contiene caracteres no permitidos |

Escenario: Listar consultorios de un centro de atención
  Dado que existe un centro de atención llamado "Centro Médico Esperanza"
  Cuando se solicita la lista de consultorios del centro
  Entonces el sistema responde con el siguiente JSON:
    """
    {
      "status_code": 200,
      "status_text": "Consultorios recuperados correctamente",
      "data": [
        { "numero": 501, "nombre_consultorio": "Consultorio 1" },
        { "numero": 502, "nombre_consultorio": "Consultorio 2" },
        { "numero": 503, "nombre_consultorio": "Consultorio 3" },
        { "numero": 504, "nombre_consultorio": "Consultorio 4" },
        { "numero": 505, "nombre_consultorio": "Consultorio 5" },
        { "numero": 506, "nombre_consultorio": "Consultorio 6" }
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
            { "numero": 101, "nombre": "Consultorio Norte" },
            { "numero": 102, "nombre": "Consultorio Sur" }
          ]
        },
        {
          "centro_atencion": "Trelew Salud",
          "consultorios": [
            { "numero": 301, "nombre": "Consultorio 1" },
            { "numero": 302, "nombre": "Consultorio 2" }
          ]
        }
      ]
    }
    """
