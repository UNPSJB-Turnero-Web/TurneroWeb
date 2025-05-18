# language: es

Característica: Asociar un médico a un Centro de Atención

  Antecedentes: 
    Dado que existe un sistema de gestión de centros de atención para MedicosCentro
    Y existen 9 centros de atención registrados en el sistema para MedicosCentro:
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

  Esquema del escenario: Asociar un médico a un centro de atención 

Cuando el administrador asocia el médico con "<nombre>", "<apellido>", <dni>, "<matricula>" y "<Especialidad>" al centro de atención "<Centro de Atención>"
    Entonces el sistema responde con status_code "<Status_Code>" y status_text "<Status_Text>" para MedicosCentro

  Ejemplos:
| Centro de Atención                | nombre     | apellido    | dni       | matricula | Especialidad              | Status_Code | Status_Text                           |
| Centro Médico Integral            | Martín     | Pérez       | 31105782  | 20735-0   | Infectología              | 200         | Médico asociado correctamente al centro|
| Centro de Salud Dr. Juan Perez    | Pedro      | López       | 40830678  | 87698-3   | Cardiología               | 200         | Médico asociado correctamente al centro|
| Trelew Salud                      | Martín     | López       | 41496804  | 52188-5   | Geriatría                 | 200         | Médico asociado correctamente al centro|
| Centro Médico Esperanza           | Cecilia    | Morales     | 28771160  | 99281-1   | Medicina General          | 200         | Médico asociado correctamente al centro|
| Clinica Rawson                    | Ricardo    | Rojas       | 43223623  | 47904-3   | Medicina Materno-Fetal    | 200         | Médico asociado correctamente al centro|
| Centro de Rehabilitación          | Gabriela   | Martínez    | 43137018  | 19123-8   | Emergentología            | 200         | Médico asociado correctamente al centro|
| Instituto Médico Patagonia        | Laura      | González    | 22640574  | 13311-4   | Cardiología               | 200         | Médico asociado correctamente al centro|
| Centro Odontológico Rawson        | Ana        | Fernández   | 20685893  | 89775-2   | Cirugía Plástica          | 200         | Médico asociado correctamente al centro|
| Centro Médico del Este            | Patricia   | Sánchez     | 26470521  | 45511-4   | Endoscopía Digestiva      | 200         | Médico asociado correctamente al centro|
| Centro Médico Integral            | Sofía      | Suárez      | 32037672  | 18236-8   | Otorrinolaringología      | 200         | Médico asociado correctamente al centro|
| Centro de Salud Dr. Juan Perez    | Pedro      | Pérez       | 42279752  | 58062-0   | Anatomía Patológica       | 200         | Médico asociado correctamente al centro|
| Trelew Salud                      | Ana        | Gómez       | 33386601  | 81637-7   | Nefrología                | 200         | Médico asociado correctamente al centro|
| Centro Médico Esperanza           | Gustavo    | González    | 41354734  | 50771-3   | Ginecología               | 200         | Médico asociado correctamente al centro|
| Clinica Rawson                    | Roberto    | Pérez       | 35234163  | 74039-0   | Hematología               | 200         | Médico asociado correctamente al centro|
| Centro de Rehabilitación          | Ricardo    | Gómez       | 20885569  | 74560-7   | Ginecología               | 200         | Médico asociado correctamente al centro|
| Instituto Médico Patagonia        | Sofía      | Martínez    | 34314596  | 71854-7   | Medicina Forense          | 200         | Médico asociado correctamente al centro|
| Centro Odontológico Rawson        | Lucía      | Fernández   | 34745100  | 97435-8   | Medicina del Trabajo      | 200         | Médico asociado correctamente al centro|
| Centro Médico del Este            | Martín     | Silva       | 29684163  | 73684-9   | Medicina Forense          | 200         | Médico asociado correctamente al centro|
| Centro Médico Integral            | Carlos     | López       | 43251052  | 97620-9   | Ginecología               | 200         | Médico asociado correctamente al centro|
| Centro de Salud Dr. Juan Perez    | Elena      | Rodríguez   | 30322166  | 69601-1   | Anestesiología            | 200         | Médico asociado correctamente al centro|
| Trelew Salud                      | Lucía      | Morales     | 39682518  | 80511-8   | Cirugía Cardiovascular    | 200         | Médico asociado correctamente al centro|
| Centro Médico Esperanza           | Gabriela   | Torres      | 43987268  | 69531-0   | Ortopedia y Traumatología | 200         | Médico asociado correctamente al centro|
| Clinica Rawson                    | Ricardo    | Ramírez     | 28212316  | 42823-4   | Urología                  | 200         | Médico asociado correctamente al centro|
| Centro de Rehabilitación          | Pedro      | Silva       | 22720084  | 39057-9   | Oftalmología              | 200         | Médico asociado correctamente al centro|
| Instituto Médico Patagonia        | Cecilia    | Díaz        | 40756842  | 60702-0   | Hepatología               | 200         | Médico asociado correctamente al centro|
| Centro Odontológico Rawson        | Roberto    | Castro      | 39108499  | 63642-1   | Odontología               | 200         | Médico asociado correctamente al centro|
| Centro Médico del Este            | Ricardo    | Morales     | 40664166  | 35675-0   | Angiología                | 200         | Médico asociado correctamente al centro|
| Centro Médico Integral            | Cecilia    | Sánchez     | 41896995  | 85312-7   | Cirugía General           | 200         | Médico asociado correctamente al centro|
| Centro de Salud Dr. Juan Perez    | Martín     | Rojas       | 32860322  | 33905-6   | Fisiatría                 | 200         | Médico asociado correctamente al centro|
| Trelew Salud                      | Ana        | Méndez      | 26399530  | 80565-9   | Diabetología              | 200         | Médico asociado correctamente al centro|
| Centro Médico Esperanza           | Gabriela   | Sánchez     | 35827626  | 33027-7   | Neonatología              | 200         | Médico asociado correctamente al centro|
| Clinica Rawson                    | Lucía      | Romero      | 38239159  | 78401-8   | Medicina Forense          | 200         | Médico asociado correctamente al centro|
| Centro de Rehabilitación          | Cecilia    | Morales     | 26046382  | 56617-0   | Medicina Estética         | 200         | Médico asociado correctamente al centro|
| Instituto Médico Patagonia        | Diego      | Ortiz       | 36563895  | 11198-5   | Genética Médica           | 200         | Médico asociado correctamente al centro|
| Centro Odontológico Rawson        | Ricardo    | Fernández   | 40620004  | 13954-5   | Hepatología               | 200         | Médico asociado correctamente al centro|
| Centro Médico del Este            | Verónica   | López       | 33676932  | 97483-6   | Endoscopía Digestiva      | 200         | Médico asociado correctamente al centro|

 Escenario: Recuperar todas los médicos asociadas a todos los centros
    Dado que existen médicos asociados a centros médicos en el sistema para MedicosCentro
    Cuando un usuario del sistema solicita la lista de médicos asociados para MedicosCentro
    Entonces el sistema responde con un JSON para MedicosCentro:
   
"""
{
  "status_code": 200,
  "status_text": "Staff médico recuperado correctamente",
  "data": [
    {
      "centro_de_atencion": "Centro Médico Integral",
      "medicos": [
        { "nombre": "Martín", "apellido": "Pérez", "dni": 31105782, "matricula": "20735-0", "especialidad": "Infectología" },
        { "nombre": "Sofía", "apellido": "Suárez", "dni": 32037672, "matricula": "18236-8", "especialidad": "Otorrinolaringología" },
        { "nombre": "Carlos", "apellido": "López", "dni": 43251052, "matricula": "97620-9", "especialidad": "Ginecología" },
        { "nombre": "Cecilia", "apellido": "Sánchez", "dni": 41896995, "matricula": "85312-7", "especialidad": "Cirugía General" }
      ]
    },
    {
      "centro_de_atencion": "Centro de Salud Dr. Juan Perez",
      "medicos": [
        { "nombre": "Pedro", "apellido": "López", "dni": 40830678, "matricula": "87698-3", "especialidad": "Cardiología" },
        { "nombre": "Pedro", "apellido": "Pérez", "dni": 42279752, "matricula": "58062-0", "especialidad": "Anatomía Patológica" },
        { "nombre": "Elena", "apellido": "Rodríguez", "dni": 30322166, "matricula": "69601-1", "especialidad": "Anestesiología" },
        { "nombre": "Martín", "apellido": "Rojas", "dni": 32860322, "matricula": "33905-6", "especialidad": "Fisiatría" }
      ]
    },
    {
      "centro_de_atencion": "Trelew Salud",
      "medicos": [
        { "nombre": "Martín", "apellido": "López", "dni": 41496804, "matricula": "52188-5", "especialidad": "Geriatría" },
        { "nombre": "Ana", "apellido": "Gómez", "dni": 33386601, "matricula": "81637-7", "especialidad": "Nefrología" },
        { "nombre": "Lucía", "apellido": "Morales", "dni": 39682518, "matricula": "80511-8", "especialidad": "Cirugía Cardiovascular" },
        { "nombre": "Ana", "apellido": "Méndez", "dni": 26399530, "matricula": "80565-9", "especialidad": "Diabetología" }
      ]
    },
    {
      "centro_de_atencion": "Centro Médico Esperanza",
      "medicos": [
        { "nombre": "Cecilia", "apellido": "Morales", "dni": 28771160, "matricula": "99281-1", "especialidad": "Medicina General" },
        { "nombre": "Gustavo", "apellido": "González", "dni": 41354734, "matricula": "50771-3", "especialidad": "Ginecología" },
        { "nombre": "Gabriela", "apellido": "Torres", "dni": 43987268, "matricula": "69531-0", "especialidad": "Ortopedia y Traumatología" },
        { "nombre": "Gabriela", "apellido": "Sánchez", "dni": 35827626, "matricula": "33027-7", "especialidad": "Neonatología" }
      ]
    },
    {
      "centro_de_atencion": "Clinica Rawson",
      "medicos": [
        { "nombre": "Ricardo", "apellido": "Rojas", "dni": 43223623, "matricula": "47904-3", "especialidad": "Medicina Materno-Fetal" },
        { "nombre": "Roberto", "apellido": "Pérez", "dni": 35234163, "matricula": "74039-0", "especialidad": "Hematología" },
        { "nombre": "Gustavo", "apellido": "González", "dni": 41354734, "matricula": "50771-3", "especialidad": "Ginecología" },
        { "nombre": "Ricardo", "apellido": "Ramírez", "dni": 28212316, "matricula": "42823-4", "especialidad": "Urología" },
        { "nombre": "Lucía", "apellido": "Romero", "dni": 38239159, "matricula": "78401-8", "especialidad": "Medicina Forense" }
      ]
    },
    {
      "centro_de_atencion": "Centro de Rehabilitación",
      "medicos": [
        { "nombre": "Gabriela", "apellido": "Martínez", "dni": 43137018, "matricula": "19123-8", "especialidad": "Emergentología" },
        { "nombre": "Ricardo", "apellido": "Gómez", "dni": 20885569, "matricula": "74560-7", "especialidad": "Ginecología" },
        { "nombre": "Pedro", "apellido": "Silva", "dni": 22720084, "matricula": "39057-9", "especialidad": "Oftalmología" },
        { "nombre": "Cecilia", "apellido": "Morales", "dni": 26046382, "matricula": "56617-0", "especialidad": "Medicina Estética" }
      ]
    },
    {
      "centro_de_atencion": "Instituto Médico Patagonia",
      "medicos": [
        { "nombre": "Laura", "apellido": "González", "dni": 22640574, "matricula": "13311-4", "especialidad": "Cardiología" },
        { "nombre": "Sofía", "apellido": "Martínez", "dni": 34314596, "matricula": "71854-7", "especialidad": "Medicina Forense" },
        { "nombre": "Cecilia", "apellido": "Díaz", "dni": 40756842, "matricula": "60702-0", "especialidad": "Hepatología" },
        { "nombre": "Diego", "apellido": "Ortiz", "dni": 36563895, "matricula": "11198-5", "especialidad": "Genética Médica" }
      ]
    },
    {
      "centro_de_atencion": "Centro Odontológico Rawson",
      "medicos": [
        { "nombre": "Ana", "apellido": "Fernández", "dni": 20685893, "matricula": "89775-2", "especialidad": "Cirugía Plástica" },
        { "nombre": "Lucía", "apellido": "Fernández", "dni": 34745100, "matricula": "97435-8", "especialidad": "Medicina del Trabajo" },
        { "nombre": "Roberto", "apellido": "Castro", "dni": 39108499, "matricula": "63642-1", "especialidad": "Odontología" },
        { "nombre": "Ricardo", "apellido": "Fernández", "dni": 40620004, "matricula": "13954-5", "especialidad": "Hepatología" }
      ]
    },
    {
      "centro_de_atencion": "Centro Médico del Este",
      "medicos": [
        { "nombre": "Patricia", "apellido": "Sánchez", "dni": 26470521, "matricula": "45511-4", "especialidad": "Endoscopía Digestiva" },
        { "nombre": "Martín", "apellido": "Silva", "dni": 29684163, "matricula": "73684-9", "especialidad": "Medicina Forense" },
        { "nombre": "Ricardo", "apellido": "Morales", "dni": 40664166, "matricula": "35675-0", "especialidad": "Angiología" },
        { "nombre": "Verónica", "apellido": "López", "dni": 33676932, "matricula": "97483-6", "especialidad": "Endoscopía Digestiva" }
      ]
    }
  ]
}
"""