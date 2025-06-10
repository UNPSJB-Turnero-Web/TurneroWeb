package unpsjb.labprog.backend.dto;
import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TurnoDTO {
    private Integer id;

    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    private String estado; // PENDIENTE, CONFIRMADO, CANCELADO
    // Datos del paciente (resumidos)
    private Integer pacienteId;
    private String nombrePaciente;
    private String apellidoPaciente;
    // Datos del médico (resumidos
    private Integer staffMedicoId;
    private String staffMedicoNombre;
    private String staffMedicoApellido;
    private String especialidadStaffMedico; // VERIFICAR
    // Datos del centro y consultorio
    private String nombreCentro;
    private String consultorioNombre;
    private Integer consultorioId;
    private Integer centroId;

    private String titulo;
    
    // Campos para manejo de slots en la agenda
    private Boolean esSlot;          // true = slot generado, false/null = turno real
    private Boolean ocupado;         // true = slot ocupado por un turno, false = disponible
    // Los colores se manejan en el frontend según el estado

}