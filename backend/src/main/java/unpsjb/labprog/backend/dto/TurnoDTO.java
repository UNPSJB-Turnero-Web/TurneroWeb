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
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private int pacienteId; // Campo para el ID del paciente
    private int medicoId;
    private String estado; // PENDIENTE, CONFIRMADO, CANCELADO
    private EsquemaTurnoDTO esquemaTurno;
    private PacienteDTO paciente;
    private MedicoDTO medico;
    private CentroAtencionDTO centroAtencion;

    // Getters y Setters
}