const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

const BASE_URL = 'http://backend:8080';

Given('que existe un centro de atención llamado {string}', function (nombreCentro) {
  const res = request('GET', `${BASE_URL}/centrosAtencion`);
  const body = JSON.parse(res.getBody('utf8'));
  const centros = body.data;                        
  const centro = centros.find(c => c.name === nombreCentro);
  if (!centro) throw new Error(`No se encontró el centro: ${nombreCentro}`);
  this.centroId = centro.id;
});
Given('que existen múltiples centros de atención registrados', function () {
  // LA BD SE POPULA EN LOS TEST ANTERIORES
  return true;
});

When('se registra un consultorio con el número {string} y el nombre {string}', function (numero, nombreConsultorio) {
  // POST a /consultorios/{centroNombre}
  const payload = {
    numero: parseInt(numero, 10),
    nombre: nombreConsultorio
  };
  const url = `${BASE_URL}/consultorios/${encodeURIComponent(this.centroNombre)}`;
  const res = request('POST', url, { json: payload });
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});

Then('el sistema responde con status_code {string} y status_text {string}', function (expectedCode, expectedText) {
  // HTTP 200 siempre para indicar llegada
  assert.strictEqual(this.httpStatus, 200);
  // Validar código interno y mensaje
  assert.strictEqual(this.response.status_code, parseInt(expectedCode, 10));
  assert.strictEqual(this.response.status_text, expectedText.replace(/"/g, ''));
});

When('se solicita la lista de consultorios del centro', function () {
  // GET a /consultorios/{centroNombre}/listar
  const url = `${BASE_URL}/consultorios/${encodeURIComponent(this.centroNombre)}/listar`;
  const res = request('GET', url);
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});

Then('el sistema responde con el siguiente JSON:', function (docString) {
  const expected = JSON.parse(docString);
  // HTTP 200 siempre
  assert.strictEqual(this.httpStatus, 200);
  // Validar contenido
  assert.strictEqual(this.response.status_code, expected.status_code);
  if (expected.status_text) assert.strictEqual(this.response.status_text, expected.status_text);
  assert.deepStrictEqual(this.response.data, expected.data);
});

Given('existen múltiples centros de atención registrados', function () {
  // Asumimos datos precargados para este escenario
});

When('se solicita la lista completa de centros con sus consultorios', function () {
  // Implementar cuando exista endpoint específico, por ejemplo GET /consultorios
  const res = request('GET', `${BASE_URL}/consultorios`);
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});