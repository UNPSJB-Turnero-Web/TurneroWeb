package unpsjb.labprog.backend.presenter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.EspecialidadService;
import unpsjb.labprog.backend.model.Especialidad;

@RestController
@RequestMapping("especialidad")
public class EspecialidadPresenter {

    @Autowired
    EspecialidadService service;

    @Autowired
    ObjectMapper mapper;

    @GetMapping
    public ResponseEntity<Object> getAll() {
        return Response.ok(service.findAll(), "Especialidades recuperadas correctamente");
    }

    @GetMapping("/page")
    public ResponseEntity<Object> getByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            return Response.ok(service.findByPage(page, size), "Especialidades paginadas recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las especialidades paginadas: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody JsonNode json) {
        try {
            Especialidad esp = mapper.treeToValue(json, Especialidad.class);
            if (esp.getId() != 0) {
                return Response.error(null, "No se debe enviar un ID al crear una especialidad");
            }
            return Response.ok(service.save(esp), "Especialidad creada correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage()); // Devuelve status_code 409
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage()); // Devuelve status_code 400
        }
    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody JsonNode json) {
        try {
            Especialidad esp = mapper.treeToValue(json, Especialidad.class);
            if (esp.getId() <= 0) {
                return Response.error(null, "Debe enviar un ID válido");
            }
            return Response.ok(service.save(esp), "Especialidad editada exitosamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage()); // Devuelve status_code 409
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage()); // Devuelve status_code 400
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable int id) {
        try {
            service.delete(id);
            return Response.ok("Especialidad eliminada exitosamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Object> reset() {
        try {
            service.deleteAll();
            return Response.ok("Base de datos de especialidades reseteada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al resetear la base de datos: " + e.getMessage());
        }
    }
}
