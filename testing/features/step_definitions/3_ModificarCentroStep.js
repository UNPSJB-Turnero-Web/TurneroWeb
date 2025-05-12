const { When, Then, Given } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que existen centros de atención creados en el sistema', function () {
  console.log('🌟 Base de datos inicializada.');
});

Given('los siguientes centros de atención han sido registrados:', function (dataTable) {
  const centros = dataTable.hashes();
  
  centros.forEach(centro => {
    const centroData = {
      name: centro.Nombre,
      direccion: centro.Dirección,
      localidad: centro.Localidad,
      provincia: centro.Provincia,
      telefono: centro.Teléfono,
      coordenadas: centro.Coordenadas
    };
    console.log('📥 Centro registrado:', centroData);

    const res = request('POST', 'http://backend:8080/centrosAtencion', { json: centroData });
    const body = JSON.parse(res.getBody('utf8'));
  });
});

When('el administrador modifica los datos del centro de atención {string} con los siguientes atributos:', function (nombreCentroActual, dataTable) {
  const atributos = dataTable.hashes()[0];

  const resBuscar = request('GET', 'http://backend:8080/centrosAtencion');
  const listaCentros = JSON.parse(resBuscar.getBody('utf8')).data;

  const centroExistente = listaCentros.find(c => 
    c.name.trim().toLowerCase() === nombreCentroActual.replace(/"/g, '').trim().toLowerCase()
  );

  if (!centroExistente) {
    throw new Error(`No se encontró el centro con nombre: ${nombreCentroActual}`);
  }

  const centroData = {
    id: centroExistente.id,
    name: atributos.Nombre.replace(/"/g, '').trim(),
    direccion: atributos.Dirección.replace(/"/g, '').trim(),
    localidad: atributos.Localidad.replace(/"/g, '').trim(),
    provincia: atributos.Provincia.replace(/"/g, '').trim(),
    telefono: atributos.Teléfono.replace(/"/g, '').trim(),
    coordenadas: atributos.Coordenadas.replace(/"/g, '').trim()
  };

  console.log('✏️ Modificando centro:', centroData);

  try {
    const res = request('PUT', 'http://backend:8080/centrosAtencion', { json: centroData });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
    console.log('✅ Modificación exitosa:', this.response);
  } catch (error) {
    if (error.statusCode) {
      this.statusCode = error.statusCode;
      this.response = JSON.parse(error.response.body.toString('utf8'));
      console.log('⚠️ Error en modificación controlada:', this.response);
    } else {
      console.error('💥 Error inesperado:', error);
      throw error;
    }
  }
});

Then('el sistema responde con {int} y {string} para el centro de atención', function (expectedStatus, expectedText) {
  assert.strictEqual(this.response.status_code, expectedStatus, `Esperado ${expectedStatus}, pero fue ${this.response.status_code}`);
  assert.strictEqual(this.response.status_text.trim(), expectedText.trim(), `Esperado "${expectedText}", pero fue "${this.response.status_text}"`);
});
