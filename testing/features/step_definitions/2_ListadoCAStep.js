const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

When('el usuario solicita la lista de centros de atención', function () {
  try {
        const res = request('GET', 'http://backend:8080/centrosAtencion/page?page=0&size=10');
    this.statusCode = res.statusCode;
    this.response = JSON.parse(res.getBody('utf8'));
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
    const centrosRespuesta = this.response.data.content;

    assert.strictEqual(centrosRespuesta.length, centrosEsperados.length, 'Cantidad de centros no coincide');

    for (let i = 0; i < centrosEsperados.length; i++) {
        const esperado = centrosEsperados[i];
        const actual = centrosRespuesta[i];

        assert.strictEqual(actual.name, esperado.Nombre, `Centro ${i} - name esperado ${esperado.Nombre}, actual ${actual.name}`);
        assert.strictEqual(actual.direccion, esperado.Direccion, `Centro ${i} - direccion esperada ${esperado.Direccion}, actual ${actual.direccion}`);
        assert.strictEqual(actual.localidad, esperado.Localidad, `Centro ${i} - localidad esperada ${esperado.Localidad}, actual ${actual.localidad}`);
        assert.strictEqual(actual.provincia, esperado.Provincia, `Centro ${i} - provincia esperada ${esperado.Provincia}, actual ${actual.provincia}`);

        const coordsActual = `${actual.latitud.toFixed(3)}, ${actual.longitud.toFixed(3)}`;
        assert.strictEqual(coordsActual, esperado.Coordenadas, `Centro ${i} - coordenadas esperadas ${esperado.Coordenadas}, actual ${coordsActual}`);
    }
});
