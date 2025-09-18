package unpsjb.labprog.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para capturar información completa de la cancelación de turnos
 * Utilizado para generar plantillas de notificación y registro de auditoría
 */
public class CancelacionDataDTO {
    
    // Información del turno cancelado
    private Long turnoId;
    private LocalDate fechaTurno;
    private LocalTime horaTurno;
    private String razonCancelacion;
    
    // Información del centro médico y profesional
    private String centroMedico;
    private String consultorio;
    private String especialidad;
    private String medico;
    
    // Información del paciente para contacto
    private Long pacienteId;
    private String pacienteNombre;
    private String pacienteApellido;
    private String pacienteEmail;
    private String pacienteTelefono;
    
    // Información de auditoría
    private String canceladoPor;
    private String rolCancelacion;
    
    public CancelacionDataDTO() {}
    
    public CancelacionDataDTO(Long turnoId, LocalDate fechaTurno, LocalTime horaTurno, 
                             String razonCancelacion, String centroMedico, String consultorio,
                             String especialidad, String medico, Long pacienteId,
                             String pacienteNombre, String pacienteApellido, String pacienteEmail,
                             String pacienteTelefono, String canceladoPor, String rolCancelacion) {
        this.turnoId = turnoId;
        this.fechaTurno = fechaTurno;
        this.horaTurno = horaTurno;
        this.razonCancelacion = razonCancelacion;
        this.centroMedico = centroMedico;
        this.consultorio = consultorio;
        this.especialidad = especialidad;
        this.medico = medico;
        this.pacienteId = pacienteId;
        this.pacienteNombre = pacienteNombre;
        this.pacienteApellido = pacienteApellido;
        this.pacienteEmail = pacienteEmail;
        this.pacienteTelefono = pacienteTelefono;
        this.canceladoPor = canceladoPor;
        this.rolCancelacion = rolCancelacion;
    }
    
    // Getters y Setters
    public Long getTurnoId() { return turnoId; }
    public void setTurnoId(Long turnoId) { this.turnoId = turnoId; }
    
    public LocalDate getFechaTurno() { return fechaTurno; }
    public void setFechaTurno(LocalDate fechaTurno) { this.fechaTurno = fechaTurno; }
    
    public LocalTime getHoraTurno() { return horaTurno; }
    public void setHoraTurno(LocalTime horaTurno) { this.horaTurno = horaTurno; }
    
    public String getRazonCancelacion() { return razonCancelacion; }
    public void setRazonCancelacion(String razonCancelacion) { this.razonCancelacion = razonCancelacion; }
    
    public String getCentroMedico() { return centroMedico; }
    public void setCentroMedico(String centroMedico) { this.centroMedico = centroMedico; }
    
    public String getConsultorio() { return consultorio; }
    public void setConsultorio(String consultorio) { this.consultorio = consultorio; }
    
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    
    public String getMedico() { return medico; }
    public void setMedico(String medico) { this.medico = medico; }
    
    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }
    
    public String getPacienteNombre() { return pacienteNombre; }
    public void setPacienteNombre(String pacienteNombre) { this.pacienteNombre = pacienteNombre; }
    
    public String getPacienteApellido() { return pacienteApellido; }
    public void setPacienteApellido(String pacienteApellido) { this.pacienteApellido = pacienteApellido; }
    
    public String getPacienteEmail() { return pacienteEmail; }
    public void setPacienteEmail(String pacienteEmail) { this.pacienteEmail = pacienteEmail; }
    
    public String getPacienteTelefono() { return pacienteTelefono; }
    public void setPacienteTelefono(String pacienteTelefono) { this.pacienteTelefono = pacienteTelefono; }
    
    public String getCanceladoPor() { return canceladoPor; }
    public void setCanceladoPor(String canceladoPor) { this.canceladoPor = canceladoPor; }
    
    public String getRolCancelacion() { return rolCancelacion; }
    public void setRolCancelacion(String rolCancelacion) { this.rolCancelacion = rolCancelacion; }
    
    /**
     * Obtiene el nombre completo del paciente
     */
    public String getPacienteNombreCompleto() {
        if (pacienteNombre != null && pacienteApellido != null) {
            return pacienteNombre + " " + pacienteApellido;
        }
        return pacienteNombre != null ? pacienteNombre : 
               pacienteApellido != null ? pacienteApellido : "Sin nombre";
    }
    
    /**
     * Obtiene la fecha y hora formateada del turno
     */
    public String getFechaHoraFormateada() {
        if (fechaTurno != null && horaTurno != null) {
            return fechaTurno.toString() + " " + horaTurno.toString();
        }
        return "Fecha/hora no disponible";
    }
    
    /**
     * Verifica si el paciente tiene medios de contacto válidos
     */
    public boolean tieneMediosContacto() {
        return (pacienteEmail != null && !pacienteEmail.trim().isEmpty()) ||
               (pacienteTelefono != null && !pacienteTelefono.trim().isEmpty());
    }
    
    @Override
    public String toString() {
        return "CancelacionDataDTO{" +
                "turnoId=" + turnoId +
                ", fechaTurno=" + fechaTurno +
                ", horaTurno=" + horaTurno +
                ", centroMedico='" + centroMedico + '\'' +
                ", especialidad='" + especialidad + '\'' +
                ", medico='" + medico + '\'' +
                ", paciente='" + getPacienteNombreCompleto() + '\'' +
                ", canceladoPor='" + canceladoPor + '\'' +
                ", rolCancelacion='" + rolCancelacion + '\'' +
                '}';
    }
}