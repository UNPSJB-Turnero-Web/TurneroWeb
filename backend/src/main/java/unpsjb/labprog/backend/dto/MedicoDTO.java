package unpsjb.labprog.backend.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicoDTO {
    private Integer id;
    private String nombre;
    private String apellido;
    private String dni;
    private String matricula;
    private EspecialidadDTO especialidad; 
}