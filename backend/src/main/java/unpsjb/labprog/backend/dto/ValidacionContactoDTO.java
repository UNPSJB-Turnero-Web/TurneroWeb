package unpsjb.labprog.backend.dto;

/**
 * DTO para la respuesta de validación de medios de contacto de un paciente
 * Usado para advertir sobre problemas de contacto antes de cancelar turnos
 */
public class ValidacionContactoDTO {
    
    private boolean tieneMediosValidos;
    private String mensaje;
    private String estadoDetallado;
    private boolean puedeRecibirEmail;
    private boolean puedeRecibirWhatsApp;
    private String emailRegistrado;
    private String telefonoRegistrado;
    
    public ValidacionContactoDTO() {}
    
    public ValidacionContactoDTO(boolean tieneMediosValidos, String mensaje) {
        this.tieneMediosValidos = tieneMediosValidos;
        this.mensaje = mensaje;
    }
    
    public ValidacionContactoDTO(boolean tieneMediosValidos, String mensaje, String estadoDetallado,
                                boolean puedeRecibirEmail, boolean puedeRecibirWhatsApp,
                                String emailRegistrado, String telefonoRegistrado) {
        this.tieneMediosValidos = tieneMediosValidos;
        this.mensaje = mensaje;
        this.estadoDetallado = estadoDetallado;
        this.puedeRecibirEmail = puedeRecibirEmail;
        this.puedeRecibirWhatsApp = puedeRecibirWhatsApp;
        this.emailRegistrado = emailRegistrado;
        this.telefonoRegistrado = telefonoRegistrado;
    }
    
    // Getters y Setters
    public boolean isTieneMediosValidos() { return tieneMediosValidos; }
    public void setTieneMediosValidos(boolean tieneMediosValidos) { this.tieneMediosValidos = tieneMediosValidos; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public String getEstadoDetallado() { return estadoDetallado; }
    public void setEstadoDetallado(String estadoDetallado) { this.estadoDetallado = estadoDetallado; }
    
    public boolean isPuedeRecibirEmail() { return puedeRecibirEmail; }
    public void setPuedeRecibirEmail(boolean puedeRecibirEmail) { this.puedeRecibirEmail = puedeRecibirEmail; }
    
    public boolean isPuedeRecibirWhatsApp() { return puedeRecibirWhatsApp; }
    public void setPuedeRecibirWhatsApp(boolean puedeRecibirWhatsApp) { this.puedeRecibirWhatsApp = puedeRecibirWhatsApp; }
    
    public String getEmailRegistrado() { return emailRegistrado; }
    public void setEmailRegistrado(String emailRegistrado) { this.emailRegistrado = emailRegistrado; }
    
    public String getTelefonoRegistrado() { return telefonoRegistrado; }
    public void setTelefonoRegistrado(String telefonoRegistrado) { this.telefonoRegistrado = telefonoRegistrado; }
    
    /**
     * Crea una respuesta para cuando el paciente tiene medios de contacto válidos
     */
    public static ValidacionContactoDTO conMediosValidos(String estadoDetallado, String email, String telefono) {
        ValidacionContactoDTO dto = new ValidacionContactoDTO();
        dto.tieneMediosValidos = true;
        dto.mensaje = "El paciente tiene medios de contacto válidos para recibir notificaciones";
        dto.estadoDetallado = estadoDetallado;
        dto.puedeRecibirEmail = true;
        dto.puedeRecibirWhatsApp = false; // Por ahora solo email implementado
        dto.emailRegistrado = email;
        dto.telefonoRegistrado = telefono;
        return dto;
    }
    
    /**
     * Crea una respuesta de advertencia cuando el paciente no tiene medios válidos
     */
    public static ValidacionContactoDTO conAdvertencia(String mensaje, String estadoDetallado, String email, String telefono) {
        ValidacionContactoDTO dto = new ValidacionContactoDTO();
        dto.tieneMediosValidos = false;
        dto.mensaje = mensaje;
        dto.estadoDetallado = estadoDetallado;
        dto.puedeRecibirEmail = false;
        dto.puedeRecibirWhatsApp = false;
        dto.emailRegistrado = email;
        dto.telefonoRegistrado = telefono;
        return dto;
    }
    
    @Override
    public String toString() {
        return "ValidacionContactoDTO{" +
                "tieneMediosValidos=" + tieneMediosValidos +
                ", mensaje='" + mensaje + '\'' +
                ", puedeRecibirEmail=" + puedeRecibirEmail +
                ", emailRegistrado='" + emailRegistrado + '\'' +
                ", telefonoRegistrado='" + telefonoRegistrado + '\'' +
                '}';
    }
}