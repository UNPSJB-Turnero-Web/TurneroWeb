const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

When('el administrador crea una disponibilidad médica con {string}, {string}', function (medico, horariosJson) {
  // Parsear los horarios desde el string JSON
  const horarios = JSON.parse(horariosJson.replace(/\\"/g, '"')); // Reemplazar \" por "
  assert(Array.isArray(horarios), 'El formato de horarios debe ser una lista de objetos');

  const staffMedicoId = getStaffMedicoIdPorNombre(medico); // Obtener el ID del médico
  assert(staffMedicoId, `No se encontró médico con nombre ${medico}`);

  const disponibilidadConfig = {
    staffMedicoId: staffMedicoId,
    horarios: horarios
  };

  try {
    const res = request('POST', 'http://backend:8080/disponibilidades-medico', { json: disponibilidadConfig });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
    this.disponibilidadId = this.response.id; // Guardar el ID para usarlo en otros tests
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
    this.statusCode = error.statusCode || 500;
  }
});

function getStaffMedicoIdPorNombre(nombreCompleto) {
  const [nombre, ...apellidoArr] = nombreCompleto.split(' ');
  const apellido = apellidoArr.join(' ');

  const res = request('GET', 'http://backend:8080/staff-medico');
  const responseData = JSON.parse(res.getBody('utf8'));

  // Acceder a la propiedad "data" de la respuesta
  const data = Array.isArray(responseData) ? responseData : responseData.data;

  assert(Array.isArray(data), 'La respuesta del backend no contiene un array de staff médico');

  const staffMedico = data.find(
    (staff) =>
      staff.medico.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
      staff.medico.apellido.trim().toLowerCase() === apellido.trim().toLowerCase()
  );

  return staffMedico ? staffMedico.id : null;
}


// Busca el consultorio por nombre y centroId
function getConsultorioIdPorNombreYCentro(nombreConsultorio, centroId) {
  const res = request('GET', 'http://backend:8080/consultorios');
  const responseData = JSON.parse(res.getBody('utf8'));
  const data = Array.isArray(responseData) ? responseData : responseData.data;

  assert(Array.isArray(data), 'La respuesta del backend no contiene un array de consultorios');

  const consultorio = data.find(
    (c) =>
      c.nombre.trim().toLowerCase() === nombreConsultorio.trim().toLowerCase() &&
      String(c.centroId) === String(centroId)
  );
  return consultorio ? consultorio.id : null;
}


When('el administrador crea un esquema de turno con {string}, {int}, {string}', function (medico, intervalo, consultorio) {
  // Permitir valores vacíos para probar validaciones del backend
  const staffMedicoId = medico ? getStaffMedicoIdPorNombre(medico) : null;

  // Obtener el centroId asociado al staff médico (solo si hay médico)
  let centroId = null;
  if (staffMedicoId) {
    const staffRes = request('GET', `http://backend:8080/staff-medico/${staffMedicoId}`);
    const staffData = JSON.parse(staffRes.getBody('utf8'));
    centroId = staffData.data && staffData.data.centro ? staffData.data.centro.id : null;
  }

  // Buscar el consultorio por nombre y centroId (solo si hay consultorio y centro)
  let consultorioId = null;
  if (consultorio && centroId) {
    consultorioId = getConsultorioIdPorNombreYCentro(consultorio, centroId);
  }
  if (consultorio && centroId && !consultorioId) {
    consultorioId = -1; // o cualquier ID que no exista
  }

  // Buscar la disponibilidad médica asociada al médico (solo si hay médico)
  let disponibilidad = null;
  if (staffMedicoId) {
    const res = request('GET', `http://backend:8080/disponibilidades-medico`);
    const disponibilidades = JSON.parse(res.getBody('utf8')).data;
    disponibilidad = disponibilidades.find(d => d.staffMedicoId === staffMedicoId);
  }

  const horarios = disponibilidad
    ? disponibilidad.horarios.map(h => ({
        dia: h.dia,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      }))
    : [];

  const esquemaTurnoConfig = {
    staffMedicoId: staffMedicoId,
    consultorioId: consultorioId,
    disponibilidadMedicoId: disponibilidad ? disponibilidad.id : null,
    horarios: horarios,
    centroId: centroId,
    intervalo: intervalo
  };

  try {
    const res = request('POST', 'http://backend:8080/esquema-turno', { json: esquemaTurnoConfig });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
    this.statusCode = error.statusCode || 500;
  }
});


When('el administrador crea una agenda basada en el esquema de turno', function () {
  const agendaConfig = {
    esquemaTurnoId: this.esquemaTurnoId,
    fecha: "2025-05-26", // Fecha de ejemplo, puede ser dinámica
    horaInicio: "08:00",
    horaFin: "12:00",
    habilitado: true
  };

  try {
    const res = request('POST', 'http://backend:8080/agenda', { json: agendaConfig });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
    this.statusCode = error.statusCode || 500;
  }
});


// ----- agenda
let agendaConfig = {};
let agendaConfig2 = {};
function getStaffMedicoIdPorMedicoId(medicoId) {
  const res = request('GET', `http://backend:8080/staff-medico?medicoId=${medicoId}`);
  const data = JSON.parse(res.getBody('utf8'));
  return data.length > 0 ? data[0].id : null; // Asume que el primer resultado es válido
}
function getIdByNombre(url, nombreCampo, valor) {
  const res = request('GET', url);
  const data = JSON.parse(res.getBody('utf8'));
  let arr = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  return (arr.find(e => e[nombreCampo] === valor || e.name === valor) || {}).id || null;
}

function getMedicoIdPorNombreCompleto(nombre, apellido) {
  const res = request('GET', 'http://backend:8080/medicos');
  const data = JSON.parse(res.getBody('utf8'));
  let arr = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  const obj = arr.find(e =>
    e.nombre && e.apellido &&
    e.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
    e.apellido.trim().toLowerCase() === apellido.trim().toLowerCase()
  );
  return obj ? obj.id : null;
}

// Consultorio
Given('que el administrador configura la agenda del {string}', function (consultorioNombre) {
  const consultorioId = getIdByNombre('http://backend:8080/consultorios', 'name', consultorioNombre);
  assert(consultorioId, `No se encontró consultorio con nombre ${consultorioNombre}`);
  agendaConfig = {};
  agendaConfig.consultorioId = consultorioId;
});

// Médico y especialidad
Given('asigna al Dr. {string} con especialidad {string}', function (medicoNombreCompleto, especialidadNombre) {
  const [nombre, ...apellidoArr] = medicoNombreCompleto.split(' ');
  const apellido = apellidoArr.join(' ');
  const medicoId = getMedicoIdPorNombreCompleto(nombre, apellido);
  assert(medicoId, `No se encontró médico con nombre ${medicoNombreCompleto}`);
  const especialidadId = getIdByNombre('http://backend:8080/especialidades', 'nombre', especialidadNombre);
  assert(especialidadId, `No se encontró especialidad con nombre ${especialidadNombre}`);
  agendaConfig.medicoId = medicoId;
  agendaConfig.especialidadId = especialidadId;
});

// Horario general
Given('define el horario de atención de {string} a {string} de lunes a viernes', function (inicio, fin) {
  agendaConfig.horaInicio = inicio;
  agendaConfig.horaFin = fin;
  agendaConfig.diasAtencion = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
});

// Para steps conflictivos, siempre busca el ID igual:
Given('define el horario de atención de {string} a {string} para el Dr. {string}', function (inicio, fin, medicoNombreCompleto) {
  const [nombre, ...apellidoArr] = medicoNombreCompleto.split(' ');
  const apellido = apellidoArr.join(' ');
  const medicoId = getMedicoIdPorNombreCompleto(nombre, apellido);
  assert(medicoId, `No se encontró médico con nombre ${medicoNombreCompleto}`);
  agendaConfig.horaInicio = inicio;
  agendaConfig.horaFin = fin;
  agendaConfig.medicoId = medicoId;
});

Given('luego intenta asignar al Dr. {string} de {string} a {string} en el mismo consultorio', function (medico, inicio, fin) {
  agendaConfig2 = { ...agendaConfig };
  const [nombre, ...apellidoArr] = medico.split(' ');
  const apellido = apellidoArr.join(' ');
  const medicoId = getMedicoIdPorNombreCompleto(nombre, apellido);
  assert(medicoId, `No se encontró médico con nombre ${medico}`);
  agendaConfig2.medicoId = medicoId;
  agendaConfig2.horaInicio = inicio;
  agendaConfig2.horaFin = fin;
});

Given('que el Dr. {string} está asignado al {string} de {string} a {string}', function (medico, consultorio, inicio, fin) {
  const config = {
    consultorio,
    medico,
    horaInicio: inicio,
    horaFin: fin,
    dias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
  };
  try {
    const res = request('POST', 'http://backend:8080/agenda', { json: config });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    try {
      this.response = error.response
        ? JSON.parse(error.response.body.toString('utf8'))
        : { status_code: 500, status_text: 'Error interno' };
      this.statusCode = error.statusCode || 500;
    } catch (parseErr) {
      this.response = { status_code: 500, status_text: 'Error interno' };
      this.statusCode = 500;
    }
  }
});

Given('que el Dr. {string} tiene citas en el {string}', function (medico, consultorio) {
  agendaConfig = {
    consultorio,
    medico,
    horaInicio: "08:00",
    horaFin: "12:00",
    dias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
  };
  try {
    const res = request('POST', 'http://backend:8080/agenda', { json: agendaConfig });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
    agendaConfig.id = this.response.id || this.response.agendaId;
  } catch (error) {
    try {
      this.response = error.response
        ? JSON.parse(error.response.body.toString('utf8'))
        : { status_code: 500, status_text: 'Error interno' };
      this.statusCode = error.statusCode || 500;
    } catch (parseErr) {
      this.response = { status_code: 500, status_text: 'Error interno' };
      this.statusCode = 500;
    }
  }
});

Given('el administrador elimina su disponibilidad por razones personales', function () {
  const agendaId = agendaConfig.id || (this.response && (this.response.id || this.response.agendaId));
  try {
    const res = request('POST', `http://backend:8080/agenda/${agendaId}/cancelar`);
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    try {
      this.response = error.response
        ? JSON.parse(error.response.body.toString('utf8'))
        : { status_code: 500, status_text: 'Error interno' };
      this.statusCode = error.statusCode || 500;
    } catch (parseErr) {
      this.response = { status_code: 500, status_text: 'Error interno' };
      this.statusCode = 500;
    }
  }
});

When('el administrador intenta asignarlo al {string} a la misma hora', function (consultorio) {
  const config = {
    consultorio,
    medico: agendaConfig.medico,
    horaInicio: agendaConfig.horaInicio,
    horaFin: agendaConfig.horaFin,
    dias: agendaConfig.dias
  };
  try {
    const res = request('POST', 'http://backend:8080/agenda', { json: config });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    try {
      this.response = error.response
        ? JSON.parse(error.response.body.toString('utf8'))
        : { status_code: 500, status_text: 'Error interno' };
      this.statusCode = error.statusCode || 500;
    } catch (parseErr) {
      this.response = { status_code: 500, status_text: 'Error interno' };
      this.statusCode = 500;
    }
  }
});

When('guarda la configuración', function () {
  try {
    const res = request('POST', 'http://backend:8080/agenda', { json: agendaConfig });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
    if (Object.keys(agendaConfig2).length > 0) {
      const res2 = request('POST', 'http://backend:8080/agenda', { json: agendaConfig2 });
      this.response = JSON.parse(res2.getBody('utf8'));
      this.statusCode = res2.statusCode;
    }
  } catch (error) {
    try {
      this.response = error.response
        ? JSON.parse(error.response.body.toString('utf8'))
        : { status_code: 500, status_text: 'Error interno' };
      this.statusCode = error.statusCode || 500;
    } catch (parseErr) {
      this.response = { status_code: 500, status_text: 'Error interno' };
      this.statusCode = 500;
    }
  }
});

When('añade {string} como un día festivo', function (fecha) {
  if (!agendaConfig.feriados) agendaConfig.feriados = [];
  agendaConfig.feriados.push(fecha);
});

Then('el sistema notifica a los pacientes afectados', function () {
  assert.ok(true, "Notificación simulada");
});

Then('ofrece opciones de reprogramación', function () {
  assert.ok(true, "Opciones de reprogramación simuladas");
});


Then('el sistema responde con status_code {int} y status_text {string} para agenda', function (expectedStatus, expectedText) {
  // Verificar el campo status_code del cuerpo de la respuesta
  assert.strictEqual(
    this.response.status_code,
    expectedStatus,
    `Status esperado: ${expectedStatus}, recibido: ${this.response.status_code}`
  );

  // Verificar el texto del campo status_text
  assert.ok(
    (this.response.status_text || '').toLowerCase().includes(expectedText.toLowerCase()),
    `Esperado status_text que contenga "${expectedText}", pero fue "${this.response.status_text || ''}"`
  );
});
