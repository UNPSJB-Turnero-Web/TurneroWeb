package unpsjb.labprog.backend.dto;

/**
 * DTO para respuesta de cambio de contraseña.
 */
public class ChangePasswordResponseDTO {
    private boolean success;
    private String message;
    
    // Constructores
    public ChangePasswordResponseDTO() {}
    
    public ChangePasswordResponseDTO(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // Getters y Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
