const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que el centro de atención {string} existe en el sistema', function (nombreCentro) {
  const centro = { nombre: nombreCentro, direccion: 'Calle Falsa 123', telefono: '123456789' };
  const res = request('POST', 'http://backend:8080/centros', { json: centro });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear el centro de atención: ${nombreCentro}`);
});

Given('un consultorio con el número {string} ya está registrado en el centro', function (numero) {
  const consultorio = { numero, nombre: 'Consultorio Existente' };
  const res = request('POST', `http://backend:8080/centros/1/consultorios`, { json: consultorio });
  assert.strictEqual(res.statusCode, 200, `No se pudo registrar el consultorio con número: ${numero}`);
});

When('el administrador crea un consultorio con el número {string} y el nombre {string}', function (numero, nombre) {
  const consultorio = { numero, nombre };
  try {
    const res = request('POST', `http://backend:8080/centros/1/consultorios`, { json: consultorio });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

When('el administrador solicita la lista de consultorios del centro {string}', function (nombreCentro) {
  const res = request('GET', `http://backend:8080/centros/1/consultorios`);
  this.response = JSON.parse(res.getBody('utf8'));
  this.statusCode = res.statusCode;
});

When('el administrador edita el consultorio cambiando su número a {string} y su nombre a {string}', function (nuevoNumero, nuevoNombre) {
  const consultorioEditado = { numero: nuevoNumero, nombre: nuevoNombre };
  try {
    const res = request('PUT', `http://backend:8080/centros/1/consultorios/101`, { json: consultorioEditado });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

Then('el sistema responde con el código de estado {int} y el mensaje {string} para consultorios', function (statusCode, mensaje) {
  assert.strictEqual(this.statusCode, statusCode);
  assert.strictEqual(this.response.message, mensaje);
});

Then('el sistema responde con un JSON: para consultorios', function (jsonString) {
  const expectedResponse = JSON.parse(jsonString);
  assert.deepStrictEqual(this.response, expectedResponse);
});