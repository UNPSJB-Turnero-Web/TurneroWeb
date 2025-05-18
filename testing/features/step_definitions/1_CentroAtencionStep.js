const { BeforeAll, When, Then, Given } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

// Ejecuta solo una vez antes de todos los escenarios
BeforeAll(function () {
  console.log('🚀 Limpiando base de datos de centros...');
  const res3 = request('DELETE', 'http://backend:8080/staff-medico/reset');
  const res2 = request('DELETE', 'http://backend:8080/medicos/reset');
  const res1 = request('DELETE', 'http://backend:8080/consultorios/reset');//LIMPIA PRIMERO CONSULTORIOS POR KEY CONSTRAINS
  const res = request('DELETE', 'http://backend:8080/centrosAtencion/reset');
  
if (res3.statusCode !== 200) {
    throw new Error('❌ No se pudo resetear la base de datos de staffmedicos');
  }
  if (res2.statusCode !== 200) {
    throw new Error('❌ No se pudo resetear la base de datos de medicos');
  }
  if (res1.statusCode !== 200) {
    throw new Error('❌ No se pudo resetear la base de datos de consultorios');
  }
  console.log('✅ Base de datos limpia.');
  if (res.statusCode !== 200) {
    throw new Error('❌ No se pudo resetear la base de datos de centros de atención');
  }
  console.log('✅ Base de datos limpia.');
});

Given('que existe un sistema de gestión de centros de atención', function () {
  // console.log('ℹ️ Sistema de gestión inicializado (base ya limpia)');
});

When(
  'el administrador ingresa los datos del centro de atención: {string}, {string}, {string}, {string}, {string}, {string} y {string}',
  function (name, direccion, localidad, provincia, telefono, latitud, longitud) {
    const centroData = {
      name: name || null,
      direccion: direccion || null,
      localidad: localidad || null,
      provincia: provincia || null,
      telefono: telefono || null,
      latitud: parseFloat(latitud) || null,
      longitud: parseFloat(longitud) || null
    };

    try {
      const res = request('POST', 'http://backend:8080/centrosAtencion', { json: centroData });
      this.response = JSON.parse(res.getBody('utf8'));

      this.statusCode = res.statusCode;
    } catch (error) {
      if (error.statusCode) {
        this.statusCode = error.statusCode;
        const bodyString = error.response && error.response.body && error.response.body.toString('utf8');
        this.response = bodyString ? JSON.parse(bodyString) : {};
      } else {
        throw error;
      }
    }

    return true;
  }
);

Then('el sistema responde con {int} y "{string}"', function (statusEsperado, mensajeEsperado) {
  const statusHTTP = this.statusCode;
  const respuesta = this.response;

  // Validación de status_code y status_text según tu Response.java modificado
  assert.strictEqual(respuesta.status_code, statusEsperado, `Esperado status_code ${statusEsperado} pero fue ${respuesta.status_code}`);
  assert.strictEqual(respuesta.status_text.trim(), mensajeEsperado.replace(/"/g, '').trim(),
    `Esperado status_text "${mensajeEsperado}" pero fue "${respuesta.status_text}"`);
});