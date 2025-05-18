package unpsjb.labprog.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TurnoDTO {
    private Long id;
    private LocalDate fecha;
    private LocalTime horaInicio; // Hora de inicio del turno
    private LocalTime horaFin;    // Hora de fin del turno
    private Long pacienteId;      // ID del paciente
    private Long medicoId;        // ID del médico
    private String estado;        // Estado del turno (PENDIENTE, CONFIRMADO, CANCELADO)
    private EsquemaTurnoDTO esquemaTurno;
    private PacienteDTO paciente;
    private StaffMedicoDTO staffMedico;
    private CentroAtencionDTO centroAtencion;
}