package unpsjb.labprog.backend.dto;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicoDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni; // CAMBIAR A STRING
    private String matricula;
    private Set<EspecialidadDTO> especialidades;
}