package unpsjb.labprog.backend.dto;

import java.util.Date;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para el registro de un nuevo paciente en el sistema
 */
@Getter
@Setter
public class PacienteRegistroDTO {
    // Datos básicos de persona
    private String nombre;
    private String apellido;
    private Long dni;
    private String email;
    private String password;
    private String telefono;
    
    // Datos específicos de paciente
    private Date fechaNacimiento;
    private Integer obraSocialId; // ID de la obra social (opcional)
    
    /**
     * Constructor vacío para serialización
     */
    public PacienteRegistroDTO() {}
    
    /**
     * Constructor completo
     */
    public PacienteRegistroDTO(String nombre, String apellido, Long dni, String email, 
                             String password, String telefono, Date fechaNacimiento, Integer obraSocialId) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.password = password;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.obraSocialId = obraSocialId;
    }
}
