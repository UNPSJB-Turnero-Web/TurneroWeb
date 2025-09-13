package unpsjb.labprog.backend.business.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para automatización de turnos
 * Maneja cancelaciones automáticas por falta de confirmación
 */
@Service
public class TurnoAutomationService {

    private static final Logger logger = LoggerFactory.getLogger(TurnoAutomationService.class);
    
    @Autowired
    private TurnoRepository turnoRepository;
    
    @Autowired
    private AuditLogService auditLogService;

    @Value("${turnos.auto-cancel.enabled:true}")
    private Boolean autoCancelEnabled;
    
    @Value("${turnos.auto-cancel.hours-before:48}")
    private Integer horasAnticipacion;

    /**
     * Job que se ejecuta cada hora para cancelar turnos no confirmados
     * Cancela turnos PROGRAMADOS que no fueron confirmados dentro del tiempo límite
     */
    @Scheduled(fixedRateString = "${turnos.auto-cancel.check-interval:3600000}") // Default: cada hora
    @Transactional
    public void cancelarTurnosNoConfirmados() {
        if (!autoCancelEnabled) {
            logger.debug("🔧 Cancelación automática de turnos está deshabilitada");
            return;
        }
        
        try {
            logger.info("🔄 Iniciando proceso de cancelación automática de turnos...");
            
            // Calcular fecha límite: ahora + horas de anticipación configuradas
            LocalDateTime limiteConfirmacion = LocalDateTime.now().plusHours(horasAnticipacion);
            
            // Buscar turnos PROGRAMADOS cuya fecha/hora sea dentro del límite y no hayan sido confirmados
            List<Turno> turnosACancelar = turnoRepository.findTurnosParaCancelacionAutomatica(
                EstadoTurno.PROGRAMADO,
                limiteConfirmacion
            );
            
            if (turnosACancelar.isEmpty()) {
                logger.debug("✅ No hay turnos para cancelar automáticamente");
                return;
            }
            
            logger.info("⚠️  Encontrados {} turnos para cancelar automáticamente", turnosACancelar.size());
            
            int cancelados = 0;
            int errores = 0;
            
            for (Turno turno : turnosACancelar) {
                try {
                    cancelarTurnoAutomaticamente(turno);
                    cancelados++;
                } catch (Exception e) {
                    errores++;
                    logger.error("❌ Error al cancelar turno ID {}: {}", turno.getId(), e.getMessage());
                }
            }
            
            logger.info("✅ Proceso completado: {} turnos cancelados automáticamente, {} errores", 
                       cancelados, errores);
            
        } catch (Exception e) {
            logger.error("❌ Error crítico en proceso de cancelación automática: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Cancela un turno específico por falta de confirmación
     * @param turno el turno a cancelar
     */
    private void cancelarTurnoAutomaticamente(Turno turno) {
        logger.info("🚫 Cancelando turno ID {} - Paciente: {} {} - Fecha: {} {}", 
            turno.getId(), 
            turno.getPaciente().getNombre(),
            turno.getPaciente().getApellido(),
            turno.getFecha(),
            turno.getHoraInicio()
        );

        // Cambiar estado a CANCELADO
        turno.setEstado(EstadoTurno.CANCELADO);
        // No existe observaciones ni fechaModificacion en Turno, si se requiere guardar motivo, hacerlo en auditoría

        // Guardar cambios
        turnoRepository.save(turno);

        // Registrar en auditoría
        auditLogService.logTurnoCancelledAutomatically(
            turno.getId() != null ? turno.getId().longValue() : null,
            turno.getPaciente() != null && turno.getPaciente().getId() != null ? turno.getPaciente().getId().longValue() : null,
            String.format("Cancelación automática por falta de confirmación %d horas antes", horasAnticipacion)
        );

        logger.debug("✅ Turno ID {} cancelado y registrado en auditoría", turno.getId());

        // TODO: Aquí se podría agregar notificación al paciente
        // notificationService.notificarCancelacionAutomatica(turno);
    }
    
    /**
     * Obtiene estadísticas de turnos programados próximos a vencer
     * @return cantidad de turnos que están por ser cancelados automáticamente
     */
    public long contarTurnosPorVencer() {
        if (!autoCancelEnabled) {
            return 0L;
        }
        
        LocalDateTime limiteConfirmacion = LocalDateTime.now().plusHours(horasAnticipacion);
        return turnoRepository.countTurnosParaCancelacionAutomatica(
            EstadoTurno.PROGRAMADO,
            limiteConfirmacion
        );
    }
    
    /**
     * Ejecuta manualmente el proceso de cancelación automática
     * Útil para testing y ejecución manual desde admin
     */
    public void ejecutarCancelacionManual() {
        logger.info("🔧 Ejecución manual del proceso de cancelación automática solicitada");
        cancelarTurnosNoConfirmados();
    }
}