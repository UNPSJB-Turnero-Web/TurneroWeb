package unpsjb.labprog.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CentroAtencionDTO {
    private Integer id;
    private String nombre;
    private String direccion;
    private String localidad;
    private String provincia;
    private String telefono;
    private Double latitud;
    private Double longitud;
    private List<StaffMedicoResumenDTO> staffMedico;
}

