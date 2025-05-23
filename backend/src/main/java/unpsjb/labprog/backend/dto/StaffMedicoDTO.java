package unpsjb.labprog.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffMedicoDTO {
    private Long id;
    private Integer centroAtencionId; 
    private String centroAtencionName;
    private Long medicoId;
    private String medicoNombre;
    private Long especialidadId;
    private String especialidadNombre;
    private Long consultorioId;
    private String consultorioNombre;
    private List<Long> disponibilidadIds; // O los campos simples que necesites

    // Getters y Setters
}