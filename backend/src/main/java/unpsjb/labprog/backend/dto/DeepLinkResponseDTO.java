package unpsjb.labprog.backend.dto;

/**
 * DTO para la respuesta de validación de deep link
 * Contiene los tokens de autenticación y el contexto del turno
 */
public class DeepLinkResponseDTO {
    
    private TokensDTO tokens;
    private TurnoContextDTO context;
    
    // Constructores
    public DeepLinkResponseDTO() {}
    
    public DeepLinkResponseDTO(TokensDTO tokens, TurnoContextDTO context) {
        this.tokens = tokens;
        this.context = context;
    }
    
    // Getters y Setters
    public TokensDTO getTokens() {
        return tokens;
    }
    
    public void setTokens(TokensDTO tokens) {
        this.tokens = tokens;
    }
    
    public TurnoContextDTO getContext() {
        return context;
    }
    
    public void setContext(TurnoContextDTO context) {
        this.context = context;
    }
    
    /**
     * DTO interno para tokens de autenticación
     */
    public static class TokensDTO {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private String email;
        private String fullName;
        
        public TokensDTO() {}
        
        public TokensDTO(String accessToken, String refreshToken, String tokenType, 
                        String email, String fullName) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenType = tokenType;
            this.email = email;
            this.fullName = fullName;
        }
        
        // Getters y Setters
        public String getAccessToken() {
            return accessToken;
        }
        
        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
        
        public String getRefreshToken() {
            return refreshToken;
        }
        
        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
        
        public String getTokenType() {
            return tokenType;
        }
        
        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }
        
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
    }
    
    /**
     * DTO interno para el contexto del turno
     */
    public static class TurnoContextDTO {
        private Integer turnoId;
        private Integer medicoId;
        private String medicoNombre;
        private Integer especialidadId;
        private String especialidadNombre;
        private Integer centroAtencionId;
        private String centroAtencionNombre;
        private String tipo; // CANCELACION, CONFIRMACION, etc.
        
        public TurnoContextDTO() {}
        
        // Getters y Setters
        public Integer getTurnoId() {
            return turnoId;
        }
        
        public void setTurnoId(Integer turnoId) {
            this.turnoId = turnoId;
        }
        
        public Integer getMedicoId() {
            return medicoId;
        }
        
        public void setMedicoId(Integer medicoId) {
            this.medicoId = medicoId;
        }
        
        public String getMedicoNombre() {
            return medicoNombre;
        }
        
        public void setMedicoNombre(String medicoNombre) {
            this.medicoNombre = medicoNombre;
        }
        
        public Integer getEspecialidadId() {
            return especialidadId;
        }
        
        public void setEspecialidadId(Integer especialidadId) {
            this.especialidadId = especialidadId;
        }
        
        public String getEspecialidadNombre() {
            return especialidadNombre;
        }
        
        public void setEspecialidadNombre(String especialidadNombre) {
            this.especialidadNombre = especialidadNombre;
        }
        
        public Integer getCentroAtencionId() {
            return centroAtencionId;
        }
        
        public void setCentroAtencionId(Integer centroAtencionId) {
            this.centroAtencionId = centroAtencionId;
        }
        
        public String getCentroAtencionNombre() {
            return centroAtencionNombre;
        }
        
        public void setCentroAtencionNombre(String centroAtencionNombre) {
            this.centroAtencionNombre = centroAtencionNombre;
        }
        
        public String getTipo() {
            return tipo;
        }
        
        public void setTipo(String tipo) {
            this.tipo = tipo;
        }
    }
}
