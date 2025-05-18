# language: es

Característica: Crear médico

  Esquema del escenario: Crear un médico
Cuando el administrador crea un médico con "<nombre>", "<apellido>", "<dni>", "<matricula>", "<especialidad>"
    Entonces el sistema responde con <status_code> y "<status_text>" para medicos

  Ejemplos:
    | nombre    | apellido   | dni       | matricula | especialidad           | status_code | status_text                        |
    | Martín    | Pérez      | 31105782  | 20735-0   | Infectología           | 200         | Médico creado correctamente     |
    | Pedro     | López      | 40830678  | 87698-3   | Cardiología           | 200         | Médico creado correctamente     |
    | Martín    | López      | 41496804  | 52188-5   | Geriatría              | 200         | Médico creado correctamente     |
    | Cecilia   | Morales    | 28771160  | 99281-1   | Medicina General       | 200         | Médico creado correctamente     |
    | Ricardo   | Rojas      | 43223623  | 47904-3   | Medicina Materno-Fetal | 200         | Médico creado correctamente     |
    | Gabriela  | Martínez   | 43137018  | 19123-8   | Emergentología         | 200         | Médico creado correctamente     |
    | Laura     | González   | 22640574  | 13311-4   | Cardiología            | 200         | Médico creado correctamente     |
    | Ana       | Fernández  | 20685893  | 89775-2   | Cirugía Plástica       | 200         | Médico creado correctamente     |
    | Patricia  | Sánchez    | 26470521  | 45511-4   | Endoscopía Digestiva   | 200         | Médico creado correctamente     |
    | Sofía     | Suárez     | 32037672  | 18236-8   | Otorrinolaringología   | 200         | Médico creado correctamente     |
    | Pedro     | Pérez      | 42279752  | 58062-0   | Anatomía Patológica    | 200         | Médico creado correctamente     |
    | Ana       | Gómez      | 33386601  | 81637-7   | Nefrología             | 200         | Médico creado correctamente     |
    | Gustavo   | González   | 41354734  | 50771-3   | Ginecología            | 200         | Médico creado correctamente     |
    | Roberto   | Pérez      | 35234163  | 74039-0   | Hematología            | 200         | Médico creado correctamente     |
    | Ricardo   | Gómez      | 20885569  | 74560-7   | Ginecología              | 200         | Médico creado correctamente     |
    | Sofía     | Martínez   | 34314596  | 71854-7   | Medicina Forense       | 200         | Médico creado correctamente     |
    | Lucía     | Fernández  | 34745100  | 97435-8   | Medicina del Trabajo   | 200         | Médico creado correctamente     |
    | Martín    | Silva      | 29684163  | 73684-9   | Medicina Forense       | 200         | Médico creado correctamente     |
    | Carlos    | López      | 43251052  | 97620-9   | Ginecología            | 200         | Médico creado correctamente     |
    | Elena     | Rodríguez  | 30322166  | 69601-1   | Anestesiología         | 200         | Médico creado correctamente     |
    | Lucía     | Morales    | 39682518  | 80511-8   | Cirugía Cardiovascular | 200         | Médico creado correctamente     |
    | Gabriela  | Torres     | 43987268  | 69531-0   | Ortopedia y Traumatología | 200      | Médico creado correctamente     |
    | Ricardo   | Ramírez    | 28212316  | 42823-4   | Urología               | 200         | Médico creado correctamente     |
    | Pedro     | Silva      | 22720084  | 39057-9   | Oftalmología           | 200         | Médico creado correctamente     |
    | Cecilia   | Díaz       | 40756842  | 60702-0   | Hepatología            | 200         | Médico creado correctamente     |
    | Roberto   | Castro     | 39108499  | 63642-1   | Odontología            | 200         | Médico creado correctamente     |
    | Ricardo   | Morales    | 40664166  | 35675-0   | Angiología             | 200         | Médico creado correctamente     |
    | Cecilia   | Sánchez    | 41896995  | 85312-7   | Cirugía General        | 200         | Médico creado correctamente     |
    | Martín    | Rojas      | 32860322  | 33905-6   | Fisiatría              | 200         | Médico creado correctamente     |
    | Ana       | Pérez      | 38060705  | 55469-1   | Genética Médica        | 200         | Médico creado correctamente     |
    | Ana       | Méndez     | 26399530  | 80565-9   | Diabetología           | 200         | Médico creado correctamente     |
    | Gabriela  | Sánchez    | 35827626  | 33027-7   | Neonatología           | 200         | Médico creado correctamente     |
    | Lucía     | Romero     | 38239159  | 78401-8   | Medicina Forense       | 200         | Médico creado correctamente     |
    | Cecilia   | Morales    | 26046382  | 56617-0   | Medicina Estética      | 200         | Médico creado correctamente     |
    | Diego     | Ortiz      | 36563895  | 11198-5   | Genética Médica        | 200         | Médico creado correctamente     |
    | Ricardo   | Fernández  | 40620004  | 13954-5   | Hepatología            | 200         | Médico creado correctamente     |
    | Verónica  | López      | 33676932  | 97483-6   | Endoscopía Digestiva   | 200         | Médico creado correctamente     |
    | María     | Romero     | 21168828  | 73234-1   | Genética Médica        | 200         | Médico creado correctamente     |
    | Patricia  | Ramírez    | 32844301  | 57204-2   | Clínica Médica         | 200         | Médico creado correctamente     |
    | Carlos    | Rodríguez  | 29730992  | 94975-9   | Oftalmología           | 200         | Médico creado correctamente     |
    | Gabriela  | Vargas     | 29364849  | 94366-6   | Psiquiatría            | 200         | Médico creado correctamente     |
    | Ricardo   | Sánchez    | 41471017  | 64144-4   | Cirugía Vascular       | 200         | Médico creado correctamente     |
    | Diego     | Rodríguez  | 30882721  | 54352-5   | Medicina del Deporte   | 200         | Médico creado correctamente     |
    | María     | Torres     | 41716039  | 76285-3   | Nutrición              | 200         | Médico creado correctamente     |
    | Gabriela  | Sánchez    | 31994348  | 76992-4   | Otorrinolaringología   | 200         | Médico creado correctamente     |
    | Ana       | Ramírez    | 24502601  | 72945-0   | Fisiatría              | 200         | Médico creado correctamente     |
    | Elena     | Romero     | 33267640  | 69490-9   | Medicina Estética      | 200         | Médico creado correctamente     |
    | Laura     | Torres     | 22330414  | 60233-5   | Medicina del Deporte   | 200         | Médico creado correctamente     |
    | Ricardo   | Rodríguez  | 40220839  | 90446-5   | Dermatología           | 200         | Médico creado correctamente     |
    | Juan      | Torres     | 31993158  | 20376-9   | Dermatología           | 200         | Médico creado correctamente     |
    | Laura     | Suárez     | 36051990  | 40154-1   | Ortopedia y Traumatología | 200      | Médico creado correctamente     |
    | Patricia  | Ortiz      | 43121366  | 25763-9   | Hepatología            | 200         | Médico creado correctamente     |
    | Pedro     | Suárez     | 41759309  | 33695-7   | Cirugía Vascular       | 200         | Médico creado correctamente     |
    | Ana       | Silva      | 25294692  | 94013-6   | Nutrición              | 200         | Médico creado correctamente     |
    | Lucía     | Ortiz      | 32052018  | 85463-0   | Medicina Interna       | 200         | Médico creado correctamente     |
    | Laura     | Martínez   | 24045378  | 23884-7   | Genética Médica        | 200         | Médico creado correctamente     |
    | Pedro     | Silva      | 31232851  | 46280-1   | Medicina Interna       | 200         | Médico creado correctamente     |
    | Fernando  | Castro     | 37544297  | 44669-5   | Cirugía Vascular       | 200         | Médico creado correctamente     |
    | Pedro     | Vargas     | 35877839  | 15112-5   | Ginecología            | 200         | Médico creado correctamente     |
    | Cecilia   | López      | 34327560  | 94765-8   | Odontología            | 200         | Médico creado correctamente     |
    | Laura     | González   | 23277412  | 12610-3   | Pediatría              | 200         | Médico creado correctamente     |
    | Carlos    | Morales    | 27175400  | 77746-6   | Cirugía Plástica       | 200         | Médico creado correctamente     |
    | Juan      | Torres     | 29664654  | 47376-0   | Dermatología           | 200         | Médico creado correctamente     |
    | Carlos    | López      | 37411336  | 62561-7   | Genética Médica        | 200         | Médico creado correctamente     |
    | Roberto   | Ramírez    | 22799659  | 92046-4   | Neurología             | 200         | Médico creado correctamente     |
    | Javier    | Sánchez    | 27427954  | 26417-6   | Medicina Forense       | 200         | Médico creado correctamente     |
    | Patricia  | Vargas     | 34991094  | 37457-7   | Urología               | 200         | Médico creado correctamente     |
    | Gabriela  | Díaz       | 34280407  | 85426-0   | Hepatología            | 200         | Médico creado correctamente     |
    | Ricardo   | Romero     | 42782001  | 14377-8   | Neumonología           | 200         | Médico creado correctamente     |
    | Fernando  | Castro     | 33506029  | 66669-5   | Medicina del Deporte   | 200         | Médico creado correctamente     |
    | Pedro     | Castro     | 27514920  | 30051-3   | Cardiología            | 200         | Médico creado correctamente     |
    | María     | López      | 28092860  | 39100-1   | Odontología            | 200         | Médico creado correctamente     |
    | Sofía     | Ramírez    | 20441229  | 49018-6   | Odontología            | 200         | Médico creado correctamente     |
    | Laura     | Díaz       | 42175076  | 45609-7   | Alergia e Inmunología  | 200         | Médico creado correctamente     |
    | Gustavo   | Torres     | 36681588  | 44846-4   | Odontología            | 200         | Médico creado correctamente     |
    | Javier    | Gómez      | 21743323  | 57085-3   | Odontología            | 200         | Médico creado correctamente     |
    | Gustavo   | Pérez      | 38575678  | 17580-0   | Medicina Familiar      | 200         | Médico creado correctamente     |
    | Elena     | Suárez     | 26530118  | 93163-3   | Diabetología           | 200         | Médico creado correctamente     |
    | Laura     | Morales    | 39839550  | 69989-4   | Neumonología           | 200         | Médico creado correctamente     |
    # Casos de error
    | Diego     | Méndez     | 20441229  | 99768-3   | Urología               | 409         | El dni ya existe en el sistema     |
    | Roberto   | González   | 99999999  | 17580-0   | Emergentología         | 409         | La Matrícula ya existe en el sistema|
    | Laura     | Ramírez    | 248348--66| 94546-4   | Alergia e Inmunología  | 400         | dni incorrecto, débe contener sólo números |
    | Carlos    | Díaz       |           | 37245-6   | Neurología             | 400         | El dni es obligatorio              |
    | Cecilia   | Romero     | 24204926  |           | Emergentología         | 409        | La matrícula es obligatoria        |
    | Fernando  | Méndez     | 41305320  | 53747-0   | Neurocirugíaaaaaa      | 400         | La especialidad NO existe          |
    |           | Sánchez    | 8888888   | 888888    | Medicina Forense       | 400         | El Nombre es obligatorio           |
    | Patricia  |           | 77777777  | 777777    | Urología               | 400         | El apellido es obligatorio         |

  Escenario: Recuperar todas los médicos registrados en el sistema
    Dado que existen 100 medicos registrados en el sistema
    Cuando un usuario del sistema solicita la lista de medicos
    Entonces el sistema responde con un JSON:
    
    """
{
    "status_code": 200,
    "status_text": "médicos recuperados correctamente",
    "data": [
    {
        "nombre":"Martín",
        "apellido":"Pérez",
        "dni":31105782,
        "matricula":"20735-0",
        "especialidad":"Infectología"
    },
    {
        "nombre":"Pedro",
        "apellido":"López",
        "dni":40830678,
        "matricula":"87698-3",
        "especialidad":"Reumatología"
    },
    {
        "nombre":"Martín",
        "apellido":"López",
        "dni":41496804,
        "matricula":"52188-5",
        "especialidad":"Geriatría"
    },
    {
        "nombre":"Cecilia",
        "apellido":"Morales",
        "dni":28771160,
        "matricula":"99281-1",
        "especialidad":"Medicina General"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Rojas",
        "dni":43223623,
        "matricula":"47904-3",
        "especialidad":"Medicina Materno-Fetal"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Martínez",
        "dni":43137018,
        "matricula":"19123-8",
        "especialidad":"Emergentología"
    },
    {
        "nombre":"Laura",
        "apellido":"González",
        "dni":22640574,
        "matricula":"13311-4",
        "especialidad":"Cardiología"
    },
    {
        "nombre":"Laura",
        "apellido":"Méndez",
        "dni":21435910,
        "matricula":"68796-7",
        "especialidad":"Medicina Interna"
    },
    {
        "nombre":"Laura",
        "apellido":"Méndez",
        "dni":21383552,
        "matricula":"81701-9",
        "especialidad":"Emergentología"
    },
    {
        "nombre":"Verónica",
        "apellido":"Torres",
        "dni":43518736,
        "matricula":"17287-9",
        "especialidad":"Odontología"
    },
    {
        "nombre":"Carlos",
        "apellido":"Díaz",
        "dni":29983797,
        "matricula":"56654-7",
        "especialidad":"Neonatología"
    },
    {
        "nombre":"Lucía",
        "apellido":"Méndez",
        "dni":39396719,
        "matricula":"49824-7",
        "especialidad":"Medicina General"
    },
    {
        "nombre":"Laura",
        "apellido":"Suárez",
        "dni":22560933,
        "matricula":"26225-4",
        "especialidad":"Urología"
    },
    {
        "nombre":"Patricia",
        "apellido":"Díaz",
        "dni":26632849,
        "matricula":"70839-8",
        "especialidad":"Geriatría"
    },
    {
        "nombre":"Pedro",
        "apellido":"Castro",
        "dni":33197365,
        "matricula":"10764-3",
        "especialidad":"Alergia e Inmunología"
    },
    {
        "nombre":"Martín",
        "apellido":"Suárez",
        "dni":40456304,
        "matricula":"23049-2",
        "especialidad":"Cardiología"
    },
    {
        "nombre":"Ana",
        "apellido":"Fernández",
        "dni":20685893,
        "matricula":"89775-2",
        "especialidad":"Cirugía Plástica"
    },
    {
        "nombre":"Patricia",
        "apellido":"Sánchez",
        "dni":26470521,
        "matricula":"45511-4",
        "especialidad":"Endoscopía Digestiva"
    },
    {
        "nombre":"Sofía",
        "apellido":"Suárez",
        "dni":32037672,
        "matricula":"18236-8",
        "especialidad":"Otorrinolaringología"
    },
    {
        "nombre":"Fernando",
        "apellido":"Suárez",
        "dni":38925485,
        "matricula":"47262-8",
        "especialidad":"Clínica Médica"
    },
    {
        "nombre":"Pedro",
        "apellido":"Pérez",
        "dni":42279752,
        "matricula":"58062-0",
        "especialidad":"Anatomía Patológica"
    },
    {
        "nombre":"Ricardo",
        "apellido":"González",
        "dni":26780884,
        "matricula":"44480-0",
        "especialidad":"Endoscopía Digestiva"
    },
    {
        "nombre":"Ana",
        "apellido":"Gómez",
        "dni":33386601,
        "matricula":"81637-7",
        "especialidad":"Nefrología"
    },
    {
        "nombre":"Gustavo",
        "apellido":"González",
        "dni":41354734,
        "matricula":"50771-3",
        "especialidad":"Ginecología"
    },
    {
        "nombre":"Roberto",
        "apellido":"Pérez",
        "dni":35234163,
        "matricula":"74039-0",
        "especialidad":"Hematología"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Gómez",
        "dni":20885569,
        "matricula":"74560-7",
        "especialidad":"Oncología"
    },
    {
        "nombre":"Sofía",
        "apellido":"Martínez",
        "dni":34314596,
        "matricula":"71854-7",
        "especialidad":"Medicina Forense"
    },
    {
        "nombre":"Lucía",
        "apellido":"Fernández",
        "dni":34745100,
        "matricula":"97435-8",
        "especialidad":"Medicina del Trabajo"
    },
    {
        "nombre":"Martín",
        "apellido":"Silva",
        "dni":29684163,
        "matricula":"73684-9",
        "especialidad":"Medicina Forense"
    },
    {
        "nombre":"Carlos",
        "apellido":"López",
        "dni":43251052,
        "matricula":"97620-9",
        "especialidad":"Ginecología"
    },
    {
        "nombre":"Elena",
        "apellido":"Rodríguez",
        "dni":30322166,
        "matricula":"69601-1",
        "especialidad":"Anestesiología"
    },
    {
        "nombre":"Roberto",
        "apellido":"Castro",
        "dni":22703709,
        "matricula":"33470-6",
        "especialidad":"Medicina Materno-Fetal"
    },
    {
        "nombre":"Sofía",
        "apellido":"Méndez",
        "dni":38197809,
        "matricula":"69241-8",
        "especialidad":"Medicina General"
    },
    {
        "nombre":"Lucía",
        "apellido":"Morales",
        "dni":39682518,
        "matricula":"80511-8",
        "especialidad":"Cirugía Cardiovascular"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Torres",
        "dni":43987268,
        "matricula":"69531-0",
        "especialidad":"Ortopedia y Traumatología"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Ramírez",
        "dni":28212316,
        "matricula":"42823-4",
        "especialidad":"Urología"
    },
    {
        "nombre":"Pedro",
        "apellido":"Silva",
        "dni":22720084,
        "matricula":"39057-9",
        "especialidad":"Oftalmología"
    },
    {
        "nombre":"Cecilia",
        "apellido":"Díaz",
        "dni":40756842,
        "matricula":"60702-0",
        "especialidad":"Hepatología"
    },
    {
        "nombre":"Roberto",
        "apellido":"Castro",
        "dni":39108499,
        "matricula":"63642-1",
        "especialidad":"Cirugía Torácica"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Morales",
        "dni":40664166,
        "matricula":"35675-0",
        "especialidad":"Angiología"
    },
    {
        "nombre":"Cecilia",
        "apellido":"Sánchez",
        "dni":41896995,
        "matricula":"85312-7",
        "especialidad":"Cirugía General"
    },
    {
        "nombre":"Martín",
        "apellido":"Rojas",
        "dni":32860322,
        "matricula":"33905-6",
        "especialidad":"Fisiatría"
    },
    {
        "nombre":"Ana",
        "apellido":"Pérez",
        "dni":38060705,
        "matricula":"55469-1",
        "especialidad":"Genética Médica"
    },
    {
        "nombre":"Ana",
        "apellido":"Méndez",
        "dni":26399530,
        "matricula":"80565-9",
        "especialidad":"Diabetología"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Sánchez",
        "dni":35827626,
        "matricula":"33027-7",
        "especialidad":"Neonatología"
    },
    {
        "nombre":"Lucía",
        "apellido":"Romero",
        "dni":38239159,
        "matricula":"78401-8",
        "especialidad":"Medicina Forense"
    },
    {
        "nombre":"Cecilia",
        "apellido":"Morales",
        "dni":26046382,
        "matricula":"56617-0",
        "especialidad":"Medicina Estética"
    },
    {
        "nombre":"Diego",
        "apellido":"Ortiz",
        "dni":36563895,
        "matricula":"11198-5",
        "especialidad":"Genética Médica"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Fernández",
        "dni":40620004,
        "matricula":"13954-5",
        "especialidad":"Hepatología"
    },
    {
        "nombre":"Verónica",
        "apellido":"López",
        "dni":33676932,
        "matricula":"97483-6",
        "especialidad":"Endoscopía Digestiva"
    },
    {
        "nombre":"María",
        "apellido":"Romero",
        "dni":21168828,
        "matricula":"73234-1",
        "especialidad":"Genética Médica"
    },
    {
        "nombre":"Patricia",
        "apellido":"Ramírez",
        "dni":32844301,
        "matricula":"57204-2",
        "especialidad":"Clínica Médica"
    },
    {
        "nombre":"Carlos",
        "apellido":"Rodríguez",
        "dni":29730992,
        "matricula":"94975-9",
        "especialidad":"Oftalmología"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Vargas",
        "dni":29364849,
        "matricula":"94366-6",
        "especialidad":"Psiquiatría"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Sánchez",
        "dni":41471017,
        "matricula":"64144-4",
        "especialidad":"Cirugía Vascular"
    },
    {
        "nombre":"Diego",
        "apellido":"Rodríguez",
        "dni":30882721,
        "matricula":"54352-5",
        "especialidad":"Medicina del Deporte"
    },
    {
        "nombre":"María",
        "apellido":"Torres",
        "dni":41716039,
        "matricula":"76285-3",
        "especialidad":"Oncología"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Sánchez",
        "dni":31994348,
        "matricula":"76992-4",
        "especialidad":"Otorrinolaringología"
    },
    {
        "nombre":"Ana",
        "apellido":"Ramírez",
        "dni":24502601,
        "matricula":"72945-0",
        "especialidad":"Fisiatría"
    },
    {
        "nombre":"Elena",
        "apellido":"Romero",
        "dni":33267640,
        "matricula":"69490-9",
        "especialidad":"Medicina Estética"
    },
    {
        "nombre":"Laura",
        "apellido":"Torres",
        "dni":22330414,
        "matricula":"60233-5",
        "especialidad":"Medicina del Deporte"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Rodríguez",
        "dni":40220839,
        "matricula":"90446-5",
        "especialidad":"Reumatología"
    },
    {
        "nombre":"Juan",
        "apellido":"Torres",
        "dni":31993158,
        "matricula":"20376-9",
        "especialidad":"Cirugía Maxilofacial"
    },
    {
        "nombre":"Laura",
        "apellido":"Suárez",
        "dni":36051990,
        "matricula":"40154-1",
        "especialidad":"Ortopedia y Traumatología"
    },
    {
        "nombre":"Patricia",
        "apellido":"Ortiz",
        "dni":43121366,
        "matricula":"25763-9",
        "especialidad":"Hepatología"
    },
    {
        "nombre":"Pedro",
        "apellido":"Suárez",
        "dni":41759309,
        "matricula":"33695-7",
        "especialidad":"Cirugía Vascular"
    },
    {
        "nombre":"Ana",
        "apellido":"Silva",
        "dni":25294692,
        "matricula":"94013-6",
        "especialidad":"Nutrición"
    },
    {
        "nombre":"Lucía",
        "apellido":"Ortiz",
        "dni":32052018,
        "matricula":"85463-0",
        "especialidad":"Medicina Interna"
    },
    {
        "nombre":"Laura",
        "apellido":"Martínez",
        "dni":24045378,
        "matricula":"23884-7",
        "especialidad":"Genética Médica"
    },
    {
        "nombre":"Pedro",
        "apellido":"Silva",
        "dni":31232851,
        "matricula":"46280-1",
        "especialidad":"Medicina Interna"
    },
    {
        "nombre":"Fernando",
        "apellido":"Castro",
        "dni":37544297,
        "matricula":"44669-5",
        "especialidad":"Cirugía Vascular"
    },
    {
        "nombre":"Pedro",
        "apellido":"Vargas",
        "dni":35877839,
        "matricula":"15112-5",
        "especialidad":"Ginecología"
    },
    {
        "nombre":"Martín",
        "apellido":"Suárez",
        "dni":33628824,
        "matricula":"41378-3",
        "especialidad":"Cirugía Vascular"
    },
    {
        "nombre":"Cecilia",
        "apellido":"López",
        "dni":34327560,
        "matricula":"94765-8",
        "especialidad":"Odontología"
    },
    {
        "nombre":"Laura",
        "apellido":"González",
        "dni":23277412,
        "matricula":"12610-3",
        "especialidad":"Pediatría"
    },
    {
        "nombre":"Carlos",
        "apellido":"Morales",
        "dni":27175400,
        "matricula":"77746-6",
        "especialidad":"Cirugía Plástica"
    },
    {
        "nombre":"Juan",
        "apellido":"Torres",
        "dni":29664654,
        "matricula":"47376-0",
        "especialidad":"Dermatología"
    },
    {
        "nombre":"Carlos",
        "apellido":"López",
        "dni":37411336,
        "matricula":"62561-7",
        "especialidad":"Genética Médica"
    },
    {
        "nombre":"Roberto",
        "apellido":"Ramírez",
        "dni":22799659,
        "matricula":"92046-4",
        "especialidad":"Neurología"
    },
    {
        "nombre":"Javier",
        "apellido":"Sánchez",
        "dni":27427954,
        "matricula":"26417-6",
        "especialidad":"Medicina Forense"
    },
    {
        "nombre":"Patricia",
        "apellido":"Vargas",
        "dni":34991094,
        "matricula":"37457-7",
        "especialidad":"Urología"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Díaz",
        "dni":34280407,
        "matricula":"85426-0",
        "especialidad":"Hepatología"
    },
    {
        "nombre":"Ricardo",
        "apellido":"Romero",
        "dni":42782001,
        "matricula":"14377-8",
        "especialidad":"Neumonología"
    },
    {
        "nombre":"Fernando",
        "apellido":"Castro",
        "dni":33506029,
        "matricula":"66669-5",
        "especialidad":"Medicina del Deporte"
    },
    {
        "nombre":"Pedro",
        "apellido":"Castro",
        "dni":27514920,
        "matricula":"30051-3",
        "especialidad":"Cardiología"
    },
    {
        "nombre":"María",
        "apellido":"López",
        "dni":28092860,
        "matricula":"39100-1",
        "especialidad":"Odontología"
    },
    {
        "nombre":"Sofía",
        "apellido":"Ramírez",
        "dni":43015697,
        "matricula":"49018-6",
        "especialidad":"Cirugía Torácica"
    },
    {
        "nombre":"Laura",
        "apellido":"Díaz",
        "dni":42175076,
        "matricula":"45609-7",
        "especialidad":"Alergia e Inmunología"
    },
    {
        "nombre":"Gustavo",
        "apellido":"Torres",
        "dni":36681588,
        "matricula":"44846-4",
        "especialidad":"Odontología"
    },
    {
        "nombre":"Javier",
        "apellido":"Gómez",
        "dni":21743323,
        "matricula":"57085-3",
        "especialidad":"Cirugía Torácica"
    },
    {
        "nombre":"Gustavo",
        "apellido":"Pérez",
        "dni":38575678,
        "matricula":"49274-9",
        "especialidad":"Medicina Familiar"
    },
    {
        "nombre":"Elena",
        "apellido":"Suárez",
        "dni":26530118,
        "matricula":"93163-3",
        "especialidad":"Diabetología"
    },
    {
        "nombre":"Laura",
        "apellido":"Morales",
        "dni":39839550,
        "matricula":"69989-4",
        "especialidad":"Neumonología"
    },
    {
        "nombre":"Gabriela",
        "apellido":"Ramírez",
        "dni":32049132,
        "matricula":"16529-6",
        "especialidad":"Cirugía Maxilofacial"
    },
    {
        "nombre":"Diego",
        "apellido":"Méndez",
        "dni":20441229,
        "matricula":"99768-3",
        "especialidad":"Urología"
    },
    {
        "nombre":"Roberto",
        "apellido":"González",
        "dni":34035231,
        "matricula":"17580-0",
        "especialidad":"Emergentología"
    },
    {
        "nombre":"Laura",
        "apellido":"Ramírez",
        "dni":24834866,
        "matricula":"94546-4",
        "especialidad":"Alergia e Inmunología"
    },
    {
        "nombre":"Carlos",
        "apellido":"Díaz",
        "dni":28156787,
        "matricula":"37245-6",
        "especialidad":"Neurología"
    },
    {
        "nombre":"Cecilia",
        "apellido":"Romero",
        "dni":24204926,
        "matricula":"51754-6",
        "especialidad":"Emergentología"
    },
    {
        "nombre":"Fernando",
        "apellido":"Méndez",
        "dni":41305320,
        "matricula":"53747-0",
        "especialidad":"Neurocirugía"
    }
  ]
}
  """"
