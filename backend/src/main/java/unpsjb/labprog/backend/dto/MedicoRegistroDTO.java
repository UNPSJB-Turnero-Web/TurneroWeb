package unpsjb.labprog.backend.dto;

import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO para el registro de un nuevo médico en el sistema
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicoRegistroDTO {
    // Datos básicos de persona
    private String nombre;
    private String apellido;
    private Long dni;
    private String email;
    private String password;
    private String telefono;
    
    // Datos específicos de médico
    private String matricula;
    private Set<Integer> especialidadIds; // IDs de las especialidades
    
    /**
     * Constructor vacío para serialización
     */
    public MedicoRegistroDTO() {}
    
    /**
     * Constructor completo
     */
    public MedicoRegistroDTO(String nombre, String apellido, Long dni, String email, 
                           String password, String telefono, String matricula, Set<Integer> especialidadIds) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.password = password;
        this.telefono = telefono;
        this.matricula = matricula;
        this.especialidadIds = especialidadIds;
    }
}
