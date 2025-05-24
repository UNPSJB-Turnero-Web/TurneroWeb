package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffMedicoResumenDTO {
    private Integer id;
    private String nombreMedico;
    private String apellidoMedico;
    private String especialidad;
    // Getters y Setters
}