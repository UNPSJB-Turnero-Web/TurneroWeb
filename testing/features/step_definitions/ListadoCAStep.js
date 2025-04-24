const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

When('el usuario solicita la lista de centros de atención', function () {
  try {
    console.log("🌐 Haciendo solicitud a localhost...");
    const res = request('GET', 'http://localhost:8080/centros/page?page=0&size=10');
    this.statusCode = res.statusCode;
    this.response = JSON.parse(res.getBody('utf8'));
    console.log("✅ Respuesta:", this.response);
  } catch (error) {
    console.error("❌ Error al hacer la solicitud:", error.message);
    console.error("Detalles:", error);
    this.statusCode = error.statusCode || 0;
    this.response = null;
  }
});

Then('el sistema responde con status_code {int} y status_text {string}', function (statusEsperado, textoEsperado) {
  assert.strictEqual(this.statusCode, 200, `Esperado HTTP 200 pero fue ${this.statusCode}`);
  assert.strictEqual(this.response.status_code, statusEsperado, `Esperado status_code ${statusEsperado} pero fue ${this.response.status_code}`);
  assert.strictEqual(this.response.status_text, textoEsperado, `Esperado status_text "${textoEsperado}" pero fue "${this.response.status_text}"`);
});

Then('el cuerpo de la respuesta contiene un array JSON con la siguiente estructura:', function (dataTable) {
  const centrosEsperados = dataTable.hashes();
  const centrosRespuesta = this.response.data;

  assert.strictEqual(centrosRespuesta.length, centrosEsperados.length, 'Cantidad de centros no coincide');

  for (let i = 0; i < centrosEsperados.length; i++) {
    const esperado = centrosEsperados[i];
    const actual = centrosRespuesta[i];
    const actualCoords = actual.coordenadas.split(',').map(n => parseFloat(n.trim()).toFixed(3)).join(', ');
    const esperadoCoords = esperado.coordenadas.split(',').map(n => parseFloat(n.trim()).toFixed(3)).join(', ');
    
    assert.strictEqual(actual.nombre, esperado.nombre, `Centro ${i} - nombre esperado ${esperado.nombre}, actual ${actual.nombre}`);
    assert.strictEqual(actual.direccion, esperado.direccion, `Centro ${i} - direccion esperada ${esperado.direccion}, actual ${actual.direccion}`);
    assert.strictEqual(actual.localidad, esperado.localidad, `Centro ${i} - localidad esperada ${esperado.localidad}, actual ${actual.localidad}`);
    assert.strictEqual(actual.provincia, esperado.provincia, `Centro ${i} - provincia esperada ${esperado.provincia}, actual ${actual.provincia}`);
    assert.strictEqual(actualCoords, esperadoCoords, `Centro ${i} - coordenadas esperadas ${esperadoCoords}, actual ${actualCoords}`);
  }
});
