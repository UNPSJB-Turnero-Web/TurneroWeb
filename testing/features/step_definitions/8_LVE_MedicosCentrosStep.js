const { When, Then, Given } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que existe un sistema de gestión de centros de atención para MedicosCentro', function () {
  // Podés limpiar la base o inicializar datos si hace falta
});

Given('existen {int} centros de atención registrados en el sistema para MedicosCentro:', function (cantidad, dataTable) {
  // Podés iterar la tabla y crear los centros en la base de test si lo necesitás
  // Ejemplo:
  // dataTable.raw().slice(1).forEach(row => { ... });
});
Given('que existen médicos asociados a centros médicos en el sistema para MedicosCentro', function () {
  // Podés inicializar datos de prueba si hace falta, o dejarlo vacío si ya están cargados
});
When('un usuario del sistema solicita la lista de especialidades asociadas al centro {string} para MedicosCentro', function (centro) {
  try {
    const res = request('GET', `http://backend:8080/staff-medico/centro/${encodeURIComponent(centro)}`);
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
    this.statusCode = error.statusCode || 500;
  }
});

When(
  'el administrador asocia el médico con {string}, {string}, {int}, {string} y {string} al centro de atención {string}',
  function (nombre, apellido, dni, matricula, especialidad, centro) {
    const staff = {
      medico: {
        nombre,
        apellido,
        dni: dni,
        matricula
      },
      especialidad: { nombre: especialidad },
      centro: { name: centro }
    };
    try {
      const res = request('POST', 'http://backend:8080/staff-medico', {
        json: staff
      });
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
  }
);
Then('el sistema responde con status_code {string} y status_text {string} para MedicosCentro', function (expectedStatus, expectedText) {
  assert.strictEqual(String(this.statusCode), expectedStatus, `Status esperado: ${expectedStatus}, recibido: ${this.statusCode}`);
  assert.ok(
    (this.response.status_text || this.response).toLowerCase().includes(expectedText.toLowerCase()),
    `Esperado status_text que contenga "${expectedText}", pero fue "${this.response.status_text || this.response}"`
  );
});


// Para los escenarios de consulta/listado:
When('un usuario del sistema solicita la lista de médicos asociados para MedicosCentro', function () {
  try {
    const res = request('GET', 'http://backend:8080/staff-medico');
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
    this.statusCode = error.statusCode || 500;
  }
});

Then('el sistema responde con un JSON para MedicosCentro:', function (docString) {
  const expected = JSON.parse(docString);
  assert.strictEqual(this.response.status_code, expected.status_code, 'status_code incorrecto');
  assert.ok(
    this.response.status_text.trim().toLowerCase().includes(expected.status_text.trim().toLowerCase()),
    `status_text incorrecto: esperado "${expected.status_text}", recibido "${this.response.status_text}"`
  );
  assert.ok(Array.isArray(this.response.data), 'data no es un array');
  // Si querés comparar los médicos, podés hacer un assert.deepStrictEqual aquí
});

