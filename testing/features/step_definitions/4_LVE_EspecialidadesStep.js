const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que la especialidad {string} existe en el sistema con la descripción {string}', function (nombre, descripcion) {
  const especialidad = { nombre, descripcion };
  const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
});

Given('que existen {int} especialidades registradas en el sistema', function (cantidad) {
  for (let i = 1; i <= cantidad; i++) {
    const especialidad = { nombre: `Especialidad ${i}`, descripcion: `Descripción ${i}` };
    const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad ${i}`);
  }
});

Given('que no existen especialidades en el sistema', function () {
  const res = request('DELETE', 'http://backend:8080/especialidad');
  assert.strictEqual(res.statusCode, 200, 'No se pudieron eliminar las especialidades existentes');
});

Given('que la especialidad {string} no existe en el sistema', function (nombre) {
  const resBuscar = request('GET', 'http://backend:8080/especialidad');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombre);
  if (especialidadExistente) {
    const resEliminar = request('DELETE', `http://backend:8080/especialidad/${especialidadExistente.id}`);
    assert.strictEqual(resEliminar.statusCode, 200, `No se pudo eliminar la especialidad existente: ${nombre}`);
  }
});

When('el administrador crea una especialidad con el nombre {string} y la descripción {string}', function (nombre, descripcion) {
  const especialidad = { nombre, descripcion };
  try {
    const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

When('el administrador intenta crear una especialidad con el nombre {string} y la descripción {string}', function (nombre, descripcion) {
  const especialidad = { nombre, descripcion };
  try {
    const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

When('el administrador edita la especialidad {string} cambiando su nombre a {string} y su descripción a {string}', function (nombreOriginal, nombreNuevo, descripcionNueva) {
  const resBuscar = request('GET', 'http://backend:8080/especialidad');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombreOriginal);
  assert.ok(especialidadExistente, `No se encontró la especialidad con nombre: ${nombreOriginal}`);

  const especialidadEditada = {
    id: especialidadExistente.id,
    nombre: nombreNuevo,
    descripcion: descripcionNueva,
  };

  try {
    const res = request('PUT', `http://backend:8080/especialidad/${especialidadExistente.id}`, { json: especialidadEditada });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

When('el administrador elimina la especialidad {string}', function (nombre) {
  const resBuscar = request('GET', 'http://backend:8080/especialidad');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombre);
  assert.ok(especialidadExistente, `No se encontró la especialidad con nombre: ${nombre}`);

  const res = request('DELETE', `http://backend:8080/especialidad/${especialidadExistente.id}`);
  this.statusCode = res.statusCode;
  this.response = res.statusCode === 200 ? JSON.parse(res.getBody('utf8')) : {}; // Captura el cuerpo de la respuesta si es exitoso
});

When('un usuario del sistema solicita la lista de especialidades', function () {
  const res = request('GET', 'http://backend:8080/especialidad');
  this.response = JSON.parse(res.getBody('utf8'));
  this.statusCode = res.statusCode;
});

Then('el sistema responde con {int} y {string} para la especialidad', function (statusCode, statusText) {
  assert.strictEqual(this.statusCode, statusCode, `Esperado ${statusCode}, pero fue ${this.statusCode}`);
  if (statusCode === 409) {
    assert.strictEqual(this.response, statusText, `Esperado "${statusText}", pero fue "${this.response}"`);
  }
});

Then('el sistema responde con un JSON: para la especialidad', function (docString) {
  const expectedResponse = JSON.parse(docString);
  assert.deepStrictEqual(this.response, expectedResponse, 'La respuesta del sistema no coincide con lo esperado');
});

