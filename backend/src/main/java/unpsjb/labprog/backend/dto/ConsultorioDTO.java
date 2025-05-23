package unpsjb.labprog.backend.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConsultorioDTO {
    private int id;
    private Integer numero;
    private String name;
    private int centroAtencionId;
    private String centroAtencionName;

    // Getters y Setters
}
