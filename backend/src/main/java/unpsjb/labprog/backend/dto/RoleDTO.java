package unpsjb.labprog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transferencia de datos de roles
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Long dni;
    private String roleName;
    private String displayName;
    private String assignedBy;
    private String comments;
    private Boolean active;

    /**
     * Constructor simplificado para asignación básica de roles
     */
    public RoleDTO(Long dni, String roleName) {
        this.dni = dni;
        this.roleName = roleName != null ? roleName.toUpperCase() : null;
        this.active = true;
    }

    /**
     * Constructor para asignación con usuario que asigna
     */
    public RoleDTO(Long dni, String roleName, String assignedBy) {
        this.dni = dni;
        this.roleName = roleName != null ? roleName.toUpperCase() : null;
        this.assignedBy = assignedBy;
        this.active = true;
    }

    /**
     * Constructor con nombre descriptivo
     */
    public RoleDTO(Long dni, String roleName, String displayName, String assignedBy) {
        this.dni = dni;
        this.roleName = roleName != null ? roleName.toUpperCase() : null;
        this.displayName = displayName;
        this.assignedBy = assignedBy;
        this.active = true;
    }
}