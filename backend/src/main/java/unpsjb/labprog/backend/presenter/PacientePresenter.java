package unpsjb.labprog.backend.presenter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.PacienteService;
import unpsjb.labprog.backend.business.service.UserService;
import unpsjb.labprog.backend.config.AuditContext;
import unpsjb.labprog.backend.dto.CompleteProfileDTO;
import unpsjb.labprog.backend.dto.PacienteDTO;
import unpsjb.labprog.backend.model.User;

@RestController
@RequestMapping("pacientes")
public class PacientePresenter {

    @Autowired
    private PacienteService service;

    @Autowired
    private UserService userService;



    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<PacienteDTO> pacientes = service.findAll();
        return Response.ok(pacientes, "Pacientes recuperados correctamente");
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nombreApellido,
            @RequestParam(required = false) String documento,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Page<PacienteDTO> pageResult = service.findByPage(page, size, nombreApellido, documento, email, sortBy, sortDir);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());

        return Response.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable Integer id) {
        return service.findById(id)
                .map(paciente -> Response.ok(paciente, "Paciente encontrado"))
                .orElse(Response.notFound("Paciente con id " + id + " no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody PacienteDTO pacienteDTO) {
        try {
            String performedBy = AuditContext.getCurrentUser();
            PacienteDTO saved = service.saveOrUpdate(pacienteDTO, performedBy);
            return Response.ok(saved, "Paciente creado correctamente");
        } catch (IllegalStateException | IllegalArgumentException e) {
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
            String performedBy = AuditContext.getCurrentUser();
            PacienteDTO updated = service.saveOrUpdate(pacienteDTO, performedBy);
            return Response.ok(updated, "Paciente actualizado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar el paciente: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateById(@PathVariable Integer id, @RequestBody PacienteDTO pacienteDTO) {
        try {
            // Asegurar que el ID del path coincida con el del DTO
            pacienteDTO.setId(id);
            String performedBy = AuditContext.getCurrentUser();
            PacienteDTO updated = service.saveOrUpdate(pacienteDTO, performedBy);
            return Response.ok(updated, "Paciente actualizado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar el paciente: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Integer id) {
        try {
            String performedBy = AuditContext.getCurrentUser();
            service.delete(id, performedBy);
            return Response.ok(null, "Paciente eliminado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar el paciente: " + e.getMessage());
        }
    }


    @GetMapping("/dni/{dni}")
    public ResponseEntity<Object> findByDni(@PathVariable Integer dni) {
        return service.findByDni(dni)
                .map(paciente -> Response.ok(paciente, "Paciente encontrado por DNI"))
                .orElse(Response.notFound("Paciente con DNI " + dni + " no encontrado"));
    }

    /**
     * Endpoint para obtener el ID del paciente por email
     * GET /pacientes/by-email/{email}
     */
    @GetMapping("/by-email/{email}")
    public ResponseEntity<Object> findByEmail(@PathVariable String email) {
        return service.findByEmail(email)
                .map(paciente -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("pacienteId", paciente.getId());
                    response.put("nombre", paciente.getNombre());
                    response.put("apellido", paciente.getApellido());
                    response.put("email", paciente.getEmail());
                    return Response.ok(response, "Paciente encontrado por email");
                })
                .orElse(Response.notFound("Paciente con email " + email + " no encontrado"));
    }

    /**
     * Crear paciente por ADMIN/OPERADOR con auditoría
     * POST /pacientes/create-by-admin
     */
    @PostMapping("/create-by-admin")
    public ResponseEntity<Object> createPatientByAdmin(@RequestBody PacienteDTO request) {
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
            PacienteDTO saved = service.saveOrUpdate(request, performedBy);
            return Response.ok(saved, "Paciente creado correctamente por administrador");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al crear el paciente: " + e.getMessage());
        }
    }

    /**
     * Crear paciente por OPERADOR con auditoría
     * POST /pacientes/create-by-operator
     */
    @PostMapping("/create-by-operator")
    public ResponseEntity<Object> createPatientByOperator(@RequestBody PacienteDTO request) {
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
           PacienteDTO saved = service.saveOrUpdate(request, performedBy);
            return Response.ok(saved, "Paciente creado correctamente por operador");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al crear el paciente: " + e.getMessage());
        }
    }

    /**
     * Endpoint para sincronización automática de usuarios multi-rol en tabla pacientes.
     * 
     * Este endpoint garantiza que el usuario autenticado tenga un registro correspondiente
     * en la tabla pacientes, permitiendo operar en el dashboard de pacientes.
     * 
     * Se invoca automáticamente desde el frontend tras login exitoso o antes de acceder
     * al dashboard de pacientes para usuarios con roles MEDICO, OPERADOR o ADMINISTRADOR.
     * 
     * Características:
     * - Idempotente: puede llamarse múltiples veces sin crear duplicados
     * - Busca por DNI o email del usuario autenticado
     * - Crea registro solo si no existe
     * - Retorna el pacienteId correspondiente
     * 
     * GET /pacientes/sync-current-user
     * 
     * @return ResponseEntity con pacienteId y datos básicos del paciente
     */
    @GetMapping("/sync-current-user")
    public ResponseEntity<Object> syncCurrentUserAsPaciente() {
        try {
            // Obtener el email del usuario autenticado desde el contexto de auditoría
            String currentUserEmail = AuditContext.getCurrentUser();
            
            if (currentUserEmail == null || currentUserEmail.trim().isEmpty()) {
                return Response.error(null, "No se pudo identificar al usuario autenticado");
            }
            
            // Buscar el usuario completo para obtener todos sus datos
            User user = userService.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado en el sistema: " + currentUserEmail));

            // Ejecutar sincronización
            PacienteDTO pacienteDTO = service.ensurePacienteExistsForUser(user);

            // Preparar respuesta con datos relevantes
            Map<String, Object> response = new HashMap<>();
            response.put("pacienteId", pacienteDTO.getId());
            response.put("nombre", pacienteDTO.getNombre());
            response.put("apellido", pacienteDTO.getApellido());
            response.put("email", pacienteDTO.getEmail());
            response.put("dni", pacienteDTO.getDni());
            response.put("sincronizado", true);

            return Response.ok(response, "Sincronización completada exitosamente");

        } catch (IllegalArgumentException e) {
            return Response.error(null, "Error de validación: " + e.getMessage());
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error en sincronización de paciente: " + e.getMessage());
        }
    }

    /**
     * Endpoint para completar el perfil de usuarios registrados con Google
     * PUT /pacientes/me/complete-profile
     * 
     * Permite al usuario autenticado completar su perfil con DNI, teléfono y fecha de nacimiento
     * Solo puede ser llamado por el propio usuario autenticado
     * 
     * @param dto Datos del perfil a completar
     * @param authentication Contexto de autenticación Spring Security
     * @return ResponseEntity con el resultado de la operación
     */
    @PutMapping("/me/complete-profile")
    public ResponseEntity<Object> completeProfile(
            @RequestBody CompleteProfileDTO dto, 
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            service.completeGoogleUserProfile(userEmail, dto);
            return Response.ok(null, "Perfil completado con éxito");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al completar el perfil: " + e.getMessage());
        }
    }

}


