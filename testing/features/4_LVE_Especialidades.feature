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
  | nombre                      | descripcion                                                     | status_code | status_text                           |
  | Alergia e Inmunología       | Diagnóstico y tratamiento de enfermedades alérgicas e inmunológicas. | 200        | Especialidad creada correctamente    |
  | Anatomía Patológica         | Estudio de tejidos y células para diagnosticar enfermedades.   | 200        | Especialidad creada correctamente    |
  | Anestesiología              | Administración de anestesia para procedimientos quirúrgicos y control del dolor. | 200 | Especialidad creada correctamente    |
  | Angiología                  | Diagnóstico y tratamiento de enfermedades de los vasos sanguíneos y linfáticos. | 200 | Especialidad creada correctamente    |
  | Cardiología                 | Diagnóstico y tratamiento de enfermedades del corazón y el sistema circulatorio. | 200 | Especialidad creada correctamente    |
  | Cardiología Avanzada        | Especialidad avanzada en cardiología.                          | 200        | Especialidad creada correctamente    |
  | Cardiología1                | Especialidad avanzada en cardiología.1                          | 200        | Especialidad creada correctamente    |
  | Cirugía Cardiovascular      | Intervenciones quirúrgicas del corazón y grandes vasos sanguíneos. | 200 | Especialidad creada correctamente    |
  | Cirugía General             | Tratamiento quirúrgico de diversas patologías en órganos internos. | 200 | Especialidad creada correctamente    |
  | Cirugía Plástica            | Reconstrucción, reparación y embellecimiento de tejidos y estructuras del cuerpo. | 200 | Especialidad creada correctamente    |
  | Cirugía Vascular            | Diagnóstico y tratamiento quirúrgico de enfermedades de los vasos sanguíneos. | 200 | Especialidad creada correctamente    |
  | Clínica Médica              | Atención integral de enfermedades médicas en adultos.         | 200        | Especialidad creada correctamente    |
  | Dermatología                | Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas. | 200 | Especialidad creada correctamente    |
  | Diabetología                | Tratamiento y control de la diabetes y sus complicaciones.    | 200        | Especialidad creada correctamente    |
  | Emergentología              | Atención médica de urgencias y emergencias.                   | 200        | Especialidad creada correctamente    |
  | Endoscopía Digestiva        | Exploración y tratamiento de enfermedades del tracto digestivo mediante endoscopía. | 200 | Especialidad creada correctamente    |
  | Fisiatría                   | Rehabilitación de personas con discapacidades físicas o motoras. | 200 | Especialidad creada correctamente    |
  | Gastroenterología           | Diagnóstico y tratamiento de enfermedades del sistema digestivo. | 200 | Especialidad creada correctamente    |
  | Genética Médica             | Estudio de enfermedades hereditarias y trastornos genéticos.  | 200        | Especialidad creada correctamente    |
  | Geriatría                   | Atención médica integral del adulto mayor.                    | 200        | Especialidad creada correctamente    |
  | Ginecología                 | Diagnóstico y tratamiento de enfermedades del aparato reproductor femenino. | 200 | Especialidad creada correctamente    |
  | Hematología                 | Diagnóstico y tratamiento de enfermedades de la sangre y órganos hematopoyéticos. | 200 | Especialidad creada correctamente    |
  | Hepatología                 | Diagnóstico y tratamiento de enfermedades del hígado.        | 200        | Especialidad creada correctamente    |
  | Infectología                | Estudio, diagnóstico y tratamiento de enfermedades infecciosas. | 200 | Especialidad creada correctamente    |
  | Medicina Del Deporte        | Prevención y tratamiento de lesiones deportivas y mejora del rendimiento. | 200 | Especialidad creada correctamente    |
  | Medicina Estética           | Procedimientos para mejorar la estética y apariencia física. | 200        | Especialidad creada correctamente    |
  | Medicina Familiar           | Atención integral de la salud en todas las etapas de la vida. | 200        | Especialidad creada correctamente    |
  | Medicina Forense            | Aplicación de la medicina en el ámbito legal y judicial.     | 200        | Especialidad creada correctamente    |
  | Medicina General            | Atención primaria y general de la salud.                    | 200        | Especialidad creada correctamente    |
  | Medicina Interna            | Diagnóstico y tratamiento de enfermedades en adultos sin necesidad de cirugía. | 200 | Especialidad creada correctamente    |
  | Medicina Materno-Fetal      | Atención médica a embarazadas y fetos en riesgo.            | 200        | Especialidad creada correctamente    |
  | Medicina del Trabajo        | Prevención y tratamiento de enfermedades laborales.          | 200        | Especialidad creada correctamente    |
  | Nefrología                  | Diagnóstico y tratamiento de enfermedades renales.          | 200        | Especialidad creada correctamente    |
  | Neonatología                | Atención médica de recién nacidos, especialmente prematuros o enfermos. | 200 | Especialidad creada correctamente    |
  | Neumonología                | Diagnóstico y tratamiento de enfermedades pulmonares y respiratorias. | 200 | Especialidad creada correctamente    |
  | Neurocirugía                | Cirugía del cerebro, médula espinal y nervios periféricos.  | 200        | Especialidad creada correctamente    |
  | Neurología                  | Diagnóstico y tratamiento de enfermedades del sistema nervioso. | 200 | Especialidad creada correctamente    |
  | Nutrición                   | Control de la alimentación y nutrición para la salud y prevención de enfermedades. | 200 | Especialidad creada correctamente    |
  | Obstetricia                 | Atención médica del embarazo, parto y postparto.            | 200        | Especialidad creada correctamente    |
  | Odontología                 | Cuidado de la salud bucal y dental.                         | 200        | Especialidad creada correctamente    |
  | Oftalmología                | Diagnóstico y tratamiento de enfermedades de los ojos y visión. | 200 | Especialidad creada correctamente    |
  | Ortopedia y Traumatología   | Diagnóstico y tratamiento de enfermedades del sistema musculoesquelético. | 200 | Especialidad creada correctamente    |
  | Otorrinolaringología        | Diagnóstico y tratamiento de enfermedades del oído, nariz y garganta. | 200 | Especialidad creada correctamente    |
  | Pediatría                   | Atención médica integral de niños y adolescentes.           | 200        | Especialidad creada correctamente    |
  | Psiquiatría                 | Diagnóstico y tratamiento de trastornos mentales y emocionales. | 200 | Especialidad creada correctamente    |
  | Radiología                  | Diagnóstico y tratamiento mediante técnicas de imagen médica. | 200 | Especialidad creada correctamente    |
  | Traumatología               | Diagnóstico y tratamiento de lesiones del sistema musculoesquelético. | 200 | Especialidad creada correctamente    |
  | Urología                    | Diagnóstico y tratamiento de enfermedades del aparato urinario y reproductor masculino. | 200 | Especialidad creada correctamente    |

  
  Esquema del escenario: Intentar crear una especialidad con nombre duplicado
    Dado que la especialidad "<nombre>" ya existe en el sistema
    Cuando el administrador crea una especialidad con el nombre "<nombre>" y la descripción "<descripcion>"
    Entonces el sistema responde con el status code 409 y el status text "Ya existe una especialidad con ese nombre" para la especialidad

    Ejemplos:
      | nombre             | descripcion                                  |
      | Cardiología        | Especialidad que estudia el sistema cardíaco |
      | Gastroenterología  | Especialidad del sistema digestivo           |


  Escenario: Listar todas las especialidades existentes
    Cuando un usuario del sistema solicita la lista de especialidades
    Entonces el sistema responde con el status code 200 y el status text "Especialidades recuperadas correctamente" para la especialidad

  # Escenarios para modificar especialidades
  Esquema del escenario: Modificar una especialidad exitosamente
    Dado que la especialidad "<nombre_original>" existe en el sistema con la descripción "<descripcion_original>"
    Cuando el administrador edita la especialidad "<nombre_original>" cambiando su nombre a "<nombre_nuevo>" y su descripción a "<descripcion_nueva>"
    Entonces el sistema responde con el status code 200 y el status text "Especialidad editada exitosamente" para la especialidad

    Ejemplos:
      | nombre_original | descripcion_original                         | nombre_nuevo         | descripcion_nueva                           |
      | Cardiología1     | Diagnóstico y tratamiento de enfermedades del corazón y el sistema circulatorio. | Cardiología Avanzada1 | Especialidad avanzada en cardiología.       |

  Esquema del escenario: Intentar modificar una especialidad con un nombre duplicado
    Dado que la especialidad "<nombre_original>" existe en el sistema
    Y otra especialidad con el nombre "<nombre_existente>" ya está registrada
    Cuando el administrador intenta cambiar el nombre de "<nombre_original>" a "<nombre_existente>"
    Entonces el sistema responde con el status code 409 y el status text "Ya existe una especialidad con ese nombre" para la especialidad

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
      | Cardiología Avanzada1  |
