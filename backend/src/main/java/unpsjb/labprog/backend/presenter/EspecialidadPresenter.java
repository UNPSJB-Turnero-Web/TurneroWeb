package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.EspecialidadService;
import unpsjb.labprog.backend.model.Especialidad;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("especialidad")
public class EspecialidadPresenter {

    @Autowired
    EspecialidadService service;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        Map<String, Object> response = new HashMap<>();
        response.put("status_code", 200);
        response.put("status_text", "Especialidades recuperadas correctamente");

        // Asegúrate de que cada especialidad incluya el campo "descripcion"
        List<Especialidad> especialidades = service.findAll();
        List<Map<String, Object>> data = especialidades.stream().map(especialidad -> {
            Map<String, Object> especialidadMap = new HashMap<>();
            especialidadMap.put("id", especialidad.getId());
            especialidadMap.put("nombre", especialidad.getNombre());
            return especialidadMap;
        }).toList();

        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") int id) {
        Especialidad especialidad = service.findById(id);
        if (especialidad != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("status_code", 200);
            response.put("status_text", "Especialidad encontrada");
            response.put("data", Map.of(
                "id", especialidad.getId(),
                "nombre", especialidad.getNombre()
            ));
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("status_code", 404);
            response.put("status_text", "Especialidad no encontrada");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody Especialidad especialidad) {
        try {
            Especialidad saved = service.save(especialidad);
            Map<String, Object> response = new HashMap<>();
            response.put("status_code", 200);
            response.put("status_text", "Especialidad creada correctamente");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status_code", 409);
            errorResponse.put("status_text", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@PathVariable("id") int id, @RequestBody Especialidad especialidad) {
        try {
            especialidad.setId(id); // Asegúrate de que el ID se establezca correctamente
            Especialidad saved = service.save(especialidad);
            Map<String, Object> response = new HashMap<>();
            response.put("status_code", 200);
            response.put("status_text", "Especialidad editada exitosamente");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status_code", 409);
            errorResponse.put("status_text", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        response.put("status_code", 200);
        response.put("status_text", "Página de especialidades recuperada correctamente");
        response.put("data", service.findByPage(page, size));
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") int id) {
        service.delete(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status_code", 200);
        response.put("status_text", "Especialidad eliminada exitosamente");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/reset", method = RequestMethod.DELETE)
    public ResponseEntity<Object> reset() {
        try {
            service.deleteAll();
            Map<String, Object> response = new HashMap<>();
            response.put("status_code", 200);
            response.put("status_text", "Base de datos de especialidades reseteada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status_code", 500);
            errorResponse.put("status_text", "Error al resetear la base de datos de especialidades: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
