package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OperadorDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private Long dni;
    private String email;
    private boolean activo; // estado del operador
}
