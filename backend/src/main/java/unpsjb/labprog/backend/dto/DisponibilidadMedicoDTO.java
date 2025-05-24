package unpsjb.labprog.backend.dto;

import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisponibilidadMedicoDTO {
    private Integer id;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer staffMedicoId;
}