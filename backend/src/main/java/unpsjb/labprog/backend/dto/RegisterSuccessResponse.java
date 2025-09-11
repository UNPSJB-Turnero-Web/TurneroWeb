package unpsjb.labprog.backend.dto;

/**
 * DTO para respuesta exitosa de registro con activación requerida.
 */
public class RegisterSuccessResponse {
    private String email;
    private String fullName;
    private String message;
    private boolean requiresActivation = true;
    
    // Constructores
    public RegisterSuccessResponse() {}
    
    public RegisterSuccessResponse(String email, String fullName, String message) {
        this.email = email;
        this.fullName = fullName;
        this.message = message;
    }
    
    // Getters y Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isRequiresActivation() {
        return requiresActivation;
    }
    
    public void setRequiresActivation(boolean requiresActivation) {
        this.requiresActivation = requiresActivation;
    }
}
