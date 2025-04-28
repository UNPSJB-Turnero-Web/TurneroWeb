const { Before, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('sync-request');

// Este Before se ejecuta antes de CADA escenario
/*Before(function () {
  const res = request('DELETE', 'http://backend:8080/centros/reset');
  if (res.statusCode !== 200) {
      throw new Error('No se pudo resetear la base');
  }
  console.log('Base de datos reseteada correctamente.');
});*/


When(
  'el administrador ingresa los datos del centro de atención: {string}, {string}, {string}, {string} y {string}',
  function (nombre, direccion, localidad, provincia, coordenadas) {

    let lat = null, lng = null;

    if (coordenadas && coordenadas.trim() !== "") {
      const coords = coordenadas.split(',');
      lat = parseFloat(coords[0].trim());
      lng = parseFloat(coords[1].trim());

      if (isNaN(lat)) lat = null;
      if (isNaN(lng)) lng = null;
    }

    const centroData = {
      name: nombre || null,
      direccion: direccion || null,
      localidad: localidad || null,
      provincia: provincia || null,
      latitud: lat,
      longitud: lng
    };

    console.log("CentroData que se envía:", centroData);

    try {
      const res = request('POST', 'http://localhost:8080/centros', { json: centroData });

      this.response = JSON.parse(res.getBody('utf8'));
      console.log("Respuesta recibida:", this.response);

      this.statusCode = res.statusCode;
    } catch (error) {
      if (error.statusCode) {
        this.statusCode = error.statusCode;
        const bodyString = error.response && error.response.body && error.response.body.toString('utf8');
        console.log("Error recibido body:", bodyString);
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

    // Validación de HTTP (siempre 200 por tu diseño)
    //assert.strictEqual(statusHTTP, 200, `Esperado HTTP 200 pero fue ${statusHTTP}`);

    // Validación de status_code y status_text según tu Response.java modificado
    assert.strictEqual(respuesta.status_code, statusEsperado, `Esperado status_code ${statusEsperado} pero fue ${respuesta.status_code}`);
    assert.strictEqual(respuesta.status_text.trim(), mensajeEsperado.replace(/"/g, '').trim(),
        `Esperado status_text "${mensajeEsperado}" pero fue "${respuesta.status_text}"`);
});