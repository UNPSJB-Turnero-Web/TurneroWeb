package unpsjb.labprog.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EspecialidadDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
    private List<String> centroNombre; 
    private Integer centroId; 
    private Integer MedicoId; 
    private List<String> nombreMedico; 
}