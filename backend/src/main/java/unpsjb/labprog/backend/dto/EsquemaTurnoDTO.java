package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

@Getter
@Setter
public class EsquemaTurnoDTO {
    private Long id;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private int intervalo;
    private Long staffMedicoId;
    private List<String> diasSemana; // Días de la semana en los que aplica el esquema
    private Long disponibilidadMedicoId; // ID     @ManyToOne
    private CentroAtencion centroAtencion;
    private Consultorio consultorio;
    

    // Getters y Setters
}