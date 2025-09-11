package unpsjb.labprog.backend.dto;

/**
 * DTO para validación de token de activación.
 */
public class ActivationTokenValidationDTO {
    private boolean valid;
    private String message;
    private String userEmail;
    private Integer expiresInMinutes;
    
    // Constructores
    public ActivationTokenValidationDTO() {}
    
    public ActivationTokenValidationDTO(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
    
    public ActivationTokenValidationDTO(boolean valid, String message, String userEmail) {
        this.valid = valid;
        this.message = message;
        this.userEmail = userEmail;
    }
    
    public ActivationTokenValidationDTO(boolean valid, String message, String userEmail, Integer expiresInMinutes) {
        this.valid = valid;
        this.message = message;
        this.userEmail = userEmail;
        this.expiresInMinutes = expiresInMinutes;
    }
    
    // Getters y Setters
    public boolean isValid() {
        return valid;
    }
    
    public void setValid(boolean valid) {
        this.valid = valid;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public Integer getExpiresInMinutes() {
        return expiresInMinutes;
    }
    
    public void setExpiresInMinutes(Integer expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }
}
