package unpsjb.labprog.backend.dto;

/**
 * DTO para solicitud de activación de cuenta con token.
 */
public class AccountActivationRequestDTO {
    private String token;
    
    // Constructores
    public AccountActivationRequestDTO() {}
    
    public AccountActivationRequestDTO(String token) {
        this.token = token;
    }
    
    // Getters y Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}
