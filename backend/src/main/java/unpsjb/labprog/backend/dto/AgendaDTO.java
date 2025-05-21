package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Data;

@Data
public class AgendaDTO {
    private Integer id;
    private Integer consultorioId;
    private Integer medicoId;
    private Integer especialidadId;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private List<String> diasAtencion; // Ej: ["LUNES", "MARTES"]
    private List<String> feriados; // ISO date strings
    private List<String> diasExcepcionales; // ISO date strings
    private Boolean habilitado;
    private String motivoInhabilitacion; // mantenimiento, sanitización, etc.
    private Integer tiempoTolerancia; // minutos entre turnos
    private List<BloqueHorarioDTO> bloquesReservados; // para cirugías, etc.
    
}