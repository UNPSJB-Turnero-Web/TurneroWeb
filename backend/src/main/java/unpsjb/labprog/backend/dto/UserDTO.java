package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO para transferencia de datos de usuario.
 * No incluye información sensible como contraseñas.
 */
@Getter
@Setter
public class UserDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni; // String para DTO por seguridad
    private String email;
    private String telefono;
    private Boolean enabled;
    private Boolean accountNonExpired;
    private Boolean accountNonLocked;
    private Boolean credentialsNonExpired;
    
    /**
     * Constructor vacío para serialización
     */
    public UserDTO() {}
    
    /**
     * Constructor completo
     */
    public UserDTO(Long id, String nombre, String apellido, String dni, String email, 
                   String telefono, Boolean enabled, Boolean accountNonExpired, 
                   Boolean accountNonLocked, Boolean credentialsNonExpired) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.telefono = telefono;
        this.enabled = enabled;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
    }
    
    /**
     * Indica si el usuario está activo
     */
    public boolean isActive() {
        return enabled && accountNonExpired && accountNonLocked && credentialsNonExpired;
    }
    
    /**
     * Obtiene el nombre completo
     */
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
}
