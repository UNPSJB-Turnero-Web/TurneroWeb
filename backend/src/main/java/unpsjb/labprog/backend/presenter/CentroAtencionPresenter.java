package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.CentroAtencionService;
import unpsjb.labprog.backend.model.CentroAtencion;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("centros")
public class CentroAtencionPresenter {

    private static final Logger logger = LoggerFactory.getLogger(CentroAtencionPresenter.class);

    @Autowired
    CentroAtencionService service;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        List<CentroAtencion> centros = service.findAll();
        List<Map<String, Object>> dtoList = centros.stream().map(centro -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", centro.getId());
            map.put("name", centro.getName());
            map.put("direccion", centro.getDireccion());
            map.put("localidad", centro.getLocalidad());
            map.put("provincia", centro.getProvincia());
            map.put("coordenadas", String.format("%.3f, %.3f", centro.getLatitud(), centro.getLongitud()));
            return map;
        }).collect(Collectors.toList());

        return Response.ok(dtoList, "OK");
    }

    @RequestMapping(value = "/id/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") int id) {
        CentroAtencion centro = service.findById(id);
        return (centro != null)
                ? Response.ok(centro)
                : Response.notFound("Centro de atención id " + id + " no encontrado");
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<CentroAtencion> centrosPage = service.findByPage(page, size);
        List<Map<String, Object>> dtoList = centrosPage.getContent().stream().map(centro -> {
            Map<String, Object> map = new HashMap<>();
            map.put("nombre", centro.getName());
            map.put("direccion", centro.getDireccion());
            map.put("localidad", centro.getLocalidad());
            map.put("provincia", centro.getProvincia());
            map.put("coordenadas", String.format("%.3f, %.3f", centro.getLatitud(), centro.getLongitud()));
            return map;
        }).collect(Collectors.toList());

        return Response.ok(dtoList, "OK");
    }

    @RequestMapping(value = "/search/{term}", method = RequestMethod.GET)
    public ResponseEntity<Object> search(@PathVariable("term") String term) {
        return Response.ok(service.search(term));
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody Map<String, Object> payload) {
        try {
            CentroAtencion centro = buildCentro(payload, false);
            validarConflictos(centro);
            CentroAtencion saved = service.save(centro);
            return Response.ok(saved, "Centro de atención creado");
        } catch (IllegalStateException e) {
            return manejarErrorDeNegocio(e);
        } catch (Exception e) {
            return Response.error(HttpStatus.INTERNAL_SERVER_ERROR, null, e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody Map<String, Object> payload) {
        try {
            CentroAtencion centro = buildCentro(payload, true);
            validarConflictos(centro);
            CentroAtencion saved = service.save(centro);
            return Response.ok(saved, "Centro de atención modificado");
        } catch (IllegalStateException e) {
            return manejarErrorDeNegocio(e);
        } catch (Exception e) {
            return Response.error(HttpStatus.INTERNAL_SERVER_ERROR, null, e.getMessage());
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

    private CentroAtencion buildCentro(Map<String, Object> payload, boolean isUpdate) {
        CentroAtencion centro = new CentroAtencion();
        if (isUpdate) {
            centro.setId((Integer) payload.get("id"));
        }
        centro.setName((String) payload.get("name"));
        centro.setDireccion((String) payload.get("direccion"));
        centro.setLocalidad((String) payload.get("localidad"));
        centro.setProvincia((String) payload.get("provincia"));

        String coordenadas = (String) payload.get("coordenadas");
        if (coordenadas == null || coordenadas.isBlank()) {
            throw new IllegalStateException("Las coordenadas son requeridas");
        }
        try {
            String[] parts = coordenadas.split(",");
            centro.setLatitud(Double.parseDouble(parts[0].trim()));
            centro.setLongitud(Double.parseDouble(parts[1].trim()));
        } catch (Exception e) {
            throw new IllegalStateException("Las coordenadas son inválidas");
        }

        if (centro.getName() == null || centro.getName().isBlank()) {
            throw new IllegalStateException("El nombre es requerido");
        }
        if (centro.getDireccion() == null || centro.getDireccion().isBlank()) {
            throw new IllegalStateException("La dirección es requerida");
        }

        return centro;
    }

    private void validarConflictos(CentroAtencion centro) {
        List<CentroAtencion> existentes = service.findAll();
        for (CentroAtencion existente : existentes) {
            if (existente.getId() != centro.getId()) {
                if (existente.getDireccion().equalsIgnoreCase(centro.getDireccion())) {
                    throw new IllegalStateException("Ya existe un centro de atención con esa dirección");
                }
                if (existente.getName().equalsIgnoreCase(centro.getName()) && existente.getDireccion().equalsIgnoreCase(centro.getDireccion())) {
                    throw new IllegalStateException("Ya existe un centro de atención con ese nombre y dirección");
                }
            }
        }
    }

    private ResponseEntity<Object> manejarErrorDeNegocio(IllegalStateException e) {
        String msg = e.getMessage();
        if (msg.contains("Ya existe un centro de atención con ese nombre y dirección")) {
            return Response.error(HttpStatus.CONFLICT, null, msg);
        } else if (msg.contains("Ya existe un centro de atención con esa dirección")) {
            return Response.error(HttpStatus.CONFLICT, null, msg);
        } else if (msg.contains("Las coordenadas son inválidas") || msg.contains("El nombre es requerido") || msg.contains("La dirección es requerida")) {
            return Response.error(HttpStatus.BAD_REQUEST, null, msg);
        } else {
            return Response.error(HttpStatus.BAD_REQUEST, null, msg);
        }
    }
}