# language: es

Característica: LVE EspecialidadesCentros

  Antecedentes: 
    Dado que existe un sistema de gestión de centros de atención
    Y existen 9 centros de atención registrados en el sistema:
| Centro de Atención |
| Centro Médico Integral |
| Centro de Salud Rawson |
| Trelew Salud |
| Centro Médico Esperanza |
| Clinica Rawson |
| Centro de Rehabilitación |
| Instituto Médico Patagonia |
| Centro Odontológico Rawson |
| Centro Médico del Este |

Esquema del escenario: Asociar una especialidad a un centro de atención exitosamente 

Cuando el administrador asocia la especialidad "<Especialidad>" al centro de atención "<Centro_De_Atencion>" para especialidadesCentro
  Entonces el sistema responde con status_code "<status_code>" y status_text "<status_text>"

  Ejemplos:
| Centro_De_Atencion         | Especialidad           | status_code | status_text                                   |
| Centro Médico Integral     | Odontología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Oftalmología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Pediatría             | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Traumatología         | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Clínica Médica        | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Medicina Del Deporte  | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Medicina General      | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Diabetología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Endoscopía Digestiva  | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Urología              | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Angiología            | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Otorrinolaringología  | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Cirugía General       | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Medicina Estética     | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Integral     | Medicina Estética     | 400         | Error al asociar especialidad al centro: La especialidad ya está asociada a este centro|
| Centro Médico Integggggral | Medicina Estética     | 409         | No existe el Centro Médico                     |
| Centro Médico Integral     | Medicina Estéééééética| 409         | No existe la especialidad                      |
| Trelew Salud               | Oftalmología          | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Odontología           | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Dermatología          | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Ortopedia y Traumatología | 200     | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Urología              | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Hepatología           | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Geriatría             | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Fisiatría             | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Nutrición             | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Otorrinolaringología  | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Endoscopía Digestiva  | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Infectología          | 200         | Especialidad asociada correctamente al centro  |
| Trelew Salud               | Cirugía Cardiovascular| 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Traumatología         | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Pediatría             | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Odontología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Urología              | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Medicina Materno-Fetal| 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Ortopedia y Traumatología | 200     | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Neumonología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Cirugía Plástica      | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Endoscopía Digestiva  | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Emergentología        | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Neonatología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Fisiatría             | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico Esperanza    | Medicina del Trabajo  | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Dermatología          | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Pediatría             | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Odontología           | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Hematología           | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Hepatología           | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Neurología            | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Medicina Familiar     | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Anatomía Patológica   | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Cirugía Cardiovascular| 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Medicina Estética     | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Diabetología          | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Medicina Forense      | 200         | Especialidad asociada correctamente al centro  |
| Clinica Rawson             | Cirugía Plástica      | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Pediatría             | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Traumatología         | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Oftalmología          | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Psiquiatría           | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Medicina Del Deporte  | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Anestesiología        | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Cirugía Vascular      | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Ortopedia y Traumatología | 200     | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Cirugía Cardiovascular| 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Medicina General      | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Nefrología            | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Medicina Forense      | 200         | Especialidad asociada correctamente al centro  |
| Centro de Rehabilitación   | Hematología           | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Clínica Médica        | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Odontología           | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Traumatología         | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Otorrinolaringología  | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Medicina Familiar     | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Medicina Estética     | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Anatomía Patológica   | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Infectología          | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Medicina General      | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Cirugía Cardiovascular| 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Urología              | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Diabetología          | 200         | Especialidad asociada correctamente al centro  |
| Instituto Médico Patagonia | Hematología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Dermatología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Odontología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Oftalmología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Neurocirugía          | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Gastroenterología     | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Infectología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Neumonología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Pediatría             | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Fisiatría             | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Genética Médica       | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Radiología            | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Medicina Del Deporte  | 200         | Especialidad asociada correctamente al centro  |
| Centro Odontológico Rawson | Diabetología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Cardiología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Traumatología         | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Dermatología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Oftalmología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Ginecología           | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Emergentología        | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Nefrología            | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Infectología          | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Otorrinolaringología  | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Medicina Estética     | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Nutrición             | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Medicina Del Deporte  | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Medicina Interna      | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Cirugía Vascular      | 200         | Especialidad asociada correctamente al centro  |
| Centro Médico del Este     | Alergia e Inmunología | 200         | Especialidad asociada correctamente al centro  |



  Escenario: Recuperar todas las especialidades asociadas a todos los centros
    Dado que existen especialidades asociadas a centros médicos en el sistema
    Cuando un usuario del sistema solicita la lista de especialidades asociadas
    Entonces el sistema responde con un JSON para especialidadesCentro:
   
     """
{
    "status_code": 200,
    "status_text": "especialidades asociadas a centros recuperadas correctamente",
    "data": [

        {
        "centro_de_atencion": "Centro Médico del Este",
        "especialidades": [
            "Cardiología",
            "Traumatología",
            "Dermatología",
            "Oftalmología",
            "Ginecología",
            "Emergentología",
            "Nefrología",
            "Infectología",
            "Otorrinolaringología",
            "Medicina Estética",
            "Nutrición",
            "Medicina Del Deporte",
            "Medicina Interna",
            "Cirugía Vascular",
            "Alergia e Inmunología"
        ]
    },
    {
        "centro_de_atencion": "Centro Médico Esperanza",
        "especialidades": [
            "Cardiología",
            "Traumatología",
            "Ginecología",
            "Pediatría",
            "Odontología",
            "Urología",
            "Medicina Materno-Fetal",
            "Ortopedia y Traumatología",
            "Neumonología",
            "Cirugía Plástica",
            "Endoscopía Digestiva",
            "Emergentología",
            "Neonatología",
            "Fisiatría",
            "Medicina del Trabajo"
        ]
    },
    {
        "centro_de_atencion": "Centro Médico Integral",
        "especialidades": [
            "Odontología",
            "Oftalmología",
            "Pediatría",
            "Traumatología",
            "Clínica Médica",
            "Medicina Del Deporte",
            "Medicina General",
            "Diabetología",
            "Endoscopía Digestiva",
            "Ginecología",
            "Urología",
            "Angiología",
            "Otorrinolaringología",
            "Cirugía General",
            "Medicina Estética"
        ]
    },
    {
        "centro_de_atencion": "Centro Odontológico Rawson",
        "especialidades": [
            "Dermatología",
            "Cardiología",
            "Odontología",
            "Oftalmología",
            "Ginecología",
            "Neurocirugía",
            "Gastroenterología",
            "Infectología",
            "Neumonología",
            "Pediatría",
            "Fisiatría",
            "Genética Médica",
            "Radiología",
            "Medicina Del Deporte",
            "Diabetología"
        ]
    },  
    {
        "centro_de_atencion": "Trelew Salud",
        "especialidades": [
            "Oftalmología",
            "Cardiología",
            "Odontología",
            "Dermatología",
            "Ginecología",
            "Ortopedia y Traumatología",
            "Urología",
            "Hepatología",
            "Geriatría",
            "Fisiatría",
            "Nutrición",
            "Otorrinolaringología",
            "Endoscopía Digestiva",
            "Infectología",
            "Cirugía Cardiovascular"
        ]
    },  
    {
        "centro_de_atencion": "Clinica Rawson",
        "especialidades": [
            "Dermatología",
            "Pediatría",
            "Ginecología",
            "Cardiología",
            "Odontología",
            "Hematología",
            "Hepatología",
            "Neurología",
            "Medicina Familiar",
            "Anatomía Patológica",
            "Cirugía Cardiovascular",
            "Medicina Estética",
            "Diabetología",
            "Medicina Forense",
            "Cirugía Plástica"
        ]
    }, 
    {
        "centro_de_atencion": "Centro de Rehabilitación",
        "especialidades": [
            "Pediatría",
            "Traumatología",
            "Cardiología",
            "Oftalmología",
            "Ginecología",
            "Psiquiatría",
            "Medicina Del Deporte",
            "Anestesiología",
            "Cirugía Vascular",
            "Ortopedia y Traumatología",
            "Cirugía Cardiovascular",
            "Medicina General",
            "Nefrología",
            "Medicina Forense",
            "Hematología"
        ]
    }, 
    {
        "centro_de_atencion": "Instituto Médico Patagonia",
        "especialidades": [
            "Clínica Médica",
            "Odontología",
            "Ginecología",
            "Cardiología",
            "Traumatología",
            "Otorrinolaringología",
            "Medicina Familiar",
            "Medicina Estética",
            "Anatomía Patológica",
            "Infectología",
            "Medicina General",
            "Cirugía Cardiovascular",
            "Urología",
            "Diabetología",
            "Hematología"
        ]
    }
    ]
}
    """

 Escenario: Recuperar las especialidades asociadas a un centros médico
    Dado que existen especialidades asociadas a centros médicos en el sistema
    Cuando un usuario del sistema solicita la lista de especialidades asociadas al centro "Centro Médico Integral" para especialidadesCentro
    Entonces el sistema responde con un JSON para especialidadesCentro:
   
     """
   {
    "status_code": 200,
    "status_text": "Especialidades asociadas recuperadas correctamente",
    "data": [
            "Angiología",
            "Cirugía General",
            "Clínica Médica",
            "Diabetología",
            "Endoscopía Digestiva",
            "Ginecología",
            "Medicina Del Deporte",
            "Medicina Estética",
            "Medicina General",
            "Odontología",
            "Oftalmología",
            "Otorrinolaringología",
            "Pediatría",
            "Traumatología",
            "Urología"
        ]
    }
   """
