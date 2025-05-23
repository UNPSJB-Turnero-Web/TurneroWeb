package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CentroAtencionDTO {
    private int id;
    private String name;
    private String direccion;
    private String localidad;
    private String provincia;
    private String telefono;
    private Double latitud;
    private Double longitud;
}

