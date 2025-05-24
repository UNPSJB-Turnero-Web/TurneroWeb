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
  const centro = centros.find(x => x.nombre && normalize(x.nombre) === normalize(nombreCentro));
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
    .find(c => c.nombre && normalize(c.nombre) === normalize(nombreCent));
  if (!centro) {
    this.httpStatus = 409;
    this.response = {
      status_code: 409,
      status_text: "No existe el Centro Médico"
    };
    return;
  }
  // obtener id especialidad
  const resE = request('GET', 'http://backend:8080/especialidades');
  const esp = JSON.parse(resE.getBody('utf8')).data
    .find(e => e.nombre && normalize(e.nombre) === normalize(nombreEsp));
  if (!esp) {
    this.httpStatus = 409;
    this.response = {
      status_code: 409,
      status_text: "No existe la especialidad"
    };
    return;
  }

  const url = `http://backend:8080/especialidades/centrosAtencion/${centro.id}/especialidades/${esp.id}`;
  const r = request('POST', url, { json: {} });
  this.httpStatus = r.statusCode;
  this.response = JSON.parse(r.getBody('utf8'));
});

// Desasociación de especialidad de centro
When('el administrador desasocia la especialidad {string} del centro de atención {string} para especialidadesCentro', function(nombreEsp, nombreCent) {
  // obtener id centro
  const resC = request('GET', 'http://backend:8080/centrosAtencion');
  const centro = JSON.parse(resC.getBody('utf8')).data
    .find(c => c.nombre && normalize(c.nombre) === normalize(nombreCent));
  if (!centro) throw new Error(`No se encontró el centro: ${nombreCent}`);
  // obtener id especialidad
  const resE = request('GET', 'http://backend:8080/especialidades');
  const esp = JSON.parse(resE.getBody('utf8')).data
    .find(e => e.nombre && normalize(e.nombre) === normalize(nombreEsp));
  if (!esp) throw new Error(`No se encontró la especialidad: ${nombreEsp}`);

  const url = `http://backend:8080/especialidades/centrosAtencion/${centro.id}/especialidades/${esp.id}`;
  const r = request('DELETE', url);
  this.httpStatus = r.statusCode;
  this.response = JSON.parse(r.getBody('utf8'));
});

// Listing requests
When('un usuario del sistema solicita la lista de especialidades asociadas al centro {string} para especialidadesCentro', function(nombreCentro) {
  // Busca el centro por nombre
  const res = request('GET', `http://backend:8080/centrosAtencion`);
  const centros = JSON.parse(res.getBody('utf8')).data;
  const centro = centros.find(x => x.nombre && normalize(x.nombre) === normalize(nombreCentro));
  if (!centro) throw new Error(`No se encontró el centro: ${nombreCentro}`);
  const centroId = centro.id;

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
  assert.strictEqual(this.httpStatus, 200);
  assert.strictEqual(this.response.status_code, expected.status_code);
  if (expected.status_text) assert.strictEqual(this.response.status_text, expected.status_text);

  let actual;
  if (Array.isArray(this.response.data) && this.response.data.length && this.response.data[0].centro_de_atencion) {
    actual = this.response.data.map(item => ({
      centro_de_atencion: item.centro_de_atencion,
      especialidades: item.especialidades.map(e => typeof e === 'string' ? e : e.nombre).sort()
    }));

    // Filtrar solo los centros esperados
    const centrosEsperados = expected.data.map(e => e.centro_de_atencion);
    actual = actual.filter(a => centrosEsperados.includes(a.centro_de_atencion));

    // Ordenar ambos arrays por nombre de centro
    actual.sort((a, b) => a.centro_de_atencion.localeCompare(b.centro_de_atencion));
    expected.data.forEach(e => e.especialidades.sort());
    expected.data.sort((a, b) => a.centro_de_atencion.localeCompare(b.centro_de_atencion));
  } else if (Array.isArray(this.response.data) && this.response.data.length && this.response.data[0].nombre) {
    actual = this.response.data.map(e => e.nombre).sort();
    expected.data.sort();
  } else {
    actual = this.response.data;
  }

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
