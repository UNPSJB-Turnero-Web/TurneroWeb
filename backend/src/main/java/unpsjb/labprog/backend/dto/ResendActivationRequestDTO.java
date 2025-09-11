package unpsjb.labprog.backend.dto;

/**
 * DTO para solicitud de reenvío de email de activación.
 */
public class ResendActivationRequestDTO {
    private String email;
    
    // Constructores
    public ResendActivationRequestDTO() {}
    
    public ResendActivationRequestDTO(String email) {
        this.email = email;
    }
    
    // Getters y Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}
