const { Given, When, Then, BeforeAll } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

// Ejecuta solo una vez antes de todos los escenarios
BeforeAll(function () {
  console.log('🚀 Limpiando base de datos de especialidades...');
  const res = request('DELETE', 'http://backend:8080/especialidades/reset');
  assert.strictEqual(res.statusCode, 200, 'No se pudo resetear la base de datos de especialidades');
  console.log('✅ Base de datos de especialidades limpia.');
});

Given('que la especialidad {string} existe en el sistema con la descripción {string}', async function (nombre, descripcion) {
    const especialidad = {
  
        nombre: nombre.trim().toLowerCase(),
        descripcion: descripcion.trim()
    };

    const res = await request('POST', 'http://backend:8080/especialidades', { json: especialidad });
    if (res.statusCode !== 200) {
        throw new Error(`No se pudo crear la especialidad: ${nombre}`);
    }
});

Given('otra especialidad con el nombre {string} ya está registrada', function (nombre) {
  const especialidad = { nombre,};
  const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
});

Given('que existen {int} especialidades registradas en el sistema', function (cantidad) {
  for (let i = 1; i <= cantidad; i++) {
    const especialidad = { nombre: `Especialidad ${i}`, descripcion: `Descripción ${i}` };
    const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
    assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad ${i}`);
  }
});

Given('que la especialidad {string} no existe en el sistema', function (nombre) {
  const resBuscar = request('GET', 'http://backend:8080/especialidades');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const nombreNormalizado = nombre.trim().toLowerCase();
  const especialidadExistente = especialidades.find(e => e.nombre === nombreNormalizado);
  if (especialidadExistente) {
    const resEliminar = request('DELETE', `http://backend:8080/especialidades/${especialidadExistente.id}`);
    assert.strictEqual(resEliminar.statusCode, 200, `No se pudo eliminar la especialidad existente: ${nombre}`);
  }
});

Given('que no existen especialidades en el sistema', function () {
  const res = request('DELETE', 'http://backend:8080/especialidades/reset');
  assert.strictEqual(res.statusCode, 200, 'No se pudo resetear la base de datos de especialidades');

  // Crear especialidades necesarias para la prueba
  const especialidades = [
    { nombre: 'Alergia e Inmunología', descripcion: 'Diagnóstico y tratamiento de enfermedades alérgicas e inmunológicas.' },
    { nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón y el sistema circulatorio.' }
  ];
  especialidades.forEach(especialidad => {
    const resCrear = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
    assert.strictEqual(resCrear.statusCode, 200, `No se pudo crear la especialidad: ${especialidad.nombre}`);
  });
});

Given('que la especialidad {string} existe en el sistema', function (nombre) {
  const especialidad = { nombre, descripcion: `Descripción de ${nombre}` };
  const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
});

Given('que la especialidad {string} ya existe en el sistema', function (nombre) {
  const especialidad = { nombre, descripcion: `Descripción de ${nombre}` };
  const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
});

When('el administrador crea una especialidad con el nombre {string} y la descripción {string}', function (nombre, descripcion) {
  const especialidad = { nombre, descripcion };
  try {
    const res = request('POST', 'http://backend:8080/especialidades', { json: especialidad });
    this.response = JSON.parse(res.getBody('utf8')); // Asegurarse de parsear el cuerpo de la respuesta
  } catch (error) {
    console.error('Error en la solicitud:', error);
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : { status_code: 500, status_text: 'Error interno' };
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
    this.response = JSON.parse(res.getBody('utf8')); // Asegurarse de parsear el cuerpo de la respuesta
  } catch (error) {
    console.error('Error en la solicitud:', error);
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : { status_code: 500, status_text: 'Error interno' };
  }
});

When('el administrador intenta cambiar el nombre de {string} a {string}', function (nombreOriginal, nombreNuevo) {
  const resBuscar = request('GET', 'http://backend:8080/especialidades');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombreOriginal);
  assert.ok(especialidadExistente, `No se encontró la especialidad con nombre: ${nombreOriginal}`);

  const especialidadEditada = {
    id: especialidadExistente.id,
    nombre: nombreNuevo,
    descripcion: especialidadExistente.descripcion,
  };

  try {
    const res = request('PUT', `http://backend:8080/especialidades/${especialidadExistente.id}`, { json: especialidadEditada });
    this.response = JSON.parse(res.getBody('utf8')); // Asegúrate de parsear el cuerpo de la respuesta
  } catch (error) {
    console.error('Error en la solicitud:', error);
    this.response = error.response ? JSON.parse(error.response.body.toString('utf8')) : { status_code: 500, status_text: 'Error interno' };
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

When('un usuario del sistema solicita la lista de especialidades', function () {
  const res = request('GET', 'http://backend:8080/especialidades');
  this.response = JSON.parse(res.getBody('utf8'));
  this.statusCode = res.statusCode;
});

Then('el sistema responde con el status code {int} y el status text {string} para la especialidad', function (expectedStatus, expectedText) {
  // Validar el status_code interno en el cuerpo de la respuesta
  assert.strictEqual(
    this.response.status_code,
    expectedStatus,
    `Esperado status_code ${expectedStatus}, pero fue ${this.response.status_code}`
  );

  // Validar el status_text interno en el cuerpo de la respuesta
  assert.strictEqual(
    this.response.status_text.trim(),
    expectedText.trim(),
    `Esperado status_text "${expectedText}", pero fue "${this.response.status_text}"`
  );
});