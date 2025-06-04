package unpsjb.labprog.backend.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ObraSocialDTO {
    private Integer id;
    private String nombre;
    private String codigo;
    private String descripcion; // Campo agregado

}