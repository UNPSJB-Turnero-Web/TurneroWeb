package unpsjb.labprog.backend.presenter;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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

import jakarta.servlet.http.HttpServletRequest;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.TurnoService;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.dto.TurnoFilterDTO;
import unpsjb.labprog.backend.model.AuditLog;

@RestController
@RequestMapping("turno")
public class TurnoPresenter {

    @Autowired
    private TurnoService service;

    // Método auxiliar para auditoría
    private String getCurrentUser(HttpServletRequest request) {
        // TODO: Implementar extracción de usuario desde JWT o sesión
        // Por ahora retorna un valor por defecto
        String user = request.getHeader("X-User-ID");
        return user != null ? user : "ADMIN";
    }

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<TurnoDTO> turnos = service.findAll();
        return Response.ok(turnos, "Turnos recuperados correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(turno -> Response.ok(turno, "Turno recuperado correctamente"))
                .orElse(Response.notFound("Turno no encontrado"));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Object> getByPacienteId(@PathVariable Integer pacienteId) {
        List<TurnoDTO> turnos = service.findByPacienteId(pacienteId);
        return Response.ok(turnos, "Turnos del paciente recuperados correctamente");
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody TurnoDTO turnoDTO) {
        TurnoDTO saved = service.save(turnoDTO);
        return Response.ok(saved, "Turno creado correctamente");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Integer id, @RequestBody TurnoDTO turnoDTO) {
        turnoDTO.setId(id);
        TurnoDTO updated = service.save(turnoDTO);
        return Response.ok(updated, "Turno actualizado correctamente");
    }

     @GetMapping("/page")
    public ResponseEntity<Object> getByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageResult = service.findByPage(page, size);

            var response = Map.of(
                    "content", pageResult.getContent(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements(),
                    "number", pageResult.getNumber(),
                    "size", pageResult.getSize(),
                    "first", pageResult.isFirst(),
                    "last", pageResult.isLast(),
                    "numberOfElements", pageResult.getNumberOfElements());

            return Response.ok(response, "Staff médico paginado recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el staff médico paginado: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Integer id) {
        service.delete(id);
        return Response.ok(null, "Turno eliminado correctamente");
    }


    @PostMapping("/asignar")
    public ResponseEntity<Object> asignarTurno(@RequestBody TurnoDTO turnoDTO) {
        try {
            TurnoDTO savedTurno = service.save(turnoDTO);
            return Response.ok(savedTurno, "Turno asignado correctamente.");
        } catch (IllegalArgumentException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al asignar el turno.");
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Object> cancelarTurno(@PathVariable Integer id, 
                                               @RequestParam(required = false) String motivo,
                                               HttpServletRequest request) {
        try {
            String currentUser = getCurrentUser(request);
            
            // Si no se proporciona motivo, usar uno por defecto
            String cancelReason = motivo != null && !motivo.trim().isEmpty() ? 
                                 motivo : "Cancelación solicitada por administrador";
            
            TurnoDTO turno = service.cancelarTurno(id, cancelReason, currentUser);
            return Response.ok(turno, "Turno cancelado correctamente.");
        } catch (IllegalArgumentException e) {
            return Response.notFound("Turno no encontrado");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al cancelar el turno: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Object> confirmarTurno(@PathVariable Integer id, HttpServletRequest request) {
        try {
            String currentUser = getCurrentUser(request);
            
            TurnoDTO turno = service.confirmarTurno(id, currentUser);
            return Response.ok(turno, "Turno confirmado correctamente.");
        } catch (IllegalArgumentException e) {
            return Response.notFound("Turno no encontrado");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al confirmar el turno: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reagendar")
    public ResponseEntity<Object> reagendarTurno(@PathVariable Integer id, 
                                                @RequestBody TurnoDTO nuevosDatos,
                                                @RequestParam(required = false) String motivo,
                                                HttpServletRequest request) {
        try {
            String currentUser = getCurrentUser(request);
            
            // Si no se proporciona motivo, usar uno por defecto
            String reason = motivo != null && !motivo.trim().isEmpty() ? 
                           motivo : "Reagendamiento solicitado por administrador";
            
            TurnoDTO turno = service.reagendarTurno(id, nuevosDatos, reason, currentUser);
            return Response.ok(turno, "Turno reagendado correctamente.");
        } catch (IllegalArgumentException e) {
            return Response.notFound("Turno no encontrado");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al reagendar el turno: " + e.getMessage());
        }
    }

    // === ENDPOINTS DE AUDITORÍA ===
    
    @GetMapping("/{id}/audit")
    public ResponseEntity<Object> getTurnoAuditHistory(@PathVariable Integer id) {
        try {
            List<AuditLog> auditHistory = service.getTurnoAuditHistory(id);
            return Response.ok(auditHistory, "Historial de auditoría recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el historial de auditoría: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/audit/page")
    public ResponseEntity<Object> getTurnoAuditHistoryPaged(@PathVariable Integer id,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        try {
            Page<AuditLog> auditHistory = service.getTurnoAuditHistoryPaged(id, page, size);
            
            var response = Map.of(
                    "content", auditHistory.getContent(),
                    "totalPages", auditHistory.getTotalPages(),
                    "totalElements", auditHistory.getTotalElements(),
                    "number", auditHistory.getNumber(),
                    "size", auditHistory.getSize(),
                    "first", auditHistory.isFirst(),
                    "last", auditHistory.isLast(),
                    "numberOfElements", auditHistory.getNumberOfElements());

            return Response.ok(response, "Historial de auditoría paginado recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el historial de auditoría: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/audit/verify")
    public ResponseEntity<Object> verifyTurnoAuditIntegrity(@PathVariable Integer id) {
        try {
            boolean isValid = service.verifyTurnoAuditIntegrity(id);
            return Response.ok(Map.of("isValid", isValid), 
                             isValid ? "La integridad del historial es válida" : 
                                     "Se detectaron inconsistencias en el historial");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar la integridad del historial: " + e.getMessage());
        }
    }

    @GetMapping("/audit/statistics")
    public ResponseEntity<Object> getAuditStatistics() {
        try {
            List<Object[]> statistics = service.getAuditStatistics();
            return Response.ok(statistics, "Estadísticas de auditoría recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las estadísticas: " + e.getMessage());
        }
    }

    @GetMapping("/audit/recent")
    public ResponseEntity<Object> getRecentAuditLogs() {
        try {
            List<AuditLog> recentLogs = service.getRecentAuditLogs();
            return Response.ok(recentLogs, "Logs recientes recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los logs recientes: " + e.getMessage());
        }
    }

    // === ENDPOINTS PARA CONSULTAS AVANZADAS ===

    @PostMapping("/search")
    public ResponseEntity<Object> searchWithFilters(@RequestBody TurnoFilterDTO filter) {
        try {
            if (filter.getExportFormat() != null && !filter.getExportFormat().isEmpty()) {
                // Es una solicitud de exportación
                List<TurnoDTO> turnos = service.findForExport(filter);
                return Response.ok(turnos, "Datos para exportación recuperados correctamente");
            } else {
                // Es una consulta paginada normal
                Page<TurnoDTO> turnos = service.findByAdvancedFilters(filter);
                Map<String, Object> response = Map.of(
                    "content", turnos.getContent(),
                    "totalElements", turnos.getTotalElements(),
                    "totalPages", turnos.getTotalPages(),
                    "size", turnos.getSize(),
                    "number", turnos.getNumber(),
                    "first", turnos.isFirst(),
                    "last", turnos.isLast(),
                    "numberOfElements", turnos.getNumberOfElements());
                
                return Response.ok(response, "Turnos filtrados recuperados correctamente");
            }
        } catch (Exception e) {
            return Response.error(null, "Error al buscar turnos: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchByText(
            @RequestParam(value = "q", required = false) String searchText,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "fecha") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "ASC") String sortDirection) {
        try {
            org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                "DESC".equalsIgnoreCase(sortDirection) ? 
                    org.springframework.data.domain.Sort.Direction.DESC : 
                    org.springframework.data.domain.Sort.Direction.ASC, 
                sortBy
            );
            
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size, sort);
                
            Page<TurnoDTO> turnos = service.findByTextSearch(searchText, pageable);
            
            Map<String, Object> response = Map.of(
                "content", turnos.getContent(),
                "totalElements", turnos.getTotalElements(),
                "totalPages", turnos.getTotalPages(),
                "size", turnos.getSize(),
                "number", turnos.getNumber(),
                "first", turnos.isFirst(),
                "last", turnos.isLast(),
                "numberOfElements", turnos.getNumberOfElements());
            
            return Response.ok(response, "Búsqueda por texto completada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error en la búsqueda por texto: " + e.getMessage());
        }
    }

    @PostMapping("/filters/simple")
    public ResponseEntity<Object> searchWithSimpleFilters(@RequestBody TurnoFilterDTO filter) {
        try {
            List<TurnoDTO> turnos = service.findByFilters(filter);
            return Response.ok(turnos, "Turnos filtrados recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al aplicar filtros: " + e.getMessage());
        }
    }
}
