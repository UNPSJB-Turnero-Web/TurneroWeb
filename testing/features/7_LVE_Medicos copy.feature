# language: es

Característica: Asociar un médico a un Centro de Atención

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

  Esquema del escenario: Asociar un médico a un centro de atención

    Cuando el administrador asocia el médico con "<nombre>", "<apellido>", <dni>, "<matrícula>" y "<especialidad>" al centro de atención "<centro_de_atencion>"
    Entonces el sistema responde con <status_code> y "<status_text>"

  Ejemplos:
| Centro de Atención | nombre | apellido | dni | matricula | Especialidad | Status Code | Status Text |
| Centro Médico Integral | Gustavo | Torres | 36681588 | 44846-4 | Odontología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Carlos | Rodríguez | 29730992 | 94975-9 | Oftalmología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Laura | González | 23277412 | 12610-3 | Pediatría | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Patricia | Ramírez | 32844301 | 57204-2 | Clínica Médica | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Fernando | Castro | 33506029 | 66669-5 | Medicina del Deporte | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Sofía | Méndez | 38197809 | 69241-8 | Medicina General | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Elena | Suárez | 26530118 | 93163-3 | Diabetología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Verónica | López | 33676932 | 97483-6 | Endoscopía Digestiva | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Pedro | Vargas | 35877839 | 15112-5 | Ginecología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Diego | Méndez | 20441229 | 99768-3 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Ricardo | Morales | 40664166 | 35675-0 | Angiología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Gabriela | Sánchez | 31994348 | 76992-4 | Otorrinolaringología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Cecilia | Sánchez | 41896995 | 85312-7 | Cirugía General | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Integral | Elena | Romero | 33267640 | 69490-9 | Medicina Estética | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Pedro | Silva | 22720084 | 39057-9 | Oftalmología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | María | López | 28092860 | 39100-1 | Odontología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Fernando | Suárez | 38925485 | 47262-8 | Clínica Médica | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Ana | Ramírez | 24502601 | 72945-0 | Fisiatría | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Pedro | Silva | 31232851 | 46280-1 | Medicina Interna | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Gabriela | Sánchez | 35827626 | 33027-7 | Neonatología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Martín | Suárez | 33628824 | 41378-3 | Cirugía Vascular | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Gustavo | Pérez | 38575678 | 49274-9 | Medicina Familiar | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Carlos | López | 37411336 | 62561-7 | Genética Médica | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Patricia | Vargas | 34991094 | 37457-7 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Salud Rawson | Javier | Sánchez | 27427954 | 26417-6 | Medicina Forense | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Pedro | Castro | 27514920 | 30051-3 | Cardiología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Cecilia | López | 34327560 | 94765-8 | Odontología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Juan | Torres | 29664654 | 47376-0 | Dermatología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Carlos | López | 43251052 | 97620-9 | Ginecología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Laura | Suárez | 36051990 | 40154-1 | Ortopedia y Traumatología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Ricardo | Ramírez | 28212316 | 42823-4 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Gabriela | Díaz | 34280407 | 85426-0 | Hepatología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Patricia | Díaz | 26632849 | 70839-8 | Geriatría | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Martín | Rojas | 32860322 | 33905-6 | Fisiatría | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Ana | Silva | 25294692 | 94013-6 | Nutrición | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Sofía | Suárez | 32037672 | 18236-8 | Otorrinolaringología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Ricardo | González | 26780884 | 44480-0 | Endoscopía Digestiva | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Martín | Pérez | 31105782 | 20735-0 | Infectología | 200 | Asociación de médico en centro realizada correctamente |
| Trelew Salud | Lucía | Morales | 39682518 | 80511-8 | Cirugía Cardiovascular | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Martín | Suárez | 40456304 | 23049-2 | Cardiología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Gustavo | González | 41354734 | 50771-3 | Ginecología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Verónica | Torres | 43518736 | 17287-9 | Odontología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Laura | Suárez | 22560933 | 26225-4 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Roberto | Castro | 22703709 | 33470-6 | Medicina Materno-Fetal | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Gabriela | Torres | 43987268 | 69531-0 | Ortopedia y Traumatología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Laura | Morales | 39839550 | 69989-4 | Neumonología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Carlos | Morales | 27175400 | 77746-6 | Cirugía Plástica | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Patricia | Sánchez | 26470521 | 45511-4 | Endoscopía Digestiva | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Cecilia | Romero | 24204926 | 51754-6 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Carlos | Díaz | 29983797 | 56654-7 | Neonatología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico Esperanza | Lucía | Fernández | 34745100 | 97435-8 | Medicina del Trabajo | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Laura | González | 22640574 | 13311-4 | Cardiología | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Roberto | Pérez | 35234163 | 74039-0 | Hematología | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Patricia | Ortiz | 43121366 | 25763-9 | Hepatología | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Carlos | Díaz | 28156787 | 37245-6 | Neurología | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Pedro | Pérez | 42279752 | 58062-0 | Anatomía Patológica | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Cecilia | Morales | 26046382 | 56617-0 | Medicina Estética | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Ana | Méndez | 26399530 | 80565-9 | Diabetología | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Lucía | Romero | 38239159 | 78401-8 | Medicina Forense | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Ana | Fernández | 20685893 | 89775-2 | Cirugía Plástica | 200 | Asociación de médico en centro realizada correctamente |
| Clinica Rawson | Fernando | Méndez | 41305320 | 53747-0 | Neurocirugía | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Gabriela | Vargas | 29364849 | 94366-6 | Psiquiatría | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Laura | Torres | 22330414 | 60233-5 | Medicina del Deporte | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Elena | Rodríguez | 30322166 | 69601-1 | Anestesiología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Fernando | Castro | 37544297 | 44669-5 | Cirugía Vascular | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Lucía | Méndez | 39396719 | 49824-7 | Medicina General | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Ana | Gómez | 33386601 | 81637-7 | Nefrología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Martín | Silva | 29684163 | 73684-9 | Medicina Forense | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Fernando | Méndez | 41305320 | 53747-0 | Neurocirugía | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Cecilia | Romero | 24204926 | 51754-6 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Centro de Rehabilitación | Carlos | Díaz | 28156787 | 37245-6 | Neurología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Cecilia | Morales | 28771160 | 99281-1 | Medicina General | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Fernando | Méndez | 41305320 | 53747-0 | Neurocirugía | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Cecilia | Romero | 24204926 | 51754-6 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Carlos | Díaz | 28156787 | 37245-6 | Neurología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Laura | Ramírez | 24834866 | 94546-4 | Alergia e Inmunología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Roberto | González | 34035231 | 17580-0 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Diego | Méndez | 20441229 | 99768-3 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Gabriela | Ramírez | 32049132 | 16529-6 | Cirugía Maxilofacial | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Laura | Morales | 39839550 | 69989-4 | Neumonología | 200 | Asociación de médico en centro realizada correctamente |
| Instituto Médico Patagonia | Elena | Suárez | 26530118 | 93163-3 | Diabetología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Fernando | Méndez | 41305320 | 53747-0 | Neurocirugía | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Ricardo | Romero | 42782001 | 14377-8 | Neumonología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Laura | Martínez | 24045378 | 23884-7 | Genética Médica | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Diego | Rodríguez | 30882721 | 54352-5 | Medicina del Deporte | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Cecilia | Romero | 24204926 | 51754-6 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Carlos | Díaz | 28156787 | 37245-6 | Neurología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Laura | Ramírez | 24834866 | 94546-4 | Alergia e Inmunología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Roberto | González | 34035231 | 17580-0 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Diego | Méndez | 20441229 | 99768-3 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Odontológico Rawson | Gabriela | Ramírez | 32049132 | 16529-6 | Cirugía Maxilofacial | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Roberto | González | 34035231 | 17580-0 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Lucía | Ortiz | 32052018 | 85463-0 | Medicina Interna | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Pedro | Suárez | 41759309 | 33695-7 | Cirugía Vascular | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Laura | Ramírez | 24834866 | 94546-4 | Alergia e Inmunología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Fernando | Méndez | 41305320 | 53747-0 | Neurocirugía | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Cecilia | Romero | 24204926 | 51754-6 | Emergentología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Carlos | Díaz | 28156787 | 37245-6 | Neurología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Diego | Méndez | 20441229 | 99768-3 | Urología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Gabriela | Ramírez | 32049132 | 16529-6 | Cirugía Maxilofacial | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Laura | Morales | 39839550 | 69989-4 | Neumonología | 200 | Asociación de médico en centro realizada correctamente |
| Centro Médico del Este | Gabriela | Ramírez | 32049132 | 16529-6 | Cirugía Maxilofacial | 409 | Médico en centro ya está asociado al centro de atención |
| Centro Médico del Este | Laura | Morales | 39839550 | 69989-4 | Neumonología | 409 | Médico en centro ya está asociado al centro de atención |
| Trelew Salud | Ana | Silva | 25294692 | 94013-6 | Nutrición | 409 | Médico en centro ya está asociado al centro de atención |
| Clinica Rawson | Carlos | Díaz | 99999999 | 37245-6 | Neurología | 409 | Médico no existe con el dni indicado |
| Clinica Rawson | Pedro | Pérez | 42279752 | 999999-0 | Anatomía Patológica | 409 | Médico no existe con la matrícula indicada |
| Trelew Salud | Cecilia | Morales | 26046382 | 56617-0 | Medicina Estética | 409 | La especialidad del médico no se encuentra disponible para el centro de salud |
| Trelew Salud | Ana | Méndez | 26399530 | 80565-9 | Diabetología | 409 | La especialidad del médico no se encuentra disponible para el centro de salud |

Característica: Listar médicos asociadas a todos los centros médicos

  Escenario: Recuperar todas los médicos asociadas a todos los centros
    Dado que existen médicos asociados a centros médicos en el sistema
    Cuando un usuario del sistema solicita la lista de médicos asociados 
    Entonces el sistema responde con un JSON:
   
     """
{
    "status_code": 200,
    "status_text": "especialidades asociadas a centros recuperadas correctamente",
    "data": [
        {
            "centro_de_atencion": "Centro Médico Integral",
            "medicos": [
                {
                    "nombre": "Gustavo",
                    "apellido": "Torres",
                    "dni": 36681588,
                    "matricula": "44846-4",
                    "especialidad": "Odontología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Rodríguez",
                    "dni": 29730992,
                    "matricula": "94975-9",
                    "especialidad": "Oftalmología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "González",
                    "dni": 23277412,
                    "matricula": "12610-3",
                    "especialidad": "Pediatría"
                },
                {
                    "nombre": "Patricia",
                    "apellido": "Ramírez",
                    "dni": 32844301,
                    "matricula": "57204-2",
                    "especialidad": "Clínica Médica"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Castro",
                    "dni": 33506029,
                    "matricula": "66669-5",
                    "especialidad": "Medicina del Deporte"
                },
                {
                    "nombre": "Sofía",
                    "apellido": "Méndez",
                    "dni": 38197809,
                    "matricula": "69241-8",
                    "especialidad": "Medicina General"
                },
                {
                    "nombre": "Elena",
                    "apellido": "Suárez",
                    "dni": 26530118,
                    "matricula": "93163-3",
                    "especialidad": "Diabetología"
                },
                {
                    "nombre": "Verónica",
                    "apellido": "López",
                    "dni": 33676932,
                    "matricula": "97483-6",
                    "especialidad": "Endoscopía Digestiva"
                },
                {
                    "nombre": "Pedro",
                    "apellido": "Vargas",
                    "dni": 35877839,
                    "matricula": "15112-5",
                    "especialidad": "Ginecología"
                },
                {
                    "nombre": "Diego",
                    "apellido": "Méndez",
                    "dni": 20441229,
                    "matricula": "99768-3",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Ricardo",
                    "apellido": "Morales",
                    "dni": 40664166,
                    "matricula": "35675-0",
                    "especialidad": "Angiología"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Sánchez",
                    "dni": 31994348,
                    "matricula": "76992-4",
                    "especialidad": "Otorrinolaringología"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Sánchez",
                    "dni": 41896995,
                    "matricula": "85312-7",
                    "especialidad": "Cirugía General"
                },
                {
                    "nombre": "Elena",
                    "apellido": "Romero",
                    "dni": 33267640,
                    "matricula": "69490-9",
                    "especialidad": "Medicina Estética"
                }
            ]
        },
        {
            "centro_de_atencion": "Centro de Salud Rawson",
            "medicos": [
                {
                    "nombre": "Pedro",
                    "apellido": "Silva",
                    "dni": 22720084,
                    "matricula": "39057-9",
                    "especialidad": "Oftalmología"
                },
                {
                    "nombre": "María",
                    "apellido": "López",
                    "dni": 28092860,
                    "matricula": "39100-1",
                    "especialidad": "Odontología"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Suárez",
                    "dni": 38925485,
                    "matricula": "47262-8",
                    "especialidad": "Clínica Médica"
                },
                {
                    "nombre": "Ana",
                    "apellido": "Ramírez",
                    "dni": 24502601,
                    "matricula": "72945-0",
                    "especialidad": "Fisiatría"
                },
                {
                    "nombre": "Pedro",
                    "apellido": "Silva",
                    "dni": 31232851,
                    "matricula": "46280-1",
                    "especialidad": "Medicina Interna"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Sánchez",
                    "dni": 35827626,
                    "matricula": "33027-7",
                    "especialidad": "Neonatología"
                },
                {
                    "nombre": "Martín",
                    "apellido": "Suárez",
                    "dni": 33628824,
                    "matricula": "41378-3",
                    "especialidad": "Cirugía Vascular"
                },
                {
                    "nombre": "Gustavo",
                    "apellido": "Pérez",
                    "dni": 38575678,
                    "matricula": "49274-9",
                    "especialidad": "Medicina Familiar"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "López",
                    "dni": 37411336,
                    "matricula": "62561-7",
                    "especialidad": "Genética Médica"
                },
                {
                    "nombre": "Patricia",
                    "apellido": "Vargas",
                    "dni": 34991094,
                    "matricula": "37457-7",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Javier",
                    "apellido": "Sánchez",
                    "dni": 27427954,
                    "matricula": "26417-6",
                    "especialidad": "Medicina Forense"
                }
            ]
        },
        {
            "centro_de_atencion": "Trelew Salud",
            "medicos": [
                {
                    "nombre": "Pedro",
                    "apellido": "Castro",
                    "dni": 27514920,
                    "matricula": "30051-3",
                    "especialidad": "Cardiología"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "López",
                    "dni": 34327560,
                    "matricula": "94765-8",
                    "especialidad": "Odontología"
                },
                {
                    "nombre": "Juan",
                    "apellido": "Torres",
                    "dni": 29664654,
                    "matricula": "47376-0",
                    "especialidad": "Dermatología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "López",
                    "dni": 43251052,
                    "matricula": "97620-9",
                    "especialidad": "Ginecología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Suárez",
                    "dni": 36051990,
                    "matricula": "40154-1",
                    "especialidad": "Ortopedia y Traumatología"
                },
                {
                    "nombre": "Ricardo",
                    "apellido": "Ramírez",
                    "dni": 28212316,
                    "matricula": "42823-4",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Díaz",
                    "dni": 34280407,
                    "matricula": "85426-0",
                    "especialidad": "Hepatología"
                },
                {
                    "nombre": "Patricia",
                    "apellido": "Díaz",
                    "dni": 26632849,
                    "matricula": "70839-8",
                    "especialidad": "Geriatría"
                },
                {
                    "nombre": "Martín",
                    "apellido": "Rojas",
                    "dni": 32860322,
                    "matricula": "33905-6",
                    "especialidad": "Fisiatría"
                },
                {
                    "nombre": "Ana",
                    "apellido": "Silva",
                    "dni": 25294692,
                    "matricula": "94013-6",
                    "especialidad": "Nutrición"
                },
                {
                    "nombre": "Sofía",
                    "apellido": "Suárez",
                    "dni": 32037672,
                    "matricula": "18236-8",
                    "especialidad": "Otorrinolaringología"
                },
                {
                    "nombre": "Ricardo",
                    "apellido": "González",
                    "dni": 26780884,
                    "matricula": "44480-0",
                    "especialidad": "Endoscopía Digestiva"
                },
                {
                    "nombre": "Martín",
                    "apellido": "Pérez",
                    "dni": 31105782,
                    "matricula": "20735-0",
                    "especialidad": "Infectología"
                },
                {
                    "nombre": "Lucía",
                    "apellido": "Morales",
                    "dni": 39682518,
                    "matricula": "80511-8",
                    "especialidad": "Cirugía Cardiovascular"
                }
            ]
        },
        {
            "centro_de_atencion": "Centro Médico Esperanza",
            "medicos": [
                {
                    "nombre": "Martín",
                    "apellido": "Suárez",
                    "dni": 40456304,
                    "matricula": "23049-2",
                    "especialidad": "Cardiología"
                },
                {
                    "nombre": "Gustavo",
                    "apellido": "González",
                    "dni": 41354734,
                    "matricula": "50771-3",
                    "especialidad": "Ginecología"
                },
                {
                    "nombre": "Verónica",
                    "apellido": "Torres",
                    "dni": 43518736,
                    "matricula": "17287-9",
                    "especialidad": "Odontología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Suárez",
                    "dni": 22560933,
                    "matricula": "26225-4",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Roberto",
                    "apellido": "Castro",
                    "dni": 22703709,
                    "matricula": "33470-6",
                    "especialidad": "Medicina Materno-Fetal"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Torres",
                    "dni": 43987268,
                    "matricula": "69531-0",
                    "especialidad": "Ortopedia y Traumatología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Morales",
                    "dni": 39839550,
                    "matricula": "69989-4",
                    "especialidad": "Neumonología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Morales",
                    "dni": 27175400,
                    "matricula": "77746-6",
                    "especialidad": "Cirugía Plástica"
                },
                {
                    "nombre": "Patricia",
                    "apellido": "Sánchez",
                    "dni": 26470521,
                    "matricula": "45511-4",
                    "especialidad": "Endoscopía Digestiva"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Romero",
                    "dni": 24204926,
                    "matricula": "51754-6",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 29983797,
                    "matricula": "56654-7",
                    "especialidad": "Neonatología"
                },
                {
                    "nombre": "Lucía",
                    "apellido": "Fernández",
                    "dni": 34745100,
                    "matricula": "97435-8",
                    "especialidad": "Medicina del Trabajo"
                }
            ]
        },
        {
            "centro_de_atencion": "Clinica Rawson",
            "medicos": [
                {
                    "nombre": "Laura",
                    "apellido": "González",
                    "dni": 22640574,
                    "matricula": "13311-4",
                    "especialidad": "Cardiología"
                },
                {
                    "nombre": "Roberto",
                    "apellido": "Pérez",
                    "dni": 35234163,
                    "matricula": "74039-0",
                    "especialidad": "Hematología"
                },
                {
                    "nombre": "Patricia",
                    "apellido": "Ortiz",
                    "dni": 43121366,
                    "matricula": "25763-9",
                    "especialidad": "Hepatología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 28156787,
                    "matricula": "37245-6",
                    "especialidad": "Neurología"
                },
                {
                    "nombre": "Pedro",
                    "apellido": "Pérez",
                    "dni": 42279752,
                    "matricula": "58062-0",
                    "especialidad": "Anatomía Patológica"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Morales",
                    "dni": 26046382,
                    "matricula": "56617-0",
                    "especialidad": "Medicina Estética"
                },
                {
                    "nombre": "Ana",
                    "apellido": "Méndez",
                    "dni": 26399530,
                    "matricula": "80565-9",
                    "especialidad": "Diabetología"
                },
                {
                    "nombre": "Lucía",
                    "apellido": "Romero",
                    "dni": 38239159,
                    "matricula": "78401-8",
                    "especialidad": "Medicina Forense"
                },
                {
                    "nombre": "Ana",
                    "apellido": "Fernández",
                    "dni": 20685893,
                    "matricula": "89775-2",
                    "especialidad": "Cirugía Plástica"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Méndez",
                    "dni": 41305320,
                    "matricula": "53747-0",
                    "especialidad": "Neurocirugía"
                }
            ]
        },
        {
            "centro_de_atencion": "Centro de Rehabilitación",
            "medicos": [
                {
                    "nombre": "Gabriela",
                    "apellido": "Vargas",
                    "dni": 29364849,
                    "matricula": "94366-6",
                    "especialidad": "Psiquiatría"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Torres",
                    "dni": 22330414,
                    "matricula": "60233-5",
                    "especialidad": "Medicina del Deporte"
                },
                {
                    "nombre": "Elena",
                    "apellido": "Rodríguez",
                    "dni": 30322166,
                    "matricula": "69601-1",
                    "especialidad": "Anestesiología"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Castro",
                    "dni": 37544297,
                    "matricula": "44669-5",
                    "especialidad": "Cirugía Vascular"
                },
                {
                    "nombre": "Lucía",
                    "apellido": "Méndez",
                    "dni": 39396719,
                    "matricula": "49824-7",
                    "especialidad": "Medicina General"
                },
                {
                    "nombre": "Ana",
                    "apellido": "Gómez",
                    "dni": 33386601,
                    "matricula": "81637-7",
                    "especialidad": "Nefrología"
                },
                {
                    "nombre": "Martín",
                    "apellido": "Silva",
                    "dni": 29684163,
                    "matricula": "73684-9",
                    "especialidad": "Medicina Forense"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Méndez",
                    "dni": 41305320,
                    "matricula": "53747-0",
                    "especialidad": "Neurocirugía"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Romero",
                    "dni": 24204926,
                    "matricula": "51754-6",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 28156787,
                    "matricula": "37245-6",
                    "especialidad": "Neurología"
                }
            ]
        },
        {
            "centro_de_atencion": "Instituto Médico Patagonia",
            "medicos": [
                {
                    "nombre": "Cecilia",
                    "apellido": "Morales",
                    "dni": 28771160,
                    "matricula": "99281-1",
                    "especialidad": "Medicina General"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Méndez",
                    "dni": 41305320,
                    "matricula": "53747-0",
                    "especialidad": "Neurocirugía"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Romero",
                    "dni": 24204926,
                    "matricula": "51754-6",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 28156787,
                    "matricula": "37245-6",
                    "especialidad": "Neurología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Ramírez",
                    "dni": 24834866,
                    "matricula": "94546-4",
                    "especialidad": "Alergia e Inmunología"
                },
                {
                    "nombre": "Roberto",
                    "apellido": "González",
                    "dni": 34035231,
                    "matricula": "17580-0",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Diego",
                    "apellido": "Méndez",
                    "dni": 20441229,
                    "matricula": "99768-3",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Ramírez",
                    "dni": 32049132,
                    "matricula": "16529-6",
                    "especialidad": "Cirugía Maxilofacial"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Morales",
                    "dni": 39839550,
                    "matricula": "69989-4",
                    "especialidad": "Neumonología"
                },
                {
                    "nombre": "Elena",
                    "apellido": "Suárez",
                    "dni": 26530118,
                    "matricula": "93163-3",
                    "especialidad": "Diabetología"
                }
            ]
        },
        {
            "centro_de_atencion": "Centro Odontológico Rawson",
            "medicos": [
                {
                    "nombre": "Fernando",
                    "apellido": "Méndez",
                    "dni": 41305320,
                    "matricula": "53747-0",
                    "especialidad": "Neurocirugía"
                },
                {
                    "nombre": "Ricardo",
                    "apellido": "Romero",
                    "dni": 42782001,
                    "matricula": "14377-8",
                    "especialidad": "Neumonología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Martínez",
                    "dni": 24045378,
                    "matricula": "23884-7",
                    "especialidad": "Genética Médica"
                },
                {
                    "nombre": "Diego",
                    "apellido": "Rodríguez",
                    "dni": 30882721,
                    "matricula": "54352-5",
                    "especialidad": "Medicina del Deporte"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Romero",
                    "dni": 24204926,
                    "matricula": "51754-6",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 28156787,
                    "matricula": "37245-6",
                    "especialidad": "Neurología"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Ramírez",
                    "dni": 24834866,
                    "matricula": "94546-4",
                    "especialidad": "Alergia e Inmunología"
                },
                {
                    "nombre": "Roberto",
                    "apellido": "González",
                    "dni": 34035231,
                    "matricula": "17580-0",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Diego",
                    "apellido": "Méndez",
                    "dni": 20441229,
                    "matricula": "99768-3",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Ramírez",
                    "dni": 32049132,
                    "matricula": "16529-6",
                    "especialidad": "Cirugía Maxilofacial"
                }
            ]
        },
        {
            "centro_de_atencion": "Centro Médico del Este",
            "medicos": [
                {
                    "nombre": "Roberto",
                    "apellido": "González",
                    "dni": 34035231,
                    "matricula": "17580-0",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Lucía",
                    "apellido": "Ortiz",
                    "dni": 32052018,
                    "matricula": "85463-0",
                    "especialidad": "Medicina Interna"
                },
                {
                    "nombre": "Pedro",
                    "apellido": "Suárez",
                    "dni": 41759309,
                    "matricula": "33695-7",
                    "especialidad": "Cirugía Vascular"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Ramírez",
                    "dni": 24834866,
                    "matricula": "94546-4",
                    "especialidad": "Alergia e Inmunología"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Méndez",
                    "dni": 41305320,
                    "matricula": "53747-0",
                    "especialidad": "Neurocirugía"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Romero",
                    "dni": 24204926,
                    "matricula": "51754-6",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 28156787,
                    "matricula": "37245-6",
                    "especialidad": "Neurología"
                },
                {
                    "nombre": "Diego",
                    "apellido": "Méndez",
                    "dni": 20441229,
                    "matricula": "99768-3",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Ramírez",
                    "dni": 32049132,
                    "matricula": "16529-6",
                    "especialidad": "Cirugía Maxilofacial"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Morales",
                    "dni": 39839550,
                    "matricula": "69989-4",
                    "especialidad": "Neumonología"
                }
            ]
        }
    ]
     """

 Escenario: Recuperar los médicos asociados a un centros médico
    Dado que existen médicos asociadas a centros médicos en el sistema
    Cuando un usuario del sistema solicita la lista de especialidades asociadas al centro "Centro Médico del Este"
    Entonces el sistema responde con un JSON:
   
     """
   {
    "status_code": 200,
    "status_text": "especialidades asociadas a centros recuperadas correctamente",
    "data": [
                {
                    "nombre": "Roberto",
                    "apellido": "González",
                    "dni": 34035231,
                    "matricula": "17580-0",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Lucía",
                    "apellido": "Ortiz",
                    "dni": 32052018,
                    "matricula": "85463-0",
                    "especialidad": "Medicina Interna"
                },
                {
                    "nombre": "Pedro",
                    "apellido": "Suárez",
                    "dni": 41759309,
                    "matricula": "33695-7",
                    "especialidad": "Cirugía Vascular"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Ramírez",
                    "dni": 24834866,
                    "matricula": "94546-4",
                    "especialidad": "Alergia e Inmunología"
                },
                {
                    "nombre": "Fernando",
                    "apellido": "Méndez",
                    "dni": 41305320,
                    "matricula": "53747-0",
                    "especialidad": "Neurocirugía"
                },
                {
                    "nombre": "Cecilia",
                    "apellido": "Romero",
                    "dni": 24204926,
                    "matricula": "51754-6",
                    "especialidad": "Emergentología"
                },
                {
                    "nombre": "Carlos",
                    "apellido": "Díaz",
                    "dni": 28156787,
                    "matricula": "37245-6",
                    "especialidad": "Neurología"
                },
                {
                    "nombre": "Diego",
                    "apellido": "Méndez",
                    "dni": 20441229,
                    "matricula": "99768-3",
                    "especialidad": "Urología"
                },
                {
                    "nombre": "Gabriela",
                    "apellido": "Ramírez",
                    "dni": 32049132,
                    "matricula": "16529-6",
                    "especialidad": "Cirugía Maxilofacial"
                },
                {
                    "nombre": "Laura",
                    "apellido": "Morales",
                    "dni": 39839550,
                    "matricula": "69989-4",
                    "especialidad": "Neumonología"
                }
    ]
     """
