package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisponibilidadMedicoDTO {
    private Long id;
    private List<String> diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Long staffMedicoId;
}