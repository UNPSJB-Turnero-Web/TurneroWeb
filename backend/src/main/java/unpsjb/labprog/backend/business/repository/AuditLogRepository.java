package unpsjb.labprog.backend.business.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {

    // Buscar logs de auditoría por turno
    List<AuditLog> findByTurnoIdOrderByPerformedAtDesc(Integer turnoId);
    
    // Buscar logs de auditoría por turno con paginación
    Page<AuditLog> findByTurnoId(Integer turnoId, Pageable pageable);

    // Buscar logs por acción
    List<AuditLog> findByActionOrderByPerformedAtDesc(String action);

    // Buscar logs por usuario
    List<AuditLog> findByPerformedByOrderByPerformedAtDesc(String performedBy);

    // Buscar logs en un rango de fechas
    List<AuditLog> findByPerformedAtBetweenOrderByPerformedAtDesc(LocalDateTime start, LocalDateTime end);

    // Buscar logs por turno y acción
    List<AuditLog> findByTurnoIdAndActionOrderByPerformedAtDesc(Integer turnoId, String action);

    // Obtener usuarios únicos que han realizado auditorías
    @Query("SELECT DISTINCT a.performedBy FROM AuditLog a ORDER BY a.performedBy")
    List<String> findDistinctPerformedBy();

    // Contar logs por acción
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = :action")
    Long countByAction(@Param("action") String action);

    // Contar logs por usuario
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.performedBy = :performedBy")
    Long countByPerformedBy(@Param("performedBy") String performedBy);

    // Obtener estadísticas de acciones (para dashboard)
    @Query("SELECT a.action, COUNT(a) FROM AuditLog a GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<Object[]> findActionStatistics();

    // Obtener estadísticas de acciones por día
    @Query("SELECT DATE(a.performedAt) as date, a.action, COUNT(a) as count " +
           "FROM AuditLog a " +
           "WHERE a.performedAt >= :startDate " +
           "GROUP BY DATE(a.performedAt), a.action " +
           "ORDER BY DATE(a.performedAt) DESC")
    List<Object[]> getActionStatsByDay(@Param("startDate") LocalDateTime startDate);

    // Obtener logs recientes (últimas 24 horas)
    @Query("SELECT a FROM AuditLog a WHERE a.performedAt >= :since ORDER BY a.performedAt DESC")
    List<AuditLog> findRecentLogs(@Param("since") LocalDateTime since);

    // Buscar logs que contengan cambios específicos
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(a.oldValues IS NOT NULL AND a.oldValues LIKE %:searchTerm%) OR " +
           "(a.newValues IS NOT NULL AND a.newValues LIKE %:searchTerm%) OR " +
           "a.reason LIKE %:searchTerm%")
    List<AuditLog> findLogsContaining(@Param("searchTerm") String searchTerm);

    // Eliminar logs antiguos (para limpieza de datos)
    void deleteByPerformedAtBefore(LocalDateTime cutoffDate);
}
