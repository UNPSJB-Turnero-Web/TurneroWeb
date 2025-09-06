package unpsjb.labprog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para response de login con tokens
 */
@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String email;
    private String nombre;
    private String role;
    
    public LoginResponse(String accessToken, String refreshToken, String email, String nombre) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.email = email;
        this.nombre = nombre;
    }
    
    public LoginResponse(String accessToken, String refreshToken, String email, String nombre, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.email = email;
        this.nombre = nombre;
        this.role = role;
    }
}
