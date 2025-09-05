package unpsjb.labprog.backend.presenter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import unpsjb.labprog.backend.business.service.ObraSocialService;
import unpsjb.labprog.backend.business.service.PacienteService;
import unpsjb.labprog.backend.business.service.RegistrationService;
import unpsjb.labprog.backend.dto.ObraSocialDTO;
import unpsjb.labprog.backend.dto.PacienteDTO;
import unpsjb.labprog.backend.dto.PacienteRegistroDTO;
import unpsjb.labprog.backend.model.ObraSocial;
import unpsjb.labprog.backend.model.Paciente;

@RestController
@RequestMapping("pacientes")
public class PacientePresenter {

    @Autowired
    private PacienteService service;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private ObraSocialService obraSocialService;

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<PacienteDTO> pacientes = service.findAll();
        return Response.ok(pacientes, "Pacientes recuperados correctamente");
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

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateById(@PathVariable Integer id, @RequestBody PacienteDTO pacienteDTO) {
        try {
            // Asegurar que el ID del path coincida con el del DTO
            pacienteDTO.setId(id);
            PacienteDTO updated = service.saveOrUpdate(pacienteDTO);
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
            service.delete(id);
            return Response.ok(null, "Paciente eliminado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar el paciente: " + e.getMessage());
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

    @GetMapping("/dni/{dni}")
    public ResponseEntity<Object> findByDni(@PathVariable Integer dni) {
        return service.findByDni(dni)
                .map(paciente -> Response.ok(paciente, "Paciente encontrado por DNI"))
                .orElse(Response.notFound("Paciente con DNI " + dni + " no encontrado"));
    }

    // ===============================
    // REGISTRO DE NUEVO PACIENTE
    // ===============================
    
    /**
     * Registra un nuevo paciente en el sistema
     * POST /pacientes/register
     * 
     * Este endpoint se encarga específicamente del registro de pacientes,
     * usando el RegistrationService para coordinar la creación del usuario
     * y la entidad paciente.
     */
    @PostMapping("/register")
    public ResponseEntity<Object> registrarPaciente(@RequestBody PacienteRegistroDTO registroDTO) {
        try {
            // Verificar si el usuario ya existe
            if (registrationService.existsByEmail(registroDTO.getEmail())) {
                return Response.dbError(
                                       "Ya existe un usuario con el email: " + registroDTO.getEmail());
            }

            if (registrationService.existsByDni(registroDTO.getDni())) {
                return Response.dbError(
                                       "Ya existe un usuario con el DNI: " + registroDTO.getDni());
            }

            // Validar que la obra social existe (si se proporciona)
            ObraSocial obraSocial = null;
            if (registroDTO.getObraSocialId() != null) {
                ObraSocialDTO obraSocialDTO = obraSocialService.findById(registroDTO.getObraSocialId()).orElse(null);
                if (obraSocialDTO == null) {
                    return Response.error(null, 
                                           "No existe la obra social con ID: " + registroDTO.getObraSocialId());
                }
                
                // Crear objeto ObraSocial desde el DTO
                obraSocial = new ObraSocial();
                obraSocial.setId(obraSocialDTO.getId());
                obraSocial.setNombre(obraSocialDTO.getNombre());
                obraSocial.setDescripcion(obraSocialDTO.getDescripcion());
            }

            // Registrar el paciente usando la sobrecarga apropiada del RegistrationService
            Paciente pacienteRegistrado;
            if (registroDTO.getFechaNacimiento() == null && registroDTO.getObraSocialId() == null) {
                // Usar sobrecarga básica (sin fecha de nacimiento ni obra social)
                pacienteRegistrado = registrationService.registrarPaciente(
                    registroDTO.getEmail(),
                    registroDTO.getPassword(),
                    registroDTO.getDni(),
                    registroDTO.getNombre(),
                    registroDTO.getApellido(),
                    registroDTO.getTelefono()
                );
            } else {
                // Usar sobrecarga completa (con fecha de nacimiento y/o obra social)
                pacienteRegistrado = registrationService.registrarPaciente(
                    registroDTO.getEmail(),
                    registroDTO.getPassword(),
                    registroDTO.getDni(),
                    registroDTO.getNombre(),
                    registroDTO.getApellido(),
                    registroDTO.getTelefono(),
                    registroDTO.getFechaNacimiento(),
                    obraSocial
                );
            }
            
            // Convertir a DTO para la respuesta
            PacienteDTO pacienteDTO = service.findById(pacienteRegistrado.getId()).orElse(null);
            
            return Response.ok(pacienteDTO,
                                   "Paciente registrado exitosamente"
                                   );

        } catch (IllegalArgumentException e) {
            return Response.error(e, null);
        } catch (Exception e) {
            return Response.serverError( 
                                   "Error interno del servidor: " + e.getMessage());
        }
    }

}
