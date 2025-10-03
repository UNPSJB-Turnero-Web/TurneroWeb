package unpsjb.labprog.backend.dto;

/**
 * DTO para la validación de tokens de deep linking
 */
public class DeepLinkValidationDTO {
    
    private String token;
    
    // Constructores
    public DeepLinkValidationDTO() {}
    
    public DeepLinkValidationDTO(String token) {
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
