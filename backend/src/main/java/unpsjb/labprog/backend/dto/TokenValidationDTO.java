package unpsjb.labprog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para validación de token de recuperación de contraseña
 */
@Getter
@Setter
@AllArgsConstructor
public class TokenValidationDTO {
    
    private boolean valid;
    private String message;
    private String userEmail;
    
    public TokenValidationDTO(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
}
