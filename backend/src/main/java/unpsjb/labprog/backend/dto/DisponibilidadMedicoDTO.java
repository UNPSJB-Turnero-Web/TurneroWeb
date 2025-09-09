package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisponibilidadMedicoDTO {
    private Integer id;
    private Integer staffMedicoId;
    private Integer especialidadId; // ID de la especialidad asociada
    private List<DiaHorarioDTO> horarios; // Lista de días con horarios

    @Getter
    @Setter
    public static class DiaHorarioDTO {
        private String dia; // Día de la semana
        private LocalTime horaInicio; // Hora de inicio
        private LocalTime horaFin; // Hora de fin
    }
}