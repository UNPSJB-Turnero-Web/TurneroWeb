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
import unpsjb.labprog.backend.business.service.MedicoService;
import unpsjb.labprog.backend.config.AuditContext;
import unpsjb.labprog.backend.dto.MedicoDTO;

@RestController
@RequestMapping("medicos")
public class MedicoPresenter {

    @Autowired
    private MedicoService service;

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<MedicoDTO> medicos = service.findAll();
        return Response.ok(medicos, "Médicos recuperados correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(medico -> Response.ok(medico, "Médico recuperado correctamente"))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody MedicoDTO medicoDTO) {
        try {
            if (medicoDTO.getId() != null && medicoDTO.getId() != 0) {
                return Response.error(medicoDTO, "El médico no puede tener un ID definido al crearse.");
            }
            MedicoDTO saved = service.saveOrUpdate(medicoDTO);
            return Response.ok(saved, "Médico creado correctamente");
        } catch (IllegalArgumentException e) {           
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Integer id, @RequestBody MedicoDTO medicoDTO) {
        try {
            if (id == null || id <= 0) {
                return Response.error(medicoDTO, "Debe proporcionar un ID válido para actualizar.");
            }
            medicoDTO.setId(id);
            MedicoDTO updated = service.saveOrUpdate(medicoDTO);
            return Response.ok(updated, "Médico actualizado correctamente");
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == org.springframework.http.HttpStatus.CONFLICT) {
                return Response.dbError(e.getReason());
            }
            return Response.error(null, e.getReason());
        } catch (IllegalArgumentException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable("id") Integer id) {
        service.delete(id);
        return Response.ok("Médico " + id + " eliminado correctamente");
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<Object> findByMatricula(@PathVariable String matricula) {
        return service.findByMatricula(matricula)
                .map(medico -> Response.ok(medico, "Médico encontrado por matrícula"))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Object> findByEmail(@PathVariable String email) {
        return service.findByEmail(email)
                .map(medico -> Response.ok(medico, "Médico encontrado por email"))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ===============================
    // REGISTRO DE NUEVO MÉDICO
    // ===============================
    

    /**
     * Crear médico por ADMIN con auditoría
     * POST /medicos/create-by-admin
     */
    @PostMapping("/create-by-admin")
    public ResponseEntity<Object> createDoctorByAdmin(@RequestBody MedicoDTO request) {
        try {
            // Priorizar el performedBy del request, luego AuditContext, luego default
            String performedBy = request.getPerformedBy();
            if (performedBy == null || performedBy.trim().isEmpty()) {
                performedBy = AuditContext.getCurrentUser();
                if (performedBy == null || performedBy.trim().isEmpty()) {
                    performedBy = "ADMIN";
                }
            }
            request.setPerformedBy(performedBy);

            // Usar el service que ahora maneja la lógica de auditoría
            MedicoDTO saved = service.saveOrUpdate(request);
            return Response.ok(saved, "Médico creado correctamente por administrador");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al crear el médico: " + e.getMessage());
        }
    }

     @PostMapping("/create-by-operador")
    public ResponseEntity<Object> createDoctorByOperador(@RequestBody MedicoDTO request) {
        try {
            // Priorizar el performedBy del request, luego AuditContext, luego default
            String performedBy = request.getPerformedBy();
            if (performedBy == null || performedBy.trim().isEmpty()) {
                performedBy = AuditContext.getCurrentUser();
                if (performedBy == null || performedBy.trim().isEmpty()) {
                    performedBy = "OPERADOR";
                }
            }
            request.setPerformedBy(performedBy);

            // Usar el service que ahora maneja la lógica de auditoría
            MedicoDTO saved = service.saveOrUpdate(request);
            return Response.ok(saved, "Médico creado correctamente por operador");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al crear el médico: " + e.getMessage());
        }
    }
   
}