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
    private String nombreStaffMedico;
    private String especialidadStaffMedico;

    // Datos del centro y consultorio
    private String nombreCentro;
    private String nombreConsultorio;

    // Datos de agenda
    private Integer agendaId;
}