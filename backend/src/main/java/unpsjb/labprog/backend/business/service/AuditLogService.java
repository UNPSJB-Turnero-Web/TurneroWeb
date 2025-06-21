package unpsjb.labprog.backend.business.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import unpsjb.labprog.backend.business.repository.AuditLogRepository;
import unpsjb.labprog.backend.model.AuditLog;
import unpsjb.labprog.backend.model.Turno;

/**
 * Servicio para gestionar los registros de auditoría de turnos.
 * Garantiza la inmutabilidad de los registros una vez creados.
 */
@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Registra una acción de auditoría para un turno.
     * Este método es inmutable - una vez guardado el registro no puede modificarse.
     */
    @Transactional
    public AuditLog logTurnoAction(Turno turno, String action, String performedBy, 
                                  String previousStatus, String newStatus, 
                                  Object oldValues, Object newValues, String reason) {
        
        try {
            String oldValuesJson = oldValues != null ? objectMapper.writeValueAsString(oldValues) : null;
            String newValuesJson = newValues != null ? objectMapper.writeValueAsString(newValues) : null;

            AuditLog auditLog = new AuditLog(
                turno, action, performedBy, previousStatus, newStatus,
                oldValuesJson, newValuesJson, reason
            );

            // Guardar de forma inmutable
            return auditLogRepository.save(auditLog);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al serializar datos de auditoría", e);
        }
    }

    /**
     * Registra la creación de un turno
     */
    @Transactional
    public AuditLog logTurnoCreated(Turno turno, String performedBy) {
        return logTurnoAction(turno, AuditLog.Actions.CREATE, performedBy, 
                            null, turno.getEstado().name(), 
                            null, turno, null);
    }

    /**
     * Registra un cambio de estado de turno
     */
    @Transactional
    public AuditLog logStatusChange(Turno turno, String previousStatus, String performedBy, String reason) {
        return logTurnoAction(turno, AuditLog.Actions.UPDATE_STATUS, performedBy,
                            previousStatus, turno.getEstado().name(),
                            null, null, reason);
    }

    /**
     * Registra la cancelación de un turno (con motivo obligatorio)
     */
    @Transactional
    public AuditLog logTurnoCanceled(Turno turno, String previousStatus, String performedBy, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo de cancelación es obligatorio");
        }
        
        return logTurnoAction(turno, AuditLog.Actions.CANCEL, performedBy,
                            previousStatus, turno.getEstado().name(),
                            null, null, reason);
    }

    /**
     * Registra la confirmación de un turno
     */
    @Transactional
    public AuditLog logTurnoConfirmed(Turno turno, String previousStatus, String performedBy) {
        return logTurnoAction(turno, AuditLog.Actions.CONFIRM, performedBy,
                            previousStatus, turno.getEstado().name(),
                            null, null, null);
    }

    /**
     * Registra el reagendamiento de un turno
     */
    @Transactional
    public AuditLog logTurnoRescheduled(Turno turno, String previousStatus, Object oldValues, 
                                       String performedBy, String reason) {
        return logTurnoAction(turno, AuditLog.Actions.RESCHEDULE, performedBy,
                            previousStatus, turno.getEstado().name(),
                            oldValues, turno, reason);
    }

    /**
     * Registra la eliminación de un turno
     */
    @Transactional
    public AuditLog logTurnoDeleted(Turno turno, String performedBy, String reason) {
        return logTurnoAction(turno, AuditLog.Actions.DELETE, performedBy,
                            turno.getEstado().name(), "DELETED",
                            turno, null, reason);
    }

    /**
     * Obtiene el historial de auditoría de un turno específico
     */
    public List<AuditLog> getTurnoAuditHistory(Integer turnoId) {
        return auditLogRepository.findByTurnoIdOrderByPerformedAtDesc(turnoId);
    }

    /**
     * Obtiene el historial de auditoría de un turno con paginación
     */
    public Page<AuditLog> getTurnoAuditHistoryPaged(Integer turnoId, Pageable pageable) {
        return auditLogRepository.findByTurnoId(turnoId, pageable);
    }

    /**
     * Obtiene logs de auditoría por acción
     */
    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByPerformedAtDesc(action);
    }

    /**
     * Obtiene logs de auditoría por usuario
     */
    public List<AuditLog> getLogsByUser(String performedBy) {
        return auditLogRepository.findByPerformedByOrderByPerformedAtDesc(performedBy);
    }

    /**
     * Obtiene logs de auditoría en un rango de fechas
     */
    public List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByPerformedAtBetweenOrderByPerformedAtDesc(start, end);
    }

    /**
     * Obtiene logs de auditoría por turno y acción específica
     */
    public List<AuditLog> getLogsByTurnoAndAction(Integer turnoId, String action) {
        return auditLogRepository.findByTurnoIdAndActionOrderByPerformedAtDesc(turnoId, action);
    }

    /**
     * Obtiene usuarios únicos que han realizado auditorías
     */
    public List<String> getUniqueUsers() {
        return auditLogRepository.findDistinctPerformedBy();
    }

    /**
     * Obtiene estadísticas de acciones
     */
    public List<Object[]> getActionStatistics() {
        return auditLogRepository.findActionStatistics();
    }

    /**
     * Obtiene estadísticas de acciones por día
     */
    public List<Object[]> getActionStatsByDay(LocalDateTime startDate) {
        return auditLogRepository.getActionStatsByDay(startDate);
    }

    /**
     * Obtiene logs recientes (últimas 24 horas)
     */
    public List<AuditLog> getRecentLogs() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return auditLogRepository.findRecentLogs(since);
    }

    /**
     * Busca logs que contengan un término específico
     */
    public List<AuditLog> searchLogs(String searchTerm) {
        return auditLogRepository.findLogsContaining(searchTerm);
    }

    /**
     * Cuenta logs por acción
     */
    public Long countByAction(String action) {
        return auditLogRepository.countByAction(action);
    }

    /**
     * Cuenta logs por usuario
     */
    public Long countByUser(String performedBy) {
        return auditLogRepository.countByPerformedBy(performedBy);
    }

    /**
     * Limpia logs antiguos (solo para mantenimiento del sistema)
     * NOTA: Este método debe usarse con extrema precaución y solo por administradores del sistema
     */
    @Transactional
    public void cleanupOldLogs(LocalDateTime cutoffDate) {
        // Solo permite eliminar logs muy antiguos para mantener rendimiento
        if (cutoffDate.isAfter(LocalDateTime.now().minusYears(2))) {
            throw new IllegalArgumentException("Solo se pueden eliminar logs con más de 2 años de antigüedad");
        }
        auditLogRepository.deleteByPerformedAtBefore(cutoffDate);
    }

    /**
     * Verifica la integridad de los registros de auditoría
     * Este método puede usarse para detectar posibles manipulaciones
     */
    public boolean verifyAuditIntegrity(Integer turnoId) {
        List<AuditLog> logs = getTurnoAuditHistory(turnoId);
        
        // Verificaciones básicas de integridad
        for (int i = 0; i < logs.size() - 1; i++) {
            AuditLog current = logs.get(i);
            AuditLog next = logs.get(i + 1);
            
            // Verificar que las fechas estén en orden
            if (current.getPerformedAt().isBefore(next.getPerformedAt())) {
                return false;
            }
            
            // Verificar coherencia de estados
            if (next.getNewStatus() != null && current.getPreviousStatus() != null &&
                !next.getNewStatus().equals(current.getPreviousStatus())) {
                return false;
            }
        }
        
        return true;
    }
}
