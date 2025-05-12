package unpsjb.labprog.backend.dto;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PacienteDTO {
    private int id;
    private int DNI;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private Date fechaNacimiento;
    private ObraSocialDTO obraSocial;

    // Getters y Setters
}