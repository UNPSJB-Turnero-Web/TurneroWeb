package unpsjb.labprog.backend.presenter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.EspecialidadService;
import unpsjb.labprog.backend.dto.EspecialidadDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("especialidad")
public class EspecialidadPresenter {

    @Autowired
    EspecialidadService service;

    @Autowired
    ObjectMapper mapper;

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<EspecialidadDTO> especialidades = service.findAll();
        return Response.ok(especialidades, "Especialidades recuperadas correctamente");
    }

    @GetMapping("/page")
    public ResponseEntity<Object> getByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageResult = service.findByPage(page, size);

            // Crear la respuesta con los metadatos de paginación
            var response = Map.of(
                    "content", pageResult.getContent(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements(),
                    "currentPage", pageResult.getNumber()
            );

            return Response.ok(response, "Especialidades paginadas recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las especialidades paginadas: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody JsonNode json) {
        try {
            // Convertir el JSON a DTO
            EspecialidadDTO dto = mapper.treeToValue(json, EspecialidadDTO.class);

            // Guardar la especialidad
            EspecialidadDTO saved = service.save(dto);
            return Response.ok(saved, "Especialidad creada correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage()); // Devuelve status_code 409
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage()); // Devuelve status_code 400
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable int id, @RequestBody JsonNode json) {
        try {
            // Convertir el JSON a DTO
            EspecialidadDTO dto = mapper.treeToValue(json, EspecialidadDTO.class);
            dto.setId(id); // Asegurarse de que el ID coincide con el de la URL

            // Actualizar la especialidad
            EspecialidadDTO updated = service.save(dto);
            return Response.ok(updated, "Especialidad editada exitosamente");
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
            return Response.ok(null, "Especialidad eliminada exitosamente");
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
            return Response.ok(null, "Base de datos de especialidades reseteada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al resetear la base de datos: " + e.getMessage());
        }
    }
}
