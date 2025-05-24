package unpsjb.labprog.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class BloqueHorarioDTO {
    private Integer id;
    private LocalDate fecha;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private boolean esUrgencia;
    private String motivo;
}