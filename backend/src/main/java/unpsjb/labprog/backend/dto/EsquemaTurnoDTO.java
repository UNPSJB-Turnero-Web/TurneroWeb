package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsquemaTurnoDTO {
    private Long id;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private int intervalo;
    private List<String> diasSemana;
    private Long disponibilidadMedicoId; // Solo el id
    private Long staffMedicoId; // Solo el id, si lo necesitas directo
    private Long centroAtencionId;
    private Long consultorioId;

    // Getters y Setters
}