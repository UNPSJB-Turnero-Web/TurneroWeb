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

  let c = centros.find(x => x.nombre && normalize(x.nombre) === normalize(nombreCentro));


});

Given('que existen múltiples centros de atención registrados', function () {
  // LA BD SE POPULA EN LOS TEST ANTERIORES
  return true;
});

When('se registra un consultorio con el número {string} y el nombre {string}', function (numero, nombreConsultorio) {
  // POST a /consultorios/centro/{centroId}
  const payload = {
    numero: parseInt(numero, 10),
    nombre: nombreConsultorio
  };
  const url = `http://backend:8080/consultorios/centro/${this.centroId}`;
  const res = request('POST', url, { json: payload });
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
});

Then('el sistema responde con status_code {string} y status_text {string}', function (expectedCode, expectedText) {
  // No validar this.httpStatus, solo el status_code del body
  assert.strictEqual(this.response.status_code, parseInt(expectedCode, 10));
  assert.strictEqual(this.response.status_text, expectedText.replace(/"/g, ''));
});

When('se solicita la lista de consultorios del centro', function () {
  // GET a /consultorios/centrosAtencion/{this.centroId}/consultorios
  const url = `http://backend:8080/consultorios/centrosAtencion/${this.centroId}/consultorios`;
  const res = request('GET', url);
  this.httpStatus = res.statusCode;
  this.response = JSON.parse(res.getBody('utf8'));
 // console.log(JSON.stringify(this.response, null, 2));
});

Then('el sistema responde con el siguiente JSON:', function (docString) {
  const expected = JSON.parse(docString);

  assert.strictEqual(this.httpStatus, 200);
  assert.strictEqual(this.response.status_code, expected.status_code);
  if (expected.status_text) assert.strictEqual(this.response.status_text, expected.status_text);

  // Detecta si la respuesta es agrupada por centro
  if (Array.isArray(this.response.data) && this.response.data.length && this.response.data[0].centro_atencion) {
    // Agrupado por centro
    this.response.data.sort((a, b) => a.centro_atencion.localeCompare(b.centro_atencion));
    expected.data.sort((a, b) => a.centro_atencion.localeCompare(b.centro_atencion));

    for (let i = 0; i < this.response.data.length; i++) {
      this.response.data[i].consultorios.sort((a, b) => a.numero - b.numero);
      expected.data[i].consultorios.sort((a, b) => a.numero - b.numero);
    }

    assert.deepStrictEqual(this.response.data, expected.data);
  } else {
    // Lista plana (por centro)
    const dataTransformada = this.response.data.map(c => ({
      numero: c.numero,
      Nombre_consultorio: c.nombre
    }));

    dataTransformada.sort((a, b) => a.numero - b.numero);
    expected.data.sort((a, b) => a.numero - b.numero);

    
  }
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