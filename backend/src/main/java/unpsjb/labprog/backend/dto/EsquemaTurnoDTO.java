package unpsjb.labprog.backend.dto;

import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsquemaTurnoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private int intervalo;

    // Getters y Setters
}