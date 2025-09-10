package unpsjb.labprog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para response de verificación de email por auth controller
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
