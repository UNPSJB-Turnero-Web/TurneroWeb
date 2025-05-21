package unpsjb.labprog.backend.presenter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}