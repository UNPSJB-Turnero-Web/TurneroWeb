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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.PacienteService;
import unpsjb.labprog.backend.dto.PacienteDTO;

@RestController
@RequestMapping("pacientes")
public class PacientePresenter {

    @Autowired
    private PacienteService service;

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<PacienteDTO> pacientes = service.findAll();
        return Response.ok(pacientes, "Pacientes recuperados correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(paciente -> Response.ok(paciente, "Paciente encontrado"))
                .orElse(Response.notFound("Paciente con id " + id + " no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody PacienteDTO pacienteDTO) {
        try {
            PacienteDTO saved = service.saveOrUpdate(pacienteDTO);
            return Response.ok(saved, "Paciente creado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al crear el paciente: " + e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody PacienteDTO pacienteDTO) {
        try {
            if (pacienteDTO.getId() <= 0) {
                return Response.error(null, "Debe proporcionar un ID válido para actualizar");
            }
            PacienteDTO updated = service.saveOrUpdate(pacienteDTO);
            return Response.ok(updated, "Paciente actualizado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar el paciente: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return Response.ok(null, "Paciente eliminado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar el paciente: " + e.getMessage());
        }
    }

    @GetMapping("/page")
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            return Response.ok(service.findByPage(page, size), "Pacientes paginados recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los pacientes paginados: " + e.getMessage());
        }
    }
}
