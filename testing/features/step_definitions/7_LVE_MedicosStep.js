const { When, Then, Given } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que existen {int} medicos registrados en el sistema', function (cantidad) {
    // Trae la lista actual de médicos y guarda la cantidad real en el contexto
    const res = request('GET', 'http://backend:8080/medicos');
    const data = JSON.parse(res.getBody('utf8'));
    this.medicos = data.data;
    this.cantidadMedicos = this.medicos.length;

});

When(
  'el administrador crea un médico con {string}, {string}, {string}, {string}, {string}',
  function (nombre, apellido, dni, matricula, especialidad) {
    const medico = {
      nombre,
      apellido,
      dni: dni && !isNaN(Number(dni)) ? Number(dni) : dni,
      matricula,
      especialidad: { nombre: especialidad }
    };
    try {
      const res = request('POST', 'http://backend:8080/medicos', { json: medico });
      this.response = JSON.parse(res.getBody('utf8'));
    } catch (error) {
      try {
        this.response = error.response
          ? JSON.parse(error.response.body.toString('utf8'))
          : { status_code: 500, status_text: 'Error interno' };
      } catch (parseErr) {
        this.response = { status_code: 500, status_text: 'Error interno' };
      }
    }
  }
);
When('un usuario del sistema solicita la lista de medicos', function () {
  try {
    const res = request('GET', 'http://backend:8080/medicos');
    this.response = JSON.parse(res.getBody('utf8'));
  } catch (error) {
    this.response = error.response
      ? JSON.parse(error.response.body.toString('utf8'))
      : { status_code: 500, status_text: 'Error interno' };
  }
});


Then(
  'el sistema responde con {int} y {string} para medicos',
  function (expectedStatus, expectedText) {
    assert.strictEqual(this.response.status_code, expectedStatus, `Status esperado: ${expectedStatus}, recibido: ${this.response.status_code}`);
    assert.ok(
      this.response.status_text.trim().toLowerCase().includes(expectedText.trim().toLowerCase()),
      `Esperado status_text que contenga "${expectedText}", pero fue "${this.response.status_text}"`
    );
  }
);


Then('el sistema responde con un JSON:', function (docString) {
  const expected = JSON.parse(docString);
  // Solo validamos status_code y status_text, y que data sea array
  assert.strictEqual(this.response.status_code, expected.status_code, 'status_code incorrecto');
  assert.ok(
    this.response.status_text.trim().toLowerCase().includes(expected.status_text.trim().toLowerCase()),
    `status_text incorrecto: esperado "${expected.status_text}", recibido "${this.response.status_text}"`
  );
  assert.ok(Array.isArray(this.response.data), 'data no es un array');
  // Si querés comparar los médicos, podés hacer un assert.deepStrictEqual aquí
});