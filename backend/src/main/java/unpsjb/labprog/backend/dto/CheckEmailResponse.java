package unpsjb.labprog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para response de verificación de email
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckEmailResponse {
    private String email;
    private String nombre;
    private String role;
}
