package unpsjb.labprog.backend.business.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.model.Notificacion;
import unpsjb.labprog.backend.model.TipoNotificacion;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    /**
     * Encuentra todas las notificaciones de un paciente ordenadas por fecha
     */
    Page<Notificacion> findByPacienteIdOrderByFechaCreacionDesc(Integer pacienteId, Pageable pageable);
    
    /**
     * Encuentra notificaciones no leídas de un paciente
     */
    List<Notificacion> findByPacienteIdAndLeidaFalseOrderByFechaCreacionDesc(Integer pacienteId);
    
    /**
     * Cuenta notificaciones no leídas de un paciente
     */
    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.pacienteId = :pacienteId AND n.leida = false")
    Long countNotificacionesNoLeidas(@Param("pacienteId") Integer pacienteId);

    /**
     * Cuenta notificaciones no leídas de un paciente (método simplificado)
     */
    Long countByPacienteIdAndLeidaFalse(Integer pacienteId);

    /**
     * Encuentra una notificación por ID y paciente ID
     */
    Notificacion findByIdAndPacienteId(Long id, Integer pacienteId);

    /**
     * Encuentra notificaciones no leídas de un paciente (método simplificado)
     */
    List<Notificacion> findByPacienteIdAndLeidaFalse(Integer pacienteId);
    
    /**
     * Encuentra notificaciones por tipo
     */
    List<Notificacion> findByPacienteIdAndTipoOrderByFechaCreacionDesc(Integer pacienteId, TipoNotificacion tipo);
    
    /**
     * Encuentra notificaciones relacionadas con un turno específico
     */
    List<Notificacion> findByTurnoIdOrderByFechaCreacionDesc(Integer turnoId);
    
    /**
     * Marca todas las notificaciones como leídas para un paciente
     */
    @Modifying
    @Transactional
    @Query("UPDATE Notificacion n SET n.leida = true, n.fechaLeida = :fechaLeida WHERE n.pacienteId = :pacienteId AND n.leida = false")
    void marcarTodasComoLeidas(@Param("pacienteId") Integer pacienteId, @Param("fechaLeida") LocalDateTime fechaLeida);
    
    /**
     * Elimina notificaciones antiguas (más de X días)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Notificacion n WHERE n.fechaCreacion < :fechaLimite")
    void eliminarNotificacionesAntiguas(@Param("fechaLimite") LocalDateTime fechaLimite);
    
    /**
     * Encuentra las últimas N notificaciones de un paciente
     */
    List<Notificacion> findTop10ByPacienteIdOrderByFechaCreacionDesc(Integer pacienteId);
}
