# language: es

Característica: Crear Centro de Atención

Antecedentes: 
  Dado que existe un sistema de gestión de centros de atención

Esquema del escenario: Crear un centro de atención exitosamente 

Cuando el administrador ingresa los datos del centro de atención: "<Nombre>", "<Dirección>", "<Localidad>", "<Provincia>", "<Teléfono>", "<Latitud>" y "<Longitud>" 
Entonces el sistema responde con <status_code> y "<status_text>"

Ejemplos: Centros de atención exitosos
  | Nombre                      | Dirección                                        | Localidad        | Provincia | Teléfono      | Latitud   | Longitud  | status_code | status_text                   |
  | Centro Médico Integral      | Calle 9 de Julio 123, Piso 2, Oficina A          | Puerto Madryn   | Chubut    | 1234567890    | -42.765   | -65.034   | 200         | "Centro de atención creado"    |
  | Centro de Salud Rawson      | Avenida Libertad 456                             | Rawson          | Chubut    | 9876543210    | -43.305   | -65.102   | 200         | "Centro de atención creado"    |
  | Trelew Salud                | Rivadavia 789, Barrio Centro                     | Trelew          | Chubut    | 1122334455    | -43.252   | -65.308   | 200         | "Centro de atención creado"    |
  | Centro Médico Esperanza     | Belgrano 753                                     | Trelew          | Chubut    | 5566778899    | -43.272   | -65.311   | 200         | "Centro de atención creado"    |
  | Clinica Rawson              | Mariano Moreno 525                               | Rawson          | Chubut    | 6677889900    | -43.310   | -65.112   | 200         | "Centro de atención creado"    |
  | Centro de Rehabilitación    | Hipólito Yrigoyen 852                            | Puerto Madryn   | Chubut    | 7788990011    | -42.755   | -65.044   | 200         | "Centro de atención creado"    |
  | Instituto Médico Patagonia  | San Martín 1025, 1er Piso                        | Trelew          | Chubut    | 8899001122    | -43.248   | -65.301   | 200         | "Centro de atención creado"    |
  | Centro Odontológico Rawson  | Gobernador Gallina 789                           | Rawson          | Chubut    | 9900112233    | -43.322   | -65.123   | 200         | "Centro de atención creado"    |
  | Centro Médico del Este      | Avenida Fontana 987                              | Puerto Madryn   | Chubut    | 0011223344    | -42.777   | -65.011   | 200         | "Centro de atención creado"    |

Esquema del escenario: Crear un centro de atención con conflictos 

Cuando el administrador ingresa los datos del centro de atención: "<Nombre>", "<Dirección>", "<Localidad>", "<Provincia>", "<Teléfono>", "<Latitud>" y "<Longitud>" 
Entonces el sistema responde con <status_code> y "<status_text>"

Ejemplos: Centros de atención con conflictos
  | Nombre                  | Dirección                                  | Localidad      | Provincia | Teléfono      | Latitud   | Longitud  | status_code | status_text                                      |
  | Centro Médico Integral  | Calle 9 de Julio 123, Piso 2, Oficina A    | Puerto Madryn   | Chubut    | 1234567890    | -42.765   | -65.034   | 409         | "Ya existe un centro de atención con ese nombre y dirección" |
  | Centro Médico Nuevo     | Calle 9 de Julio 123, Piso 2, Oficina A    | Puerto Madryn   | Chubut    | 9876543210    | -42.795   | -65.054   | 409         | "Ya existe un centro de atención con esa dirección"        |
  |                         | Calle 9 de Julio 123, Piso 2, Oficina A    | Puerto Madryn   | Chubut    | 1122334455    | -42.765   | -65.034   | 400         | "El nombre es requerido"                           |
  | Centro Médico           |                                           | Puerto Madryn   | Chubut    | 5566778899    | -42.765   | -65.034   | 400         | "La dirección es requerida"                      |
  | Centro de la Costa      | Belgrano 753                               | Trelew          | Chubut    | 6677889900    | abc       | xyz       | 400         | "Las coordenadas son inválidas"                  |
