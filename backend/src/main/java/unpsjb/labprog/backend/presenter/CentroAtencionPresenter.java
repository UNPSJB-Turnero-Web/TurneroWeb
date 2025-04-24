package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.CentroAtencionService;
import unpsjb.labprog.backend.model.CentroAtencion;

@RestController
@RequestMapping("centros")
public class CentroAtencionPresenter {

    private static final Logger logger = LoggerFactory.getLogger(CentroAtencionPresenter.class);

    @Autowired
    CentroAtencionService service;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        logger.info("GET /centros - Buscar todos los centros");
        return Response.ok(service.findAll());
    }

    @RequestMapping(value = "/id/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") int id) {
        logger.info("GET /centros/id/{} - Buscar centro por id", id);
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
            map.put("coordenadas", centro.getLatitud() + ", " + centro.getLongitud());
            return map;
        }).collect(Collectors.toList());
    
        return Response.ok(dtoList, "OK");
    }
    

    @RequestMapping(value = "/search/{term}", method = RequestMethod.GET)
    public ResponseEntity<Object> search(@PathVariable("term") String term) {
        logger.info("GET /centros/search/{} - Buscar centros", term);
        return Response.ok(service.search(term));
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody CentroAtencion centro) {
        logger.info("POST /centros - Crear centro: {}", centro);

        if (centro.getId() != 0) {
            logger.warn("Intento de crear centro con id definido: {}", centro.getId());
            return Response.error(centro, "Está intentando crear un centro de atención. Este no puede tener un id definido.");
        }

        // Validación manual antes de ir al Service
        if (centro.getName() == null || centro.getName().isBlank()) {
            logger.warn("Validación fallida: nombre vacío");
            return Response.error(null, "El nombre es requerido");
        }
        if (centro.getDireccion() == null || centro.getDireccion().isBlank()) {
            logger.warn("Validación fallida: dirección vacía");
            return Response.error(null, "La dirección es requerida");
        }
        if (centro.getLatitud() == null || centro.getLongitud() == null || centro.getLatitud().isNaN() || centro.getLongitud().isNaN()) {
            logger.warn("Validación fallida: coordenadas inválidas");
            return Response.error(null, "Las coordenadas son inválidas");
        }

        try {
            CentroAtencion saved = service.save(centro);
            logger.info("Centro guardado exitosamente: {}", saved);
            return Response.ok(saved, "Centro de atención creado");
        } catch (IllegalStateException e) {
            logger.error("Error de validación: {}", e.getMessage());
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            logger.error("Error inesperado: {}", e.getMessage(), e);
            return Response.error(null, e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody CentroAtencion centro) {
        logger.info("PUT /centros - Actualizar centro: {}", centro);

        if (centro.getId() == 0) {
            logger.warn("Intento de actualizar centro sin id válido");
            return Response.error(centro, "Debe tener un id válido (> 0) para actualizar.");
        }
        try {
            CentroAtencion saved = service.save(centro);
            logger.info("Centro actualizado exitosamente: {}", saved);
            return Response.ok(saved, "Centro de atención actualizado");
        } catch (Exception e) {
            logger.error("Error al actualizar: {}", e.getMessage(), e);
            return Response.error(centro, e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") int id) {
        logger.info("DELETE /centros/{} - Eliminar centro", id);
        try {
            service.delete(id);
            logger.info("Centro {} eliminado", id);
            return Response.ok("Centro de atención " + id + " borrado con éxito.");
        } catch (Exception e) {
            logger.error("Error al eliminar centro {}: {}", id, e.getMessage(), e);
            return Response.dbError(e.getMessage());
        }
    }

    @RequestMapping(value = "/reset", method = RequestMethod.DELETE)
    public ResponseEntity<Object> resetCentros() {
        logger.warn("DELETE /centros/reset - Eliminando todos los centros");
        service.findAll().forEach(c -> service.delete(c.getId()));
        return Response.ok("Reset completo.");
    }
}
