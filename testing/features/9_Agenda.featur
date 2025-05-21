# language: es
Característica: Configuración de Agendas

Escenario: Crear una agenda sin conflictos
  Dado que el administrador configura la agenda del "Consultorio 1"
  Y define el horario de atención de "08:00" a "14:00" de lunes a viernes
  Y asigna al Dr. "Cecilia Morales" con especialidad "Medicina Estética"
  Cuando guarda la configuración
  Entonces el sistema responde con status_code 200 y status_text "OK" para agenda

Escenario: Intentar asignar horarios en conflicto en el mismo consultorio
  Dado que el administrador configura la agenda del "Consultorio 2"
  Y define el horario de atención de "09:00" a "13:00" para el Dr. "Gustavo González"
  Y luego intenta asignar al Dr. "Gabriela Torres" de "10:00" a "12:00" en el mismo consultorio
  Cuando guarda la configuración
  Entonces el sistema responde con status_code 409 y status_text "Conflicto de horarios en el consultorio" para agenda

Escenario: Intentar asignar a un médico en dos consultorios a la misma hora
  Dado que el Dr. "Mario Rodríguez" está asignado al "Consultorio 3" de "08:00" a "12:00"
  Cuando el administrador intenta asignarlo al "Consultorio 4" a la misma hora
  Entonces el sistema responde con status_code 409 y status_text "El médico ya está asignado en otro consultorio" para agenda

Escenario: Configurar un día festivo en la agenda
  Dado que el administrador configura la agenda del "Consultorio 5"
  Y define el horario de atención de "08:00" a "18:00" de lunes a viernes
  Cuando añade "25 de Mayo" como un día festivo
  Y guarda la configuración
  Entonces el sistema responde con status_code 200 y status_text "OK" para agenda

Escenario: Un médico cancela disponibilidad y se notifica a los pacientes
  Dado que el Dr. "Gabriela Sánchez" tiene citas en el "Consultorio 6"
  Y el administrador elimina su disponibilidad por razones personales
  Cuando guarda la configuración
  Entonces el sistema responde con status_code 200 y status_text "notifica" para agenda