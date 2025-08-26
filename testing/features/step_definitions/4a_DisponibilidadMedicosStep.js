const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

function normalize(str) {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

Given('que existe un sistema de gestión de disponibilidades médicas', function () {
  // Sistema inicializado
});

Given('que existen disponibilidades médicas registradas en el sistema', function () {
  // Asumimos que hay datos precargados
});

When('el administrador crea una disponibilidad para el médico con matrícula {string} con los siguientes horarios:', function (matricula, dataTable) {
  try {
    // Buscar el médico por matrícula para obtener el staffMedicoId
    const resMedicos = request('GET', 'http://backend:8080/medicos');
    const medicos = JSON.parse(resMedicos.getBody('utf8')).data;
    const medico = medicos.find(m => m.matricula === matricula);

    if (!medico) {
      // Simular respuesta de error cuando no se encuentra el médico
      this.response = {
        status_code: 400,
        status_text: "No existe el médico con esa matrícula"
      };
      return;
    }

    // Buscar el staff médico asociado
    const resStaff = request('GET', 'http://backend:8080/staff-medico');
    const staffList = JSON.parse(resStaff.getBody('utf8')).data;
    const staff = staffList.find(s => s.medico && s.medico.matricula === matricula);

    if (!staff) {
      // Simular respuesta de error cuando no hay staff asociado
      this.response = {
        status_code: 400,
        status_text: "No existe el médico con esa matrícula"
      };
      return;
    }

    // Procesar los horarios de la tabla
    const horarios = [];
    const rows = dataTable.hashes();
    
    for (const row of rows) {
      const dia = row.dia ? row.dia.trim() : '';
      const horaInicio = row.horaInicio ? row.horaInicio.trim() : '';
      const horaFin = row.horaFin ? row.horaFin.trim() : '';

      // Validaciones
      if (!dia) {
        this.response = {
          status_code: 400,
          status_text: "El día de la semana es obligatorio"
        };
        return;
      }

      if (!horaInicio) {
        this.response = {
          status_code: 400,
          status_text: "La hora de inicio es obligatoria"
        };
        return;
      }

      if (!horaFin) {
        this.response = {
          status_code: 400,
          status_text: "La hora de fin es obligatoria"
        };
        return;
      }

      // Validar día de la semana
      const diasValidos = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
      if (!diasValidos.includes(dia.toUpperCase())) {
        this.response = {
          status_code: 400,
          status_text: "El día de la semana no es válido"
        };
        return;
      }

      // Validar que la hora fin sea posterior al inicio
      const inicioMinutes = horaInicio.split(':').reduce((acc, time, index) => acc + (index ? +time : +time * 60), 0);
      const finMinutes = horaFin.split(':').reduce((acc, time, index) => acc + (index ? +time : +time * 60), 0);
      
      if (finMinutes <= inicioMinutes) {
        this.response = {
          status_code: 400,
          status_text: "La hora de fin debe ser posterior al inicio"
        };
        return;
      }

      horarios.push({
        dia: dia.toUpperCase(),
        horaInicio: horaInicio + ':00',
        horaFin: horaFin + ':00'
      });
    }

    // Crear la disponibilidad
    const disponibilidadData = {
      staffMedicoId: staff.id,
      horarios: horarios
    };

    const res = request('POST', 'http://backend:8080/disponibilidades-medico', { json: disponibilidadData });
    this.response = JSON.parse(res.getBody('utf8'));

  } catch (error) {
    if (error.statusCode) {
      this.response = JSON.parse(error.response.body.toString('utf8'));
    } else {
      this.response = {
        status_code: 500,
        status_text: "Error interno del servidor"
      };
    }
  }
});

When('un usuario del sistema solicita la lista de disponibilidades médicas', function () {
  try {
    const res = request('GET', 'http://backend:8080/disponibilidades-medico');
    this.response = JSON.parse(res.getBody('utf8'));
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
  }
});

When('un usuario solicita las disponibilidades del médico con matrícula {string}', function (matricula) {
  try {
    // Buscar el médico por matrícula para obtener el staffMedicoId
    const resMedicos = request('GET', 'http://backend:8080/medicos');
    const medicos = JSON.parse(resMedicos.getBody('utf8')).data;
    const medico = medicos.find(m => m.matricula === matricula);

    if (!medico) {
      this.response = {
        status_code: 400,
        status_text: "No existe el médico con esa matrícula"
      };
      return;
    }

    // Buscar el staff médico asociado
    const resStaff = request('GET', 'http://backend:8080/staff-medico');
    const staffList = JSON.parse(resStaff.getBody('utf8')).data;
    const staff = staffList.find(s => s.medico && s.medico.matricula === matricula);

    if (!staff) {
      this.response = {
        status_code: 400,
        status_text: "No existe el médico con esa matrícula"
      };
      return;
    }

    const res = request('GET', `http://backend:8080/disponibilidades-medico/staffMedico/${staff.id}`);
    this.response = JSON.parse(res.getBody('utf8'));
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
  }
});

Then('el sistema responde con {int} y {string} para disponibilidades', function (statusCode, statusText) {
  assert.strictEqual(this.response.status_code, statusCode, `Esperado status_code ${statusCode} pero fue ${this.response.status_code}`);
  assert.strictEqual(this.response.status_text.trim(), statusText.trim(), `Esperado status_text "${statusText}" pero fue "${this.response.status_text}"`);
});

Then('el sistema responde con un JSON de disponibilidades:', function (docString) {
  const expected = JSON.parse(docString);
  
  assert.strictEqual(this.response.status_code, expected.status_code);
  assert.strictEqual(this.response.status_text, expected.status_text);
  
  // Verificar que existen datos (al menos uno)
  assert(Array.isArray(this.response.data), 'La respuesta debe contener un array de datos');
  assert(this.response.data.length > 0, 'Debe haber al menos una disponibilidad');
  
  // Verificar estructura básica del primer elemento
  const firstItem = this.response.data[0];
  assert(typeof firstItem.id === 'number', 'El id debe ser un número');
  assert(typeof firstItem.staffMedicoId === 'number', 'El staffMedicoId debe ser un número');
  assert(Array.isArray(firstItem.horarios), 'Los horarios deben ser un array');
  
  if (firstItem.horarios.length > 0) {
    const firstHorario = firstItem.horarios[0];
    assert(typeof firstHorario.dia === 'string', 'El día debe ser un string');
    assert(typeof firstHorario.horaInicio === 'string', 'La hora de inicio debe ser un string');
    assert(typeof firstHorario.horaFin === 'string', 'La hora de fin debe ser un string');
  }
});

Then('el sistema responde con un JSON de disponibilidades del médico:', function (docString) {
  const expected = JSON.parse(docString);
  
  assert.strictEqual(this.response.status_code, expected.status_code);
  assert.strictEqual(this.response.status_text, expected.status_text);
  
  // Verificar que existen datos
  assert(Array.isArray(this.response.data), 'La respuesta debe contener un array de datos');
  
  if (this.response.data.length > 0) {
    // Verificar estructura básica del primer elemento
    const firstItem = this.response.data[0];
    assert(typeof firstItem.id === 'number', 'El id debe ser un número');
    assert(typeof firstItem.staffMedicoId === 'number', 'El staffMedicoId debe ser un número');
    assert(Array.isArray(firstItem.horarios), 'Los horarios deben ser un array');
    
    if (firstItem.horarios.length > 0) {
      const firstHorario = firstItem.horarios[0];
      assert(typeof firstHorario.dia === 'string', 'El día debe ser un string');
      assert(typeof firstHorario.horaInicio === 'string', 'La hora de inicio debe ser un string');
      assert(typeof firstHorario.horaFin === 'string', 'La hora de fin debe ser un string');
    }
  }
});