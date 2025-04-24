const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');
const axios = require('axios');

// Resetear base
Given('que existen centros de atención creados en el sistema', function () {
  const res = request('DELETE', 'http://localhost:8080/centros/reset');
  assert.strictEqual(res.statusCode, 200, 'Error al resetear base');
});

// Registrar centros de atención base
Given('los siguientes centros de atención han sido registrados:', function (dataTable) {
  const centros = dataTable.hashes();
  centros.forEach(centro => {
    const coords = centro.Coordenadas.split(',');
    const centroData = {
      name: centro.Nombre,
      direccion: centro.Dirección,
      localidad: centro.Localidad,
      provincia: centro.Provincia,
      latitud: parseFloat(coords[0]),
      longitud: parseFloat(coords[1])
    };
    const res = request('POST', 'http://localhost:8080/centros', { json: centroData });
    assert.strictEqual(res.statusCode, 200, 'Error al registrar centro');
    console.log('📥 Centro registrado:', centroData);
  });
});

// Modificar datos del centro
When('el administrador modifica los datos del centro de atención {string} con los siguientes atributos:', async function (nombreCentro, dataTable) {
  const datos = dataTable.hashes()[0];
  console.log("📊 Datos recibidos:", datos);

  // Obtener lista de centros
  const resFind = await axios.get('http://localhost:8080/centros');
  assert.strictEqual(resFind.status, 200, "❌ Error al obtener centros.");
  const centros = resFind.data.data;
  console.log("📋 Centros registrados:", centros.map(c => `"${c.name}"`));

  // Buscar el centro por nombre
  const centro = centros.find(c => c.name.trim() === nombreCentro.trim());
  assert.ok(centro, `❌ Centro ${nombreCentro} no encontrado`);

  // Parsear y validar coordenadas mejor
  const coordsRaw = datos['Coordenadas'].replace(/[<>]/g, '').trim();
  const [latStr, lngStr] = coordsRaw.split(',').map(s => s.trim());
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  console.log(`🧹 Coordenadas procesadas: lat=${lat}, lng=${lng}`);
  assert.ok(!isNaN(lat) && !isNaN(lng), "❌ Coordenadas inválidas");

  // Preparar modificación
  const datosModificados = {
    id: centro.id,
    name: datos['Nombre'],
    direccion: datos['Dirección'],
    localidad: datos['Localidad'],
    provincia: datos['Provincia'],
    latitud: lat,
    longitud: lng
  };
  console.log("✏️ Modificando centro:", datosModificados);

  // Ejecutar PUT
  const resMod = await axios.put(`http://localhost:8080/centros/${centro.id}`, datosModificados);
  this.response = resMod.data;
  this.statusCode = resMod.status;
  console.log("📤 Respuesta de modificación:", resMod.data);
});

// Verificar la respuesta del sistema
Then('el sistema responde con {int} y {string}', function (codigoEsperado, textoEsperado) {
  console.log("==== DEBUG TEST ====");
  console.log("Código esperado:", codigoEsperado);
  console.log("Código recibido:", this.statusCode);
  console.log("Respuesta completa:", JSON.stringify(this.response, null, 2));
  console.log("Texto esperado:", textoEsperado);
  console.log("====================");

  assert.strictEqual(this.statusCode, codigoEsperado, `Esperado status HTTP ${codigoEsperado} pero fue ${this.statusCode}`);
  assert.strictEqual(this.response.status_code, codigoEsperado, `Esperado status_code ${codigoEsperado} pero fue ${this.response.status_code}`);
  assert.strictEqual(this.response.status_text.trim(), textoEsperado.trim(), `Esperado status_text "${textoEsperado}" pero fue "${this.response.status_text}"`);
});
