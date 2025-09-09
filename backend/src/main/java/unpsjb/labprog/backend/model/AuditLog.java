package unpsjb.labprog.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad inmutable para el registro de auditoría de cambios en turnos.
 * Una vez creado, un registro no puede ser modificado ni eliminado.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = true)
    private Turno turno;

    // Nuevos campos para auditar usuarios y roles
    @Column(length = 50)
    private String entityType; // TURNO, USER, ROLE, etc.
    
    @Column
    private Long entityId; // ID de la entidad auditada

    @Column(nullable = false, length = 50)
    private String action; // CREATE, UPDATE_STATUS, CANCEL, CONFIRM, RESCHEDULE, DELETE, ROLE_CHANGE

    @Column(nullable = false)
    private LocalDateTime performedAt;

    @Column(nullable = false, length = 100)
    private String performedBy; // Usuario que realizó la acción

    @Column(length = 20)
    private String previousStatus; // Estado anterior del turno

    @Column(length = 20)
    private String newStatus; // Nuevo estado del turno

    @Lob
    private String oldValues; // JSON con valores anteriores del turno

    @Lob
    private String newValues; // JSON con nuevos valores del turno

    @Column(length = 500)
    private String reason; // Motivo del cambio (obligatorio para cancelaciones)

    @PrePersist
    protected void onCreate() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
    }

    // Constructor para auditoría de turnos (compatibilidad hacia atrás)
    public AuditLog(Turno turno, String action, String performedBy, String previousStatus, 
                   String newStatus, String oldValues, String newValues, String reason) {
        this.turno = turno;
        this.entityType = "TURNO";
        this.entityId = turno != null ? turno.getId().longValue() : null;
        this.action = action;
        this.performedBy = performedBy;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.oldValues = oldValues;
        this.newValues = newValues;
        this.reason = reason;
        this.performedAt = LocalDateTime.now();
    }

    // Constructor genérico para auditoría de cualquier entidad
    public AuditLog(String entityType, Long entityId, String action, String performedBy, 
                   String previousStatus, String newStatus, String oldValues, String newValues, String reason) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.performedBy = performedBy;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.oldValues = oldValues;
        this.newValues = newValues;
        this.reason = reason;
        this.performedAt = LocalDateTime.now();
    }

    // Constantes para las acciones de auditoría
    public static final class Actions {
        public static final String CREATE = "CREATE";
        public static final String UPDATE_STATUS = "UPDATE_STATUS";
        public static final String CANCEL = "CANCEL";
        public static final String CONFIRM = "CONFIRM";
        public static final String COMPLETE = "COMPLETE";
        public static final String RESCHEDULE = "RESCHEDULE";
        public static final String DELETE = "DELETE";
        public static final String ASSIGN = "ASSIGN";
        public static final String MODIFY = "MODIFY";
        
        // Nuevas acciones para roles y usuarios
        public static final String ROLE_CHANGE = "ROLE_CHANGE";
        public static final String USER_CREATE = "USER_CREATE";
        public static final String USER_UPDATE = "USER_UPDATE";
        public static final String USER_DELETE = "USER_DELETE";
        public static final String USER_ENABLE = "USER_ENABLE";
        public static final String USER_DISABLE = "USER_DISABLE";
    }

    // Constantes para tipos de entidad
    public static final class EntityTypes {
        public static final String TURNO = "TURNO";
        public static final String USER = "USER";
        public static final String ROLE = "ROLE";
        public static final String OPERADOR = "OPERADOR";
        public static final String MEDICO = "MEDICO";
        public static final String PACIENTE = "PACIENTE";
    }
}
