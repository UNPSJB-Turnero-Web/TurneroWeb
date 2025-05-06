package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.CentroAtencionService;
import unpsjb.labprog.backend.model.CentroAtencion;

import java.util.List;
import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("centros")
public class CentroAtencionPresenter {

    @Autowired
    CentroAtencionService service;

    @RequestMapping(method = RequestMethod.GET)
public ResponseEntity<Object> findAll() {
    List<CentroAtencion> centros = service.findAll();

    List<Map<String, Object>> centrosMapeados = centros.stream().map(c -> {
        // Map automático con ObjectMapper
        Map<String, Object> map = objectMapper.convertValue(c, Map.class);

        // Agregar el campo coordenadas combinando latitud y longitud
        if (c.getLatitud() != null && c.getLongitud() != null) {
            map.put("coordenadas", c.getLatitud() + ", " + c.getLongitud());
        } else {
            map.put("coordenadas", null);
        }
        
        return map;
    }).toList();

    return Response.ok(centrosMapeados);
}


@RequestMapping(value = "/id/{id}", method = RequestMethod.GET)
public ResponseEntity<Object> findById(@PathVariable("id") int id) {
    CentroAtencion c = service.findById(id);
    if (c == null) {
        return Response.notFound("Centro de atención id " + id + " no encontrado");
    }

    Map<String, Object> map = objectMapper.convertValue(c, Map.class);
    if (c.getLatitud() != null && c.getLongitud() != null) {
        map.put("coordenadas", c.getLatitud() + ", " + c.getLongitud());
    } else {
        map.put("coordenadas", null);
    }

    return Response.ok(map);
}


    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Response.ok(service.findByPage(page, size));
    }

    @RequestMapping(value = "/search/{term}", method = RequestMethod.GET)
    public ResponseEntity<Object> search(@PathVariable("term") String term) {
        return Response.ok(service.search(term));
    }

    @Autowired
    private ObjectMapper objectMapper;
    
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody JsonNode json) {
        try {
            // Mapeo automático
            CentroAtencion centro = objectMapper.treeToValue(json, CentroAtencion.class);
    
            // ❗ 1. Validación: NO debe tener id
            if (centro.getId() != 0) {
                return Response.error(centro, "Está intentando crear un centro de atención. Este no puede tener un id definido.");
            }
    
            // ❗ 2. Procesar coordenadas si faltan latitud y longitud
            if ((centro.getLatitud() == null || centro.getLongitud() == null) && json.has("coordenadas")) {
                String coordenadas = json.get("coordenadas").asText();
                if (coordenadas != null && !coordenadas.isBlank()) {
                    String[] parts = coordenadas.split(",");
                    if (parts.length == 2) {
                        try {
                            Double lat = Double.parseDouble(parts[0].trim());
                            Double lng = Double.parseDouble(parts[1].trim());
                            centro.setLatitud(lat);
                            centro.setLongitud(lng);
                        } catch (NumberFormatException e) {
                            return Response.error(null, "Las coordenadas son inválidas");
                        }
                    } else {
                        return Response.error(null, "Las coordenadas deben tener formato 'latitud, longitud'");
                    }
                }
            }
    
            // ❗ 3. Validaciones obligatorias finales
            if (centro.getName() == null || centro.getName().isBlank()) {
                return Response.error(null, "El nombre es requerido");
            }
            if (centro.getDireccion() == null || centro.getDireccion().isBlank()) {
                return Response.error(null, "La dirección es requerida");
            }
            if (centro.getLatitud() == null || centro.getLongitud() == null) {
                return Response.error(null, "Las coordenadas son inválidas");
            }
    
            // 4. Guardar
            CentroAtencion saved = service.save(centro);
            return Response.ok(saved, "Centro de atención creado");
    
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        }
        catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
        
    }
    


    @RequestMapping(method = RequestMethod.PUT)
public ResponseEntity<Object> update(@RequestBody JsonNode json) {
    try {
        CentroAtencion centro = objectMapper.treeToValue(json, CentroAtencion.class);

        if (centro.getId() <= 0) {
            return Response.error(centro, "Debe tener un id válido (> 0) para actualizar.");
        }

        // Procesar coordenadas si faltan latitud y longitud
        if ((centro.getLatitud() == null || centro.getLongitud() == null) && json.has("coordenadas")) {
            String coordenadas = json.get("coordenadas").asText();
            if (coordenadas != null && !coordenadas.isBlank()) {
                String[] parts = coordenadas.split(",");
                if (parts.length == 2) {
                    try {
                        Double lat = Double.parseDouble(parts[0].trim());
                        Double lng = Double.parseDouble(parts[1].trim());
                        centro.setLatitud(lat);
                        centro.setLongitud(lng);
                    } catch (NumberFormatException e) {
                        return Response.error(null, "Las coordenadas son inválidas");
                    }
                } else {
                    return Response.error(null, "Las coordenadas deben tener formato 'latitud, longitud'");
                }
            }
        }

        CentroAtencion saved = service.save(centro);
        return Response.ok(saved, "Centro de atención modificado");

    } catch (IllegalStateException e) {
        return Response.dbError(e.getMessage());
    }
    catch (Exception e) {
        return Response.error(null, e.getMessage());
    }
}


    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") int id) {
        try {
            service.delete(id);
            return Response.ok("Centro de atención " + id + " borrado con éxito.");
        } catch (Exception e) {
            return Response.dbError(e.getMessage());
        }
    }

    @RequestMapping(value = "/reset", method = RequestMethod.DELETE)
public ResponseEntity<Object> resetCentros() {
    service.findAll().forEach(c -> service.delete(c.getId()));
    return Response.ok("Reset completo.");
}

}
