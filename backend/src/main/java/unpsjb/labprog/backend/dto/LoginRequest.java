package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO para request de login
 */
@Getter
@Setter
public class LoginRequest {
    private String email;
    private String password;
}
