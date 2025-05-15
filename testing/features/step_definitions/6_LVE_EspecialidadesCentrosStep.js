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

// Step para verificar cantidad y nombres de centros definidos en la feature
Given('existen {int} centros de atención registrados en el sistema:', function(count, dataTable) {
  const centros = dataTable.raw().slice(1).map(r => r[0]);
  if (centros.length !== count) {
    throw new Error(`Se esperaban ${count} centros, pero llegaron ${centros.length}`);
  }
  this.centrosListado = centros;
});

// Stub para indicar que ya hay asociaciones previas de especialidades-centros
Given('que existen especialidades asociadas a centros médicos en el sistema', function() {
  // No hace nada: asumimos que los datos ya existen en el backend
});

Given('que existe un centro de atención llamado {string} para especialidadesCentro', function(nombreCentro) {
  const res = request('GET', `http://backend:8080/centrosAtencion`);
  const centros = JSON.parse(res.getBody('utf8')).data;
  const centro = centros.find(x => x.name && normalize(x.name) === normalize(nombreCentro));
  if (!centro) throw new Error(`No se encontró el centro: ${nombreCentro}`);
  this.centroId = centro.id;
});

Given('que existe una especialidad llamada {string} para especialidadesCentro', function(nombreEspecialidad) {
  const res = request('GET', `http://backend:8080/especialidades`);
  const especialidades = JSON.parse(res.getBody('utf8')).data;
  const esp = especialidades.find(x => x.nombre && normalize(x.nombre) === normalize(nombreEspecialidad));
  if (!esp) throw new Error(`No se encontró la especialidad: ${nombreEspecialidad}`);
  this.especialidadId = esp.id;
});

// Asociación de especialidad a centro
When('el administrador asocia la especialidad {string} al centro de atención {string} para especialidadesCentro', function(nombreEsp, nombreCent) {
// obtener id centro
  const resC = request('GET', 'http://backend:8080/centrosAtencion');
  const centro = JSON.parse(resC.getBody('utf8')).data
    .find(c => c.name && normalize(c.name) === normalize(nombreCent));
  if (!centro) throw new Error(`No se encontró el centro: ${nombreCent}`);
  // obtener id especialidad
  const resE = request('GET', 'http://backend:8080/especialidades');
  const esp = JSON.parse(resE.getBody('utf8')).data
    .find(e => e.nombre && normalize(e.nombre) === normalize(nombreEsp));
  if (!esp) throw new Error(`No se encontró la especialidad: ${nombreEsp}`);

  const url = `http://backend:8080/especialidades/centrosAtencion/${centro.id}/especialidades/${esp.id}`;
  const r = request('POST', url, { json: {} });
  this.httpStatus = r.statusCode;
  this.response = JSON.parse(r.getBody('utf8'));
});

// Listing requests

// Listing requests
When('un usuario del sistema solicita la lista de especialidades asociadas al centro {string} para especialidadesCentro', function(nombreCentro) {
  // Busca el centro por nombre
  const res = request('GET', `http://backend:8080/centrosAtencion`);
  const centros = JSON.parse(res.getBody('utf8')).data;
  const centro = centros.find(x => x.name && x.name.trim().toLowerCase() === nombreCentro.trim().toLowerCase());
  if (!centro) throw new Error(`No se encontró el centro: ${nombreCentro}`);
  const centroId = centro.id;

  // Ahora sí, hace el GET correcto
  const url = `http://backend:8080/especialidades/centrosAtencion/${centroId}/especialidades`;
  const r = request('GET', url);
  this.httpStatus = r.statusCode;
  this.response = JSON.parse(r.getBody('utf8'));
});


When('un usuario del sistema solicita la lista de especialidades asociadas', function() {
  const res = request('GET', `http://backend:8080/especialidades/centrosAtencion/especialidades`);
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});

// Thens  Entonces el sistema responde con status_code "<status_code>" y status_text "<status_text>"
Then('el sistema responde con status_code {string} y status_text {string} para especialidadesCentro', function (statusCode, statusText) {

  assert.strictEqual(this.response.status_code, statusCode);
  assert.strictEqual(this.response.status_text, statusText.replace(/"/g, ''));
});

// Validar JSON simple (array de strings o array de objetos)
Then('el sistema responde con un JSON para especialidadesCentro:', function(docString) {
  const expected = JSON.parse(docString);
  console.log('--- DEBUG: this.response ---', JSON.stringify(this.response, null, 2));
  assert.strictEqual(this.httpStatus, 200);
  assert.strictEqual(this.response.status_code, expected.status_code);
  if (expected.status_text) assert.strictEqual(this.response.status_text, expected.status_text);

  // Obtener array bruto
  let actualRaw = this.response.data;
  if (!Array.isArray(actualRaw) && actualRaw && Array.isArray(actualRaw.data)) {
    actualRaw = actualRaw.data;
  }
  if (!Array.isArray(actualRaw)) actualRaw = [];
  console.log('--- DEBUG: actualRaw ---', actualRaw);
  console.log('--- DEBUG: expected.data ---', expected.data);

  // Caso array de strings:
  if (Array.isArray(expected.data) && expected.data.every(d => typeof d === 'string')) {
    const actual = actualRaw.map(e => typeof e === 'string' ? e : e.nombre);
    console.log('--- DEBUG: mapped actual strings ---', actual);
    assert.deepStrictEqual(
      actual.slice().sort(),
      expected.data.slice().sort()
    );
    return;
  }

  // Caso array de objetos con id/nombre
  const actual = actualRaw.map(e => ({ id: e.id, nombre: e.nombre }));
  expected.data.sort((a, b) => a.id - b.id);
  actual.sort((a, b) => a.id - b.id);
  assert.deepStrictEqual(actual, expected.data);
});

Then('el sistema responde con la siguiente lista de especialidades para especialidadesCentro:', function(docString) {
  const expected = JSON.parse(docString);
  assert.strictEqual(this.httpStatus, 200);
  assert.strictEqual(this.response.status_code, expected.status_code);
  const dataTransformada = this.response.data.map(e => ({ id: e.id, nombre: e.nombre }));
  dataTransformada.sort((a, b) => a.id - b.id);
  expected.data.sort((a, b) => a.id - b.id);
  assert.deepStrictEqual(dataTransformada, expected.data);
});
