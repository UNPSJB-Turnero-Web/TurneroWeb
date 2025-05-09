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

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody JsonNode json) {
        try {
            Especialidad especialidad = mapper.treeToValue(json, Especialidad.class);
            if (especialidad.getId() != 0) {
                return Response.error(null, "No se debe enviar un ID al crear una especialidad");
            }
            return Response.ok(service.save(especialidad), "Especialidad creada correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable int id, @RequestBody JsonNode json) {
        try {
            Especialidad especialidad = mapper.treeToValue(json, Especialidad.class);
            if (id <= 0) {
                return Response.error(null, "Debe enviar un ID válido");
            }
            especialidad.setId(id);
            return Response.ok(service.save(especialidad), "Especialidad editada exitosamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable int id) {
        try {
            service.delete(id);
            return Response.ok("Especialidad eliminada exitosamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
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
