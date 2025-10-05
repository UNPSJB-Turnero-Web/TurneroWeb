package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad para tokens de enlaces profundos (deep links)
 * Permite que usuarios accedan a rutas específicas desde enlaces externos
 * con un contexto pre-establecido y autenticación automática
 */
@Entity
@Table(name = "deep_link_token")
public class DeepLinkToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(nullable = false)
    private Integer pacienteId;

    @Column
    private Integer turnoId;

    @Column
    private Integer medicoId;

    @Column
    private Integer especialidadId;

    @Column
    private Integer centroAtencionId;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(nullable = false)
    private Boolean usado;

    @Column(length = 50)
    private String tipo; // "CANCELACION", "CONFIRMACION", "REAGENDAMIENTO", etc.

    @Column(length = 500)
    private String metadata; // JSON con información adicional

    // Constructores
    public DeepLinkToken() {
        this.fechaCreacion = LocalDateTime.now();
        this.usado = false;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Integer pacienteId) {
        this.pacienteId = pacienteId;
    }

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

    public Integer getEspecialidadId() {
        return especialidadId;
    }

    public void setEspecialidadId(Integer especialidadId) {
        this.especialidadId = especialidadId;
    }

    public Integer getCentroAtencionId() {
        return centroAtencionId;
    }

    public void setCentroAtencionId(Integer centroAtencionId) {
        this.centroAtencionId = centroAtencionId;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public Boolean getUsado() {
        return usado;
    }

    public void setUsado(Boolean usado) {
        this.usado = usado;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    /**
     * Verifica si el token es válido
     */
    public boolean esValido() {
        return !usado && LocalDateTime.now().isBefore(fechaExpiracion);
    }

    /**
     * Marca el token como usado
     */
    public void marcarComoUsado() {
        this.usado = true;
    }
}
