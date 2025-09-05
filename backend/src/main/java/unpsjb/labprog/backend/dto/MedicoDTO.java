package unpsjb.labprog.backend.dto;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicoDTO {
    private Integer id;
    private String nombre;
    private String apellido;
    private String dni;
    private String matricula;
    private Set<EspecialidadDTO> especialidades; 
}