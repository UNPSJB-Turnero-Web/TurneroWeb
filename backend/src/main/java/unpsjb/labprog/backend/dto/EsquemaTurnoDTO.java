package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsquemaTurnoDTO {
    private Integer id;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private int intervalo;

    private List<String> diasSemana;

    private Integer staffMedicoId;
    private Integer centroId;
    private String nombreCentro;

    private Integer consultorioId;
    private String nombreConsultorio;
}