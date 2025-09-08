package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OperadorRegistroDTO {
    // Datos básicos heredados de Persona
    private String nombre;
    private String apellido;
    private Long dni;
    private String email;
    private String password; // contraseña en texto plano solo para el registro
    private String telefono;

    // Datos específicos de Operador
    private Boolean activo = true;

    // Constructor completo
    public OperadorRegistroDTO(String nombre, String apellido, Long dni, String email,
            String password, String telefono, Boolean activo) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.password = password;
        this.telefono = telefono;
        this.activo = activo;
    }
}
