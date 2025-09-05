package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO para request de refresh token
 */
@Getter
@Setter
public class RefreshTokenRequest {
    private String refreshToken;
}
