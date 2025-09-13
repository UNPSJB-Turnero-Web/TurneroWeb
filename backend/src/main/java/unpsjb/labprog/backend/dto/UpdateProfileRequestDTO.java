package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileRequestDTO {
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String dni;
    
    public boolean isValid() {
        return nombre != null && !nombre.trim().isEmpty() &&
               email != null && !email.trim().isEmpty() && email.contains("@");
    }
}