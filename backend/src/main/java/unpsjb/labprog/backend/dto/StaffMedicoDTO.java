package unpsjb.labprog.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class StaffMedicoDTO {
    private Integer id;
    private CentroAtencionDTO centro;
    private MedicoDTO medico;
    private EspecialidadDTO especialidad;
    private ConsultorioDTO consultorio; 
    private List<DisponibilidadMedicoDTO> disponibilidad;
    private Double porcentaje;
    
    // Campos adicionales para compatibilidad con frontend
    private Integer centroAtencionId;
    private Integer medicoId;
    private Integer especialidadId;
    private Integer consultorioId;

    // Getters y Setters
}