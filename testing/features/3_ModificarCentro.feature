# language: es

Característica: Modificar Centro de Atención

  Antecedentes:
    Dado que existen centros de atención creados en el sistema
    Y los siguientes centros de atención han sido registrados:
      | Nombre                   | Dirección                               | Localidad      | Provincia | Teléfono      | Coordenadas        |
      | Centro Médico Integral   | Calle 9 de Julio 123, Piso 2, Oficina A | Puerto Madryn  | Chubut    | 1234567890    | -42.765,-65.034   |
      | Clinica Rawson   | Avenida Libertad 456                    | Rawson         | Chubut    | 9876543210    | -43.305,-65.102   |
      | Trelew Salud             | Rivadavia 789, Barrio Centro            | Trelew         | Chubut    | 1122334455    | -43.252,-65.308   |

  Esquema del escenario: Modificar centro de atención exitosamente
    Cuando el administrador modifica los datos del centro de atención "<Nombre>" con los siguientes atributos:
      | Nombre            | Dirección                                  | Localidad       | Provincia | Teléfono      | Coordenadas        |
      | <NombreNuevo>     | <DirecciónNueva>                           | <LocalidadNueva> | <ProvinciaNueva> | <TeléfonoNuevo> | <CoordenadasNuevas> |
    Entonces el sistema responde con <status_code> y "<status_text>" para el centro de atención

    Ejemplos: Modificaciones exitosas
    | Nombre                   | NombreNuevo                | DirecciónNueva                                  | LocalidadNueva  | ProvinciaNueva | TeléfonoNuevo      | CoordenadasNuevas        | status_code | status_text                   |
    | Centro Médico Integral   | Centro Médico Integral     | Calle 9 de Julio 150, Piso 3, Oficina B         | Puerto Madryn   | Chubut         | 1234567890    | -42.760,-65.030   | 200         | Centro de atención modificado correctamente |
    | Centro de Salud Rawson   | Centro de Salud Dr. Juan Perez | Avenida Libertad 456                        | Rawson          | Chubut         | 9876543210    | -43.300,-65.100   | 200         | Centro de atención modificado correctamente |
    | Trelew Salud             | Trelew Salud               | Rivadavia 789, Barrio Centro                    | Trelew          | Chubut         | 1122334455    | -43.255,-65.310   | 200         | Centro de atención modificado correctamente |

  Esquema del escenario: Intentar modificar centro de atención con conflictos
    Cuando el administrador modifica los datos del centro de atención "<Nombre>" con los siguientes atributos:
      | Nombre            | Dirección                                  | Localidad       | Provincia | Teléfono      | Coordenadas        |
      | <NombreNuevo>     | <DirecciónNueva>                           | <LocalidadNueva> | <ProvinciaNueva> | <TeléfonoNuevo> | <CoordenadasNuevas> |
    Entonces el sistema responde con <status_code> y "<status_text>" para el centro de atención

    Ejemplos: Modificaciones con conflictos
    | Nombre                   | NombreNuevo              | DirecciónNueva                               | LocalidadNueva  | ProvinciaNueva | TeléfonoNuevo      | CoordenadasNuevas        | status_code | status_text                                                        |
    | Centro Médico Integral   | Centro Médico Integral   | Avenida Libertad 456                         | Puerto Madryn   | Chubut         | 1234567890    | -42.765,-65.034   | 200         | Ya existe un centro de atención con esa dirección                  |
    | Trelew Salud             | Clinica Rawson           | Mariano Moreno 525                         | Rawson          | Chubut         | 9876543210    | -43.305,-65.102   | 200         | Ya existe un centro de atención con ese nombre y dirección         |
    | Trelew Salud             | Trelew Salud             | Rivadavia 789, Barrio Centro                 | Trelew          | Chubut         | 1122334455    | -200, -200           | 200         | Las coordenadas son inválidas                                      |
