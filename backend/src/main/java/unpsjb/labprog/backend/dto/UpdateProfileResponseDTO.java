package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileResponseDTO {
    private String message;
    private UserDTO user;
    
    public UpdateProfileResponseDTO(String message, UserDTO user) {
        this.message = message;
        this.user = user;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    public static class UserDTO {
        private Long id;
        private String nombre;
        private String apellido;
        private String email;
        private String telefono;
        private String dni;
        private String role;
        
        public UserDTO(Long id, String nombre, String apellido, String email, 
                      String telefono, String dni, String role) {
            this.id = id;
            this.nombre = nombre;
            this.apellido = apellido;
            this.email = email;
            this.telefono = telefono;
            this.dni = dni;
            this.role = role;
        }
    }
}