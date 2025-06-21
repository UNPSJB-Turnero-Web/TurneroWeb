package unpsjb.labprog.backend.presenter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.AuditLogService;
import unpsjb.labprog.backend.model.AuditLog;

/**
 * Controlador REST para la gestión de auditoría de turnos.
 * Proporciona endpoints de solo lectura para consultar el historial de auditoría.
 */
@RestController
@RequestMapping("/audit")
public class AuditLogPresenter {

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Obtiene el historial completo de auditoría de un turno específico
     */
    @GetMapping("/turno/{turnoId}")
    public ResponseEntity<Object> getTurnoAuditHistory(@PathVariable Integer turnoId) {
        try {
            List<AuditLog> auditHistory = auditLogService.getTurnoAuditHistory(turnoId);
            return Response.ok(auditHistory, "Historial de auditoría del turno recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el historial de auditoría: " + e.getMessage());
        }
    }

    /**
     * Obtiene el historial de auditoría de un turno con paginación
     */
    @GetMapping("/turno/{turnoId}/page")
    public ResponseEntity<Object> getTurnoAuditHistoryPaged(
            @PathVariable Integer turnoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<AuditLog> auditHistory = auditLogService.getTurnoAuditHistoryPaged(
                turnoId, org.springframework.data.domain.PageRequest.of(page, size));
            
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
            return Response.error(null, "Error al recuperar el historial paginado: " + e.getMessage());
        }
    }

    /**
     * Obtiene logs de auditoría por acción específica
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<Object> getLogsByAction(@PathVariable String action) {
        try {
            List<AuditLog> logs = auditLogService.getLogsByAction(action);
            return Response.ok(logs, "Logs de auditoría por acción recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los logs por acción: " + e.getMessage());
        }
    }

    /**
     * Obtiene logs de auditoría por usuario
     */
    @GetMapping("/user/{performedBy}")
    public ResponseEntity<Object> getLogsByUser(@PathVariable String performedBy) {
        try {
            List<AuditLog> logs = auditLogService.getLogsByUser(performedBy);
            return Response.ok(logs, "Logs de auditoría por usuario recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los logs por usuario: " + e.getMessage());
        }
    }

    /**
     * Obtiene logs de auditoría en un rango de fechas
     */
    @GetMapping("/daterange")
    public ResponseEntity<Object> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            List<AuditLog> logs = auditLogService.getLogsByDateRange(start, end);
            return Response.ok(logs, "Logs de auditoría por rango de fechas recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los logs por rango de fechas: " + e.getMessage());
        }
    }

    /**
     * Busca logs que contengan un término específico
     */
    @GetMapping("/search")
    public ResponseEntity<Object> searchLogs(@RequestParam String searchTerm) {
        try {
            List<AuditLog> logs = auditLogService.searchLogs(searchTerm);
            return Response.ok(logs, "Búsqueda de logs completada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al buscar logs: " + e.getMessage());
        }
    }

    /**
     * Obtiene estadísticas generales de auditoría
     */
    @GetMapping("/statistics")
    public ResponseEntity<Object> getAuditStatistics() {
        try {
            List<Object[]> statistics = auditLogService.getActionStatistics();
            return Response.ok(statistics, "Estadísticas de auditoría recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las estadísticas: " + e.getMessage());
        }
    }

    /**
     * Obtiene estadísticas de acciones por día desde una fecha específica
     */
    @GetMapping("/statistics/daily")
    public ResponseEntity<Object> getActionStatsByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate) {
        try {
            List<Object[]> statistics = auditLogService.getActionStatsByDay(startDate);
            return Response.ok(statistics, "Estadísticas diarias recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las estadísticas diarias: " + e.getMessage());
        }
    }

    /**
     * Obtiene logs recientes (últimas 24 horas)
     */
    @GetMapping("/recent")
    public ResponseEntity<Object> getRecentLogs() {
        try {
            List<AuditLog> recentLogs = auditLogService.getRecentLogs();
            return Response.ok(recentLogs, "Logs recientes recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los logs recientes: " + e.getMessage());
        }
    }

    /**
     * Obtiene usuarios únicos que han realizado auditorías
     */
    @GetMapping("/users")
    public ResponseEntity<Object> getUniqueUsers() {
        try {
            List<String> users = auditLogService.getUniqueUsers();
            return Response.ok(users, "Lista de usuarios recuperada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar la lista de usuarios: " + e.getMessage());
        }
    }

    /**
     * Cuenta logs por acción específica
     */
    @GetMapping("/count/action/{action}")
    public ResponseEntity<Object> countByAction(@PathVariable String action) {
        try {
            Long count = auditLogService.countByAction(action);
            return Response.ok(Map.of("action", action, "count", count), 
                             "Conteo por acción recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al contar logs por acción: " + e.getMessage());
        }
    }

    /**
     * Cuenta logs por usuario específico
     */
    @GetMapping("/count/user/{performedBy}")
    public ResponseEntity<Object> countByUser(@PathVariable String performedBy) {
        try {
            Long count = auditLogService.countByUser(performedBy);
            return Response.ok(Map.of("user", performedBy, "count", count), 
                             "Conteo por usuario recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al contar logs por usuario: " + e.getMessage());
        }
    }

    /**
     * Verifica la integridad del historial de auditoría de un turno
     */
    @GetMapping("/verify/{turnoId}")
    public ResponseEntity<Object> verifyAuditIntegrity(@PathVariable Integer turnoId) {
        try {
            boolean isValid = auditLogService.verifyAuditIntegrity(turnoId);
            Map<String, Object> result = Map.of(
                "turnoId", turnoId,
                "isValid", isValid,
                "message", isValid ? "La integridad del historial es válida" : 
                                   "Se detectaron inconsistencias en el historial"
            );
            return Response.ok(result, "Verificación de integridad completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar la integridad: " + e.getMessage());
        }
    }

    /**
     * Dashboard con información general de auditoría
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Object> getAuditDashboard() {
        try {
            // Estadísticas generales
            List<Object[]> actionStats = auditLogService.getActionStatistics();
            List<AuditLog> recentLogs = auditLogService.getRecentLogs();
            List<String> uniqueUsers = auditLogService.getUniqueUsers();
            
            // Estadísticas de los últimos 7 días
            LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
            List<Object[]> weeklyStats = auditLogService.getActionStatsByDay(weekAgo);
            
            Map<String, Object> dashboard = Map.of(
                "actionStatistics", actionStats,
                "recentLogs", recentLogs,
                "uniqueUsers", uniqueUsers,
                "weeklyStatistics", weeklyStats,
                "totalUsers", uniqueUsers.size(),
                "recentLogsCount", recentLogs.size()
            );
            
            return Response.ok(dashboard, "Dashboard de auditoría recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el dashboard: " + e.getMessage());
        }
    }
}
