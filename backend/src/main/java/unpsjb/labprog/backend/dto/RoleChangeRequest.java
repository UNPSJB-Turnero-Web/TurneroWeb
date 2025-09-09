package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para solicitudes de cambio de rol
 */
@Getter
@Setter
@NoArgsConstructor
public class RoleChangeRequest {
    
    private String newRole;
    private String reason;
    private String performedBy;
    
    public RoleChangeRequest(String newRole, String reason, String performedBy) {
        this.newRole = newRole;
        this.reason = reason;
        this.performedBy = performedBy;
    }
}
