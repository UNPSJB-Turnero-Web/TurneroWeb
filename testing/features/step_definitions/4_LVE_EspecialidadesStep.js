const { Given, When } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que la especialidad {string} existe en el sistema con la descripción {string}', function (nombre, descripcion) {
  const especialidad = { nombre, descripcion };
  const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
});

When('el administrador crea una especialidad con el nombre {string} y la descripción {string}', function (nombre, descripcion) {
  const especialidad = { nombre, descripcion };
  try {
    const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
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
    const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

When('el administrador edita la especialidad {string} cambiando su nombre a {string} y su descripción a {string}', function (nombreOriginal, nombreNuevo, descripcionNueva) {
  const resBuscar = request('GET', 'http://backend:8080/especialidades');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombreOriginal);
  assert.ok(especialidadExistente, `No se encontró la especialidad con nombre: ${nombreOriginal}`);

  const especialidadEditada = {
    id: especialidadExistente.id,
    nombre: nombreNuevo,
    descripcion: descripcionNueva,
  };

  try {
    const res = request('PUT', `http://backend:8080/especialidades/${especialidadExistente.id}`, { json: especialidadEditada });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    this.statusCode = error.statusCode || 500;
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : {};
  }
});

When('el administrador elimina la especialidad {string}', function (nombre) {
  const resBuscar = request('GET', 'http://backend:8080/especialidades');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombre);
  assert.ok(especialidadExistente, `No se encontró la especialidad con nombre: ${nombre}`);

  const res = request('DELETE', `http://backend:8080/especialidades/${especialidadExistente.id}`);
  this.statusCode = res.statusCode;
  this.response = res.statusCode === 200 ? JSON.parse(res.getBody('utf8')) : {}; // Captura el cuerpo de la respuesta si es exitoso
});

