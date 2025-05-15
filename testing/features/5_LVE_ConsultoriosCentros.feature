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
| Centro Médico Integral        | 104    | Consultorio Oeste         | 200         | Consultorio creado correctamente   |
| Centro Médico Integral        | 105    | Consultorio Central       | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 301    | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 302    | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 303    | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 304    | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 305    | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 306    | Consultorio 6             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 307    | Consultorio 7             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 308    | Consultorio 8             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 309    | Consultorio 9             | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 310    | Consultorio 10            | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 311    | Consultorio 11            | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 312    | Consultorio 12            | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 313    | Consultorio 13            | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 314    | Consultorio 14            | 200         | Consultorio creado correctamente   |
| Trelew Salud                  | 315    | Consultorio 15            | 200         | Consultorio creado correctamente   |
| Centro Médico Esperanza       | 501    | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Centro Médico Esperanza       | 502    | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Centro Médico Esperanza       | 503    | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Centro Médico Esperanza       | 504    | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Centro Médico Esperanza       | 505    | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Centro Médico Esperanza       | 506    | Consultorio 6             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 601    | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 602    | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 603    | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 604    | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 605    | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 606    | Consultorio 6             | 200         | Consultorio creado correctamente   |
| Clinica Rawson                | 607    | Consultorio 7             | 200         | Consultorio creado correctamente   |
| Centro de Rehabilitación      | 701    | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Centro de Rehabilitación      | 702    | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Centro de Rehabilitación      | 703    | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Centro de Rehabilitación      | 704    | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Centro de Rehabilitación      | 705    | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Instituto Médico Patagonia    | 801    | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Instituto Médico Patagonia    | 802    | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Instituto Médico Patagonia    | 803    | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Instituto Médico Patagonia    | 804    | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Instituto Médico Patagonia    | 805    | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Centro Odontológico Rawson    | 901    | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Centro Odontológico Rawson    | 902    | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Centro Odontológico Rawson    | 903    | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Centro Odontológico Rawson    | 904    | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Centro Odontológico Rawson    | 905    | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Centro Médico del Este        | 1001   | Consultorio 1             | 200         | Consultorio creado correctamente   |
| Centro Médico del Este        | 1002   | Consultorio 2             | 200         | Consultorio creado correctamente   |
| Centro Médico del Este        | 1003   | Consultorio 3             | 200         | Consultorio creado correctamente   |
| Centro Médico del Este        | 1004   | Consultorio 4             | 200         | Consultorio creado correctamente   |
| Centro Médico del Este        | 1005   | Consultorio 5             | 200         | Consultorio creado correctamente   |
| Centro Médico del Este        | 1006   | Consultorio 6             | 200         | Consultorio creado correctamente   |
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
        {"numero": 101, "nombre": "Consultorio Norte"},
        {"numero": 102, "nombre": "Consultorio Sur"},
        {"numero": 103, "nombre": "Consultorio Este"},
        {"numero": 104, "nombre": "Consultorio Oeste"},
        {"numero": 105, "nombre": "Consultorio Central"}
      ]
    },
    {
      "centro_atencion": "Trelew Salud",
      "consultorios": [
        {"numero": 301, "nombre": "Consultorio 1"},
        {"numero": 302, "nombre": "Consultorio 2"},
        {"numero": 303, "nombre": "Consultorio 3"},
        {"numero": 304, "nombre": "Consultorio 4"},
        {"numero": 305, "nombre": "Consultorio 5"},
        {"numero": 306, "nombre": "Consultorio 6"},
        {"numero": 307, "nombre": "Consultorio 7"},
        {"numero": 308, "nombre": "Consultorio 8"},
        {"numero": 309, "nombre": "Consultorio 9"},
        {"numero": 310, "nombre": "Consultorio 10"},
        {"numero": 311, "nombre": "Consultorio 11"},
        {"numero": 312, "nombre": "Consultorio 12"},
        {"numero": 313, "nombre": "Consultorio 13"},
        {"numero": 314, "nombre": "Consultorio 14"},
        {"numero": 315, "nombre": "Consultorio 15"}
      ]
    },
    {
      "centro_atencion": "Centro Médico Esperanza",
      "consultorios": [
        {"numero": 501, "nombre": "Consultorio 1"},
        {"numero": 502, "nombre": "Consultorio 2"},
        {"numero": 503, "nombre": "Consultorio 3"},
        {"numero": 504, "nombre": "Consultorio 4"},
        {"numero": 505, "nombre": "Consultorio 5"},
        {"numero": 506, "nombre": "Consultorio 6"}
      ]
    },
    {
      "centro_atencion": "Clinica Rawson",
      "consultorios": [
        {"numero": 601, "nombre": "Consultorio 1"},
        {"numero": 602, "nombre": "Consultorio 2"},
        {"numero": 603, "nombre": "Consultorio 3"},
        {"numero": 604, "nombre": "Consultorio 4"},
        {"numero": 605, "nombre": "Consultorio 5"},
        {"numero": 606, "nombre": "Consultorio 6"},
        {"numero": 607, "nombre": "Consultorio 7"}
      ]
    },
    {
      "centro_atencion": "Centro de Rehabilitación",
      "consultorios": [
        {"numero": 701, "nombre": "Consultorio 1"},
        {"numero": 702, "nombre": "Consultorio 2"},
        {"numero": 703, "nombre": "Consultorio 3"},
        {"numero": 704, "nombre": "Consultorio 4"},
        {"numero": 705, "nombre": "Consultorio 5"}
      ]
    },
    {
      "centro_atencion": "Instituto Médico Patagonia",
      "consultorios": [
        {"numero": 801, "nombre": "Consultorio 1"},
        {"numero": 802, "nombre": "Consultorio 2"},
        {"numero": 803, "nombre": "Consultorio 3"},
        {"numero": 804, "nombre": "Consultorio 4"},
        {"numero": 805, "nombre": "Consultorio 5"}
      ]
    },
    {
      "centro_atencion": "Centro Odontológico Rawson",
      "consultorios": [
        {"numero": 901, "nombre": "Consultorio 1"},
        {"numero": 902, "nombre": "Consultorio 2"},
        {"numero": 903, "nombre": "Consultorio 3"},
        {"numero": 904, "nombre": "Consultorio 4"},
        {"numero": 905, "nombre": "Consultorio 5"}
      ]
    },
    {
      "centro_atencion": "Centro Médico del Este",
      "consultorios": [
        {"numero": 1001, "nombre": "Consultorio 1"},
        {"numero": 1002, "nombre": "Consultorio 2"},
        {"numero": 1003, "nombre": "Consultorio 3"},
        {"numero": 1004, "nombre": "Consultorio 4"},
        {"numero": 1005, "nombre": "Consultorio 5"},
        {"numero": 1006, "nombre": "Consultorio 6"},
        {"numero": 1007, "nombre": "Consultorio 7"}
      ]
    }
  ]
}

    """
