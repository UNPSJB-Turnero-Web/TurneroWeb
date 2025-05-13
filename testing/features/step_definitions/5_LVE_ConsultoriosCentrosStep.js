const { Given, When, Then, BeforeAll } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

const BASE_URL = 'http://backend:8080';

BeforeAll(function() {
  try {
    const res = request('DELETE', 'http://backend:8080/consultorios/reset');
    console.log(`🔄 [BeforeAll] reset consultorios status=${res.statusCode}`);
  } catch (err) {
    console.warn(`⚠️ [BeforeAll] no se pudo resetear consultorios: ${err.message}`);
    // no throw, para que no mate el runner
  }
});

// Step para poblar centros desde tabla (usalo en el Antecedente del feature)
Given('los siguientes centros de atención han sido registrados test5:', function (dataTable) {
  const centros = dataTable.hashes();

  centros.forEach(centro => {
    // Separar latitud y longitud si viene en "coordenadas"
    let latitud = null, longitud = null;
    if (centro.Coordenadas) {
      const coords = centro.Coordenadas.split(',').map(x => parseFloat(x.trim()));
      latitud = coords[0];
      longitud = coords[1];
    }

    const centroData = {
      name: centro.Nombre ? centro.Nombre.trim() : null,
      direccion: centro.Dirección ? centro.Dirección.trim() : null,
      localidad: centro.Localidad ? centro.Localidad.trim() : null,
      provincia: centro.Provincia ? centro.Provincia.trim() : null,
      telefono: centro.Teléfono ? centro.Teléfono.trim() : null,
      latitud,
      longitud
    };

    if (!centroData.name || !centroData.direccion || !centroData.localidad || !centroData.provincia || !centroData.telefono || latitud === null || longitud === null) {
      throw new Error('Faltan datos obligatorios para registrar el centro de atención.');
    }

    const res = request('POST', `${BASE_URL}/centrosAtencion`, { json: centroData });
    if (![200, 409].includes(res.statusCode)) {
      throw new Error(`No se pudo crear el centro: ${centroData.name} (status ${res.statusCode})`);
    }
  });
});

Given('que existe un centro de atención llamado {string}', function(nombreCentro) {
  // Intenta buscar el centro
  const res = request('GET', `${BASE_URL}/centrosAtencion`);
  let centros = [];
  try {
    centros = JSON.parse(res.getBody('utf8')).data;
  } catch (e) {
    throw new Error('No se pudo obtener la lista de centros');
  }
  let c = centros.find(x => x.name && x.name.trim().toLowerCase() === nombreCentro.trim().toLowerCase());

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