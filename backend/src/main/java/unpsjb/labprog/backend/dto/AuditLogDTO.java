package unpsjb.labprog.backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para la presentación de datos de auditoría de turnos
 */
@Getter
@Setter
@NoArgsConstructor
public class AuditLogDTO {
    private Integer id;
    private Integer turnoId;
    private String action;
    private LocalDateTime performedAt;
    private String performedBy;
    private String previousStatus;
    private String newStatus;
    private String oldValues;
    private String newValues;
    private String reason;
    private String ipAddress;
    private String userAgent;
    
    // Información del turno para contexto
    private String turnoFecha;
    private String turnoHora;
    private String pacienteNombre;
    private String medicoNombre;
    private String consultorioNombre;
    
    // Campos adicionales para la presentación
    private String actionDescription;
    private String timeAgo;
    private String statusChange;
}
