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

    // Alias para compatibilidad - el frontend espera 'centroAtencion' en lugar de 'centro'
    public CentroAtencionDTO getCentroAtencion() {
        return this.centro;
    }
    
    public void setCentroAtencion(CentroAtencionDTO centroAtencion) {
        this.centro = centroAtencion;
    }

    // Getters y Setters
}