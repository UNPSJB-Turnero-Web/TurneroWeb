package unpsjb.labprog.backend.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicoDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String matricula;
    private EspecialidadDTO especialidad;

    // Getters y Setters
}