package unpsjb.labprog.backend.presenter;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import unpsjb.labprog.backend.business.service.EspecialidadService;
import unpsjb.labprog.backend.business.service.MedicoService;
import unpsjb.labprog.backend.business.service.RegistrationService;
import unpsjb.labprog.backend.config.AuditContext;
import unpsjb.labprog.backend.dto.EspecialidadDTO;
import unpsjb.labprog.backend.dto.MedicoDTO;

import unpsjb.labprog.backend.model.Especialidad;
import unpsjb.labprog.backend.model.Medico;

@RestController
@RequestMapping("medicos")
public class MedicoPresenter {

    @Autowired
    private MedicoService service;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private EspecialidadService especialidadService;

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
            String msg = e.getMessage();
            if (msg != null && (
                    msg.toLowerCase().contains("dni incorrecto") ||
                    msg.toLowerCase().contains("obligatorio") ||
                    msg.toLowerCase().contains("no existe") ||
                    msg.toLowerCase().contains("inválido") ||
                    msg.toLowerCase().contains("debe tener entre")
                )) {
                return Response.error(medicoDTO, msg);
            }
            return Response.dbError(msg);
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
    
    // ===============================
    // REGISTRO DE NUEVO MÉDICO
    // ===============================
    
    /**
     * Registra un nuevo médico en el sistema
     * POST /medicos/register
     * 
     * Este endpoint se encarga específicamente del registro de médicos,
     * usando el RegistrationService para coordinar la creación del usuario
     * y la entidad médico.
     */
    @PostMapping("/register")
    public ResponseEntity<Object> registrarMedico(@RequestBody MedicoDTO registroDTO) {
        try {
            // Verificar si el usuario ya existe
            if (registrationService.existsByEmail(registroDTO.getEmail())) {
                return Response.response(HttpStatus.CONFLICT, 
                                       "Ya existe un usuario con el email: " + registroDTO.getEmail(), 
                                       null);
            }

            if (registrationService.existsByDni(Long.parseLong(registroDTO.getDni()))) {
                return Response.response(HttpStatus.CONFLICT, 
                                       "Ya existe un usuario con el DNI: " + registroDTO.getDni(), 
                                       null);
            }

            // Validar que las especialidades existen y crear el conjunto
            Set<Especialidad> especialidades = new HashSet<>();
            if (registroDTO.getEspecialidadIds() == null || registroDTO.getEspecialidadIds().isEmpty()) {
                return Response.response(HttpStatus.BAD_REQUEST, 
                                       "Debe especificar al menos una especialidad", 
                                       null);
            }

            for (Integer especialidadId : registroDTO.getEspecialidadIds()) {
                EspecialidadDTO especialidadDTO = especialidadService.findById(especialidadId);
                if (especialidadDTO == null) {
                    return Response.response(HttpStatus.BAD_REQUEST, 
                                           "No existe la especialidad con ID: " + especialidadId, 
                                           null);
                }

                // Crear objeto Especialidad desde el DTO
                Especialidad especialidad = new Especialidad();
                especialidad.setId(especialidadDTO.getId());
                especialidad.setNombre(especialidadDTO.getNombre());
                especialidad.setDescripcion(especialidadDTO.getDescripcion());
                
                especialidades.add(especialidad);
            }

            // Registrar el médico usando el RegistrationService
            Medico medicoRegistrado = registrationService.registrarMedico(
                registroDTO.getEmail(),
                registroDTO.getPassword(),
                Long.parseLong(registroDTO.getDni()),
                registroDTO.getNombre(),
                registroDTO.getApellido(),
                registroDTO.getTelefono(),
                registroDTO.getMatricula(),
                especialidades
            );
            
            // Convertir a DTO para la respuesta
            MedicoDTO medicoDTO = service.findById(medicoRegistrado.getId()).orElse(null);
            
            return Response.response(HttpStatus.CREATED, 
                                   "Médico registrado exitosamente", 
                                   medicoDTO);

        } catch (IllegalArgumentException e) {
            return Response.response(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                                   "Error interno del servidor: " + e.getMessage(), 
                                   null);
        }
    }

    /**
     * Crear médico por ADMIN con auditoría
     * POST /medicos/create-by-admin
     */
    @PostMapping("/create-by-admin")
    public ResponseEntity<Object> createDoctorByAdmin(@RequestBody MedicoDTO request) {
        try {
            // Establecer performedBy para indicar que es creado por admin
            String performedBy = AuditContext.getCurrentUser();
            if (performedBy == null) {
                performedBy = request.getPerformedBy() != null ? request.getPerformedBy() : "ADMIN";
            }
            request.setPerformedBy(performedBy);

            // Usar el service que ahora maneja la lógica de auditoría
            MedicoDTO saved = service.saveOrUpdate(request);
            return Response.ok(saved, "Médico creado correctamente por administrador");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al crear el médico: " + e.getMessage());
        }
    }
   
}