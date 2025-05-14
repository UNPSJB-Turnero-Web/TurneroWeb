const { Given, When, Then, BeforeAll } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');


Given('que existe un centro de atención llamado {string}', function(nombreCentro) {
  // Intenta buscar el centro
  const res = request('GET', `http://backend:8080/centrosAtencion`);
  let centros = [];
  try {
    centros = JSON.parse(res.getBody('utf8')).data;
  } catch (e) {
    throw new Error('No se pudo obtener la lista de centros');
  }

  function normalize(str) {
    return str
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
      .replace(/\s+/g, " ") // espacios múltiples a uno solo
      .trim()
      .toLowerCase();
  }

  let c = centros.find(x => x.Nombre && normalize(x.Nombre) === normalize(nombreCentro));

  if (!c) throw new Error(`No se encontró el centro: ${nombreCentro}`);
  this.centroId = c.id;
  this.centroNombre = nombreCentro;
});

Given('que existen múltiples centros de atención registrados', function () {
  // LA BD SE POPULA EN LOS TEST ANTERIORES
  return true;
});

When('se registra un consultorio con el número {string} y el nombre {string}', function (numero, nombreConsultorio) {
  // POST a /consultorios/{centroNombre}
  const payload = {
    numero: parseInt(numero, 10),
    name: nombreConsultorio
  };
  const url = `http://backend:8080/consultorios/${encodeURIComponent(this.centroNombre)}`;
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
  const url = `http://backend:8080/consultorios/${encodeURIComponent(this.centroNombre)}/listar`;
  const res = request('GET', url);
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});

Then('el sistema responde con el siguiente JSON:', function (docString) {
  const expected = JSON.parse(docString);
  assert.strictEqual(this.httpStatus, 200);

  // Agrupar consultorios por centro
  const agrupados = {};
  for (const c of this.response.data) {
    const nombreCentro = c.centroAtencion.name;
    if (!agrupados[nombreCentro]) agrupados[nombreCentro] = [];
    agrupados[nombreCentro].push({ numero: c.numero, nombre: c.name });
  }
  const dataTransformada = Object.entries(agrupados).map(([centro_atencion, consultorios]) => ({
    centro_atencion,
    consultorios
  }));

  assert.strictEqual(this.response.status_code, expected.status_code);
  if (expected.status_text) assert.strictEqual(this.response.status_text, expected.status_text);
  assert.deepStrictEqual(dataTransformada, expected.data);
});

Given('existen múltiples centros de atención registrados', function () {
  // Asumimos datos precargados para este escenario
});

When('se solicita la lista completa de centros con sus consultorios', function () {
  // Implementar cuando exista endpoint específico, por ejemplo GET /consultorios
  const res = request('GET', `http://backend:8080/consultorios`);
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});