const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

// Resetear base de datos
Given('que existen centros de atención creados en el sistema', function () {
  const res = request('DELETE', 'http://backend:8080/centros/reset');
  assert.strictEqual(res.statusCode, 200, 'Error al resetear base');
});

// Registrar centros de atención base
Given('los siguientes centros de atención han sido registrados:', function (dataTable) {
  this.centrosRegistrados = {};
  const centros = dataTable.hashes();
  centros.forEach(centro => {
    const centroData = {
      name: centro.Nombre,
      direccion: centro.Dirección,
      localidad: centro.Localidad,
      provincia: centro.Provincia,
      coordenadas: centro.Coordenadas  
    };
    
    const res = request('POST', 'http://backend:8080/centros', { json: centroData });
    assert.strictEqual(res.statusCode, 200, 'Error al registrar centro');
    const responseBody = JSON.parse(res.getBody('utf8'));
    this.centrosRegistrados[centro.Nombre.trim()] = responseBody.data.id;
    console.log('📥 Centro registrado:', centroData);
  });
});

// Modificar datos de un centro de atención
When('el administrador modifica los datos del centro de atención {string} con los siguientes atributos:', function (nombreCentro, dataTable) {
  const datos = dataTable.hashes()[0];
  console.log("📊 Datos recibidos:", datos);

  // Obtener lista de centros
  const resFind = request('GET', 'http://backend:8080/centros');
  assert.strictEqual(resFind.statusCode, 200, "❌ Error al obtener centros.");
  const centros = JSON.parse(resFind.getBody('utf8')).data;
  console.log("📋 Centros registrados:", centros.map(c => `"${c.name}"`));

  // Buscar el centro por nombre
  const idCentro = this.centrosRegistrados[nombreCentro.trim()];
  const centro = centros.find(c => c.name && c.name.trim() === nombreCentro.trim());
  assert.ok(centro, `❌ Centro "${nombreCentro}" no encontrado`);

  const datosModificados = {
    id: idCentro,
    name: datos['Nombre'].replace(/^"|"$/g, ''),
    direccion: datos['Dirección'].replace(/^"|"$/g, ''),
    localidad: datos['Localidad'].replace(/^"|"$/g, ''),
    provincia: datos['Provincia'].replace(/^"|"$/g, ''),
    coordenadas: datos['Coordenadas'].replace(/^"|"$/g, '')
  };

  console.log("✏️ Modificando centro:", datosModificados);

  const resMod = request('PUT', 'http://backend:8080/centros', { json: datosModificados });
  this.response = JSON.parse(resMod.getBody('utf8'));
  this.statusCode = resMod.statusCode;
  console.log("📤 Respuesta de modificación:", this.response);
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
