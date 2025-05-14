package unpsjb.labprog.backend.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConsultorioDTO {
    private int id;
    private Integer numero;
    private String name;
    private CentroAtencionDTO centroAtencion;

    // Getters y Setters
}
