const { Given, When, Then, BeforeAll } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

// Ejecuta solo una vez antes de todos los escenarios
BeforeAll(function () {
  console.log('🚀 Limpiando base de datos de especialidades...');
  const res = request('DELETE', 'http://backend:8080/especialidad/reset');
  
  if (res.statusCode !== 200) {
    throw new Error('❌ No se pudo resetear la base de datos de especialidades');
  }
  console.log('✅ Base de datos de especialidades limpia.');
});
Given('que la especialidad {string} existe en el sistema', function (nombre) {
  const especialidad = { nombre };
  try {
    const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    console.log('Especialidad creada:', res.getBody('utf8')); // Log de depuración
    assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
  } catch (error) {
    console.error('Error al crear la especialidad:', error); // Log de depuración
    if (error.statusCode !== 409) {
      throw error; 
    }
  }
});
Given('otra especialidad con el nombre {string} ya está registrada', function (nombre) {
  const especialidad = { nombre,};
  const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
  assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad: ${nombre}`);
});
Given('que existen {int} especialidades registradas en el sistema', function (cantidad) {
  for (let i = 1; i <= cantidad; i++) {
    const especialidad = { nombre: `Especialidad ${i}` };
    const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    assert.strictEqual(res.statusCode, 200, `No se pudo crear la especialidad ${i}`);
  }
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

Given('que no existen especialidades en el sistema', function () {
  const res = request('DELETE', 'http://backend:8080/especialidad/reset');
  assert.strictEqual(res.statusCode, 200, 'No se pudo resetear la base de datos de especialidades');
  // Crear especialidades necesarias para la prueba
  const especialidades = [
    { nombre: 'Alergia e Inmunología' },
    { nombre: 'Cardiología'}
  ];
  especialidades.forEach(especialidad => {
    const resCrear = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    assert.strictEqual(resCrear.statusCode, 200, `No se pudo crear la especialidad: ${especialidad.nombre}`);
  });
});
//FALLA
When('el administrador crea una especialidad con el nombre {string}', function (nombre) {
  const especialidad = { nombre };
  try {
    const res = request('POST', 'http://backend:8080/especialidad', { json: especialidad });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  } catch (error) {
    console.error('Error en la solicitud:', error); // Log de depuración
    this.statusCode = error.statusCode || 500;

    if (error.response && error.response.body) {
      const responseBody = error.response.body.toString('utf8');
      console.log('Cuerpo de la respuesta de error:', responseBody); // Log adicional
      this.response = JSON.parse(responseBody);
    } else {
      this.response = { status_text: 'No se recibió respuesta del servidor' };
    }
  }
});

When('el administrador edita la especialidad {string} cambiando su nombre a {string}', function (nombreOriginal, nombreNuevo, ) {
  const resBuscar = request('GET', 'http://backend:8080/especialidad');
  const especialidades = JSON.parse(resBuscar.getBody('utf8')).data;

  const especialidadExistente = especialidades.find(e => e.nombre === nombreOriginal);
  assert.ok(especialidadExistente, `No se encontró la especialidad con nombre: ${nombreOriginal}`);

  const especialidadEditada = {
    id: especialidadExistente.id,
    nombre: nombreNuevo,
  };

  try {
    const res = request('PUT', `http://backend:8080/especialidad/${especialidadExistente.id}`, { json: especialidadEditada });
    assert.strictEqual(res.statusCode, 200, `Error al editar la especialidad: ${res.getBody('utf8')}`);
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

Then('el sistema responde con el status code {int} y el status text {string} para la especialidad', function (statusCode, statusText) {
  console.log('Contenido de this.response:', this.response); // Log de depuración
  console.log('Código de estado recibido:', this.statusCode); // Log adicional

  assert.strictEqual(this.statusCode, statusCode, `Esperado ${statusCode}, pero fue ${this.statusCode}`);
  assert.strictEqual(this.response.status_text, statusText, `Esperado "${statusText}", pero fue "${this.response.status_text}"`);
});

Then('el sistema responde con un JSON para la especialidad:', function (docString) {
  const expectedResponse = JSON.parse(docString);
  const actualData = this.response.data.map(({ nombre }) => ({ nombre }));
  const expectedData = expectedResponse.data;

  assert.deepStrictEqual(actualData, expectedData, 'La respuesta del sistema no coincide con lo esperado');
});