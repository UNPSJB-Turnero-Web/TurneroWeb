const { When, Then, Given } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

Given('que existen centros de atención creados en el sistema', function () {
 // console.log('🌟 Base de datos inicializada.');
});

Given('los siguientes centros de atención han sido registrados:', function (dataTable) {
  const centros = dataTable.hashes();

  centros.forEach(centro => {
    const centroData = {
      nombre: centro.Nombre ? centro.Nombre.trim() : null,
      direccion: centro.Dirección ? centro.Dirección.trim() : null,
      localidad: centro.Localidad ? centro.Localidad.trim() : null,
      provincia: centro.Provincia ? centro.Provincia.trim() : null,
      telefono: centro.Teléfono ? centro.Teléfono.trim() : null,
      coordenadas: centro.Coordenadas ? centro.Coordenadas.trim() : null
    };

    if (!centroData.nombre || !centroData.direccion || !centroData.localidad || !centroData.provincia || !centroData.telefono || !centroData.coordenadas) {
      throw new Error('Faltan datos obligatorios para registrar el centro de atención.');
    }

   // console.log('📥 Centro registrado:', centroData);

    const res = request('POST', 'http://backend:8080/centrosAtencion', { json: centroData });
    const body = JSON.parse(res.getBody('utf8'));
  });
});

When('el administrador modifica los datos del centro de atención {string} con los siguientes atributos:', function (nombreCentroActual, dataTable) {
  const atributos = dataTable.hashes()[0];

  const nombre = atributos.Nombre ? atributos.Nombre.trim() : null;
  const direccion = atributos.Dirección ? atributos.Dirección.trim() : null;
  const localidad = atributos.Localidad ? atributos.Localidad.trim() : null;
  const provincia = atributos.Provincia ? atributos.Provincia.trim() : null;
  const telefono = atributos.Teléfono ? atributos.Teléfono.trim() : null;
  const coordenadas = atributos.Coordenadas ? atributos.Coordenadas.trim() : null;

  if (!nombre || !direccion || !localidad || !provincia || !telefono || !coordenadas) {
    throw new Error('Faltan datos obligatorios para modificar el centro de atención.');
  }

  // Separar latitud y longitud
  const [latitud, longitud] = coordenadas.split(',').map(coord => parseFloat(coord.trim()));

  if (isNaN(latitud) || isNaN(longitud)) {
    throw new Error(`Las coordenadas "${coordenadas}" no tienen un formato válido.`);
  }

  // Buscar el centro de atención existente
  const resBuscar = request('GET', 'http://backend:8080/centrosAtencion');
  const listaCentros = JSON.parse(resBuscar.getBody('utf8')).data;

  //console.log('📋 Lista de centros devuelta por el backend:', listaCentros);

  const centroExistente = listaCentros.find(c =>
    c.nombre && c.nombre.trim().toLowerCase() === nombreCentroActual.trim().toLowerCase()
  );

  if (!centroExistente) {
   // console.error('❌ No se encontró el centro en la lista:', nombreCentroActual);
    throw new Error(`No se encontró el centro con Nombre: ${nombreCentroActual}`);
  }

  if (!centroExistente.id) {
    //console.error('❌ El centro encontrado no tiene un ID válido:', centroExistente);
    throw new Error('El centro encontrado no tiene un ID válido.');
  }

  // Preparar los datos para la actualización
  const centroData = {
    id: centroExistente.id,
    nombre,
    direccion,
    localidad,
    provincia,
    telefono,
    latitud, // Enviar latitud como campo separado
    longitud // Enviar longitud como campo separado
  };

//  console.log('✏️ Modificando centro:', centroData);

  // Enviar la solicitud al backend
  try {
    const res = request('PUT', 'http://backend:8080/centrosAtencion', { json: centroData });
    this.response = JSON.parse(res.getBody('utf8'));
    this.statusCode = res.statusCode;
  //  console.log('✅ Modificación exitosa:', this.response);
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
  if (this.statusCode !== expectedStatus) {
    console.error('❌ Error del backend:', this.response);
  }
  assert.strictEqual(this.statusCode, expectedStatus, `Esperado ${expectedStatus}, pero fue ${this.statusCode}`);
  assert.strictEqual(this.response.status_text.trim(), expectedText.trim(), `Esperado "${expectedText}", pero fue "${this.response.status_text}"`);
});
