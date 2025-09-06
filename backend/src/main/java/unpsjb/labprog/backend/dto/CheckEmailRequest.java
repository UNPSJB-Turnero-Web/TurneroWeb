package unpsjb.labprog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para request de verificación de email
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckEmailRequest {
    private String email;
}
