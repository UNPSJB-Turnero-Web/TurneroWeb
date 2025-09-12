package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO para solicitud de recuperación de contraseña
 */
@Getter
@Setter
public class PasswordResetRequestDTO {
    
    private String email;
}
