package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO para confirmación de recuperación de contraseña
 */
@Getter
@Setter
public class PasswordResetConfirmDTO {
    
    private String token;
    private String newPassword;
}
