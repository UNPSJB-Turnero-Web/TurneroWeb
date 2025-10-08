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
import java.time.ZoneId;
import java.time.ZonedDateTime;
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
    
    @Autowired
    private EmailService emailService;

    @Value("${turnos.auto-cancel.enabled:true}")
    private Boolean autoCancelEnabled;
    
    @Value("${turnos.auto-cancel.hours-before:48}")
    private Integer horasAnticipacion;
    
    @Value("${app.url:http://localhost:4200}")
    private String appUrl;

    // Zona horaria de Argentina
    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

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
            
            // Obtener fecha/hora actual en zona horaria de Argentina (UTC-3)
            ZonedDateTime ahoraArgentina = ZonedDateTime.now(ARGENTINA_ZONE);
            LocalDateTime ahora = ahoraArgentina.toLocalDateTime();
            
            // Calcular fecha límite: ahora + horas de anticipación configuradas
            LocalDateTime limiteConfirmacion = ahora.plusHours(horasAnticipacion);
            logger.info("📅 Fecha/hora actual (Argentina UTC-3): {} | Límite de confirmación: {} ({} horas)", 
                       ahora, limiteConfirmacion, horasAnticipacion);
            
            // Buscar turnos PROGRAMADOS cuya fecha/hora sea dentro del límite y no hayan sido confirmados
            List<Turno> turnosACancelar = turnoRepository.findTurnosParaCancelacionAutomatica(
                EstadoTurno.PROGRAMADO,
                ahora,
                limiteConfirmacion
            );
            
            if (turnosACancelar.isEmpty()) {
                logger.info("✅ No hay turnos para cancelar automáticamente");
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

        // Notificar al paciente por email
        notificarCancelacionAutomatica(turno);

        logger.debug("✅ Notificación enviada al paciente para turno ID {}", turno.getId());
    }
    
    /**
     * Envía notificación por email al paciente sobre la cancelación automática
     * @param turno el turno que fue cancelado
     */
    private void notificarCancelacionAutomatica(Turno turno) {
        try {
            // Verificar que el paciente tenga email
            if (turno.getPaciente() == null || turno.getPaciente().getEmail() == null || turno.getPaciente().getEmail().trim().isEmpty()) {
                logger.warn("⚠️  No se puede enviar notificación: paciente sin email para turno ID {}", turno.getId());
                return;
            }
            
            String patientEmail = turno.getPaciente().getEmail();
            String patientName = turno.getPaciente().getNombre() + " " + turno.getPaciente().getApellido();
            
            // Construir detalles del turno
            String appointmentDetails = String.format(
                "<p><strong>Fecha:</strong> %s</p>" +
                "<p><strong>Hora:</strong> %s</p>" +
                "<p><strong>Médico:</strong> %s %s</p>" +
                "<p><strong>Especialidad:</strong> %s</p>" +
                "<p><strong>Centro:</strong> %s</p>" +
                "<p><strong>Consultorio:</strong> %s</p>",
                turno.getFecha().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                turno.getHoraInicio(),
                turno.getStaffMedico() != null && turno.getStaffMedico().getMedico() != null ? turno.getStaffMedico().getMedico().getNombre() : "N/A",
                turno.getStaffMedico() != null && turno.getStaffMedico().getMedico() != null ? turno.getStaffMedico().getMedico().getApellido() : "",
                turno.getStaffMedico() != null && turno.getStaffMedico().getEspecialidad() != null ? turno.getStaffMedico().getEspecialidad().getNombre() : "N/A",
                turno.getConsultorio() != null && turno.getConsultorio().getCentroAtencion() != null ? turno.getConsultorio().getCentroAtencion().getNombre() : "N/A",
                turno.getConsultorio() != null ? turno.getConsultorio().getNombre() : "N/A"
            );
            
            // URL para reagendar (puede ser la URL base de la aplicación)
            String rescheduleUrl = appUrl;
            
            logger.info("📧 Enviando notificación de cancelación automática a {} para turno ID {}", patientEmail, turno.getId());
            
            // Enviar email de forma asíncrona
            emailService.sendAutomaticCancellationEmail(patientEmail, patientName, appointmentDetails, rescheduleUrl)
                .whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        logger.error("❌ Error al enviar notificación de cancelación automática para turno ID {}: {}", turno.getId(), throwable.getMessage());
                    } else {
                        logger.info("✅ Notificación de cancelación automática enviada exitosamente para turno ID {}", turno.getId());
                    }
                });
                
        } catch (Exception e) {
            logger.error("❌ Error al preparar notificación de cancelación automática para turno ID {}: {}", turno.getId(), e.getMessage());
        }
    }
    
    /**
     * Obtiene estadísticas de turnos programados próximos a vencer
     * @return cantidad de turnos que están por ser cancelados automáticamente
     */
    public long contarTurnosPorVencer() {
        if (!autoCancelEnabled) {
            return 0L;
        }
        
        // Usar zona horaria de Argentina
        ZonedDateTime ahoraArgentina = ZonedDateTime.now(ARGENTINA_ZONE);
        LocalDateTime ahora = ahoraArgentina.toLocalDateTime();
        LocalDateTime limiteConfirmacion = ahora.plusHours(horasAnticipacion);
        return turnoRepository.countTurnosParaCancelacionAutomatica(
            EstadoTurno.PROGRAMADO,
            ahora,
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