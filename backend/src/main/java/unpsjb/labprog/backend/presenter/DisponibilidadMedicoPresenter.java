package unpsjb.labprog.backend.presenter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.DisponibilidadMedicoService;
import unpsjb.labprog.backend.dto.DisponibilidadMedicoDTO;

@RestController
@RequestMapping("/disponibilidades-medico")
public class DisponibilidadMedicoPresenter {

    @Autowired
    private DisponibilidadMedicoService service;

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<DisponibilidadMedicoDTO> disponibilidades = service.findAll();
        return Response.ok(disponibilidades, "Disponibilidades recuperadas correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(disponibilidad -> Response.ok(disponibilidad, "Disponibilidad encontrada"))
                .orElse(Response.notFound("Disponibilidad con id " + id + " no encontrada"));
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody DisponibilidadMedicoDTO disponibilidadDTO) {
        try {
            DisponibilidadMedicoDTO saved = service.saveOrUpdate(disponibilidadDTO);
            return Response.ok(saved, "Disponibilidad creada correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al crear la disponibilidad: " + e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody DisponibilidadMedicoDTO disponibilidadDTO) {
        try {
            if (disponibilidadDTO.getId() == null || disponibilidadDTO.getId() <= 0) {
                return Response.error(null, "Debe proporcionar un ID válido para actualizar");
            }
            DisponibilidadMedicoDTO updated = service.saveOrUpdate(disponibilidadDTO);
            return Response.ok(updated, "Disponibilidad actualizada correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar la disponibilidad: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return Response.ok(null, "Disponibilidad eliminada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar la disponibilidad: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(
            @PathVariable Long id,
            @RequestBody DisponibilidadMedicoDTO dto) {
        try {
            dto.setId(id); // Set the ID in the DTO
            DisponibilidadMedicoDTO updated = service.saveOrUpdate(dto);
            return Response.ok(updated, "Disponibilidad actualizada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar la disponibilidad: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageResult = service.findByPage(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());

        return Response.ok(response);
    }

    @PostMapping("/reset")
    public ResponseEntity<Object> reset() {
        try {
            service.deleteAll();
            return Response.ok(null, "Todas las disponibilidades fueron eliminadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al resetear las disponibilidades: " + e.getMessage());
        }
    }
}