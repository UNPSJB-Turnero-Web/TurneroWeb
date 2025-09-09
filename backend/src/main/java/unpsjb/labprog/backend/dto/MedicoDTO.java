package unpsjb.labprog.backend.dto;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor
public class MedicoDTO {
    private Integer id;
    private String nombre;
    private String apellido;
    private String dni;
    private String email; // Para registro
    private String password; // Para registro
    private String telefono; // Para registro
    private String matricula;
    private Set<EspecialidadDTO> especialidades;
    private Set<Integer> especialidadIds; // IDs de las especialidades para registro
    
    // Campo para auditoría
    private String performedBy; // Usuario que realiza la acción
}