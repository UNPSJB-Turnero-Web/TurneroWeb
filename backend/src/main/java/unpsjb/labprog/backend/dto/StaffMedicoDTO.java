package unpsjb.labprog.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffMedicoDTO {
    private Integer id;
    private CentroAtencionDTO centro;
    private MedicoDTO medico;
    private EspecialidadDTO especialidad;
    private ConsultorioDTO consultorio; 
    private List<DisponibilidadMedicoDTO> disponibilidad;

    // Getters y Setters
}