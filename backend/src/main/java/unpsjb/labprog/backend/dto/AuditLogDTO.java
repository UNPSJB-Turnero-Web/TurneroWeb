package unpsjb.labprog.backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para la presentación de datos de auditoría de entidades del sistema
 */
@Getter
@Setter
@NoArgsConstructor
public class AuditLogDTO {
    private Integer id;
    private Integer turnoId; // Para compatibilidad con turnos
    private String entityType; // Tipo de entidad auditada
    private Long entityId; // ID de la entidad auditada
    private String action;
    private LocalDateTime performedAt;
    private String performedBy;
    private String estadoAnterior; // Estado anterior (genérico)
    private String estadoNuevo; // Estado nuevo (genérico)
    private String oldValues;
    private String newValues;
    private String reason;
    private String ipAddress;
    private String userAgent;
    
    // Información del turno para contexto (compatibilidad)
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
