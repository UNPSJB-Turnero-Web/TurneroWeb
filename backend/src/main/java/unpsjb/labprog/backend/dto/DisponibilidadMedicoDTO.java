package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisponibilidadMedicoDTO {
    private Integer id;
    private List<String> diaSemana; 
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer staffMedicoId;
}