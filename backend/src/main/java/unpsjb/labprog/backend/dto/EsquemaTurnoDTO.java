package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsquemaTurnoDTO {
    private Integer id;
    private int intervalo;
    private Integer disponibilidadMedicoId;
    private Integer staffMedicoId;
    private Integer centroId;
    private Integer consultorioId;

    private List<DiaHorarioDTO> horarios;
    private List<DiaHorarioDTO> horariosDisponibilidad;

    private String nombreStaffMedico; 
    private String nombreCentro; 
    private String nombreConsultorio; 

    @Getter
    @Setter
    public static class DiaHorarioDTO {
        private String dia;
        private LocalTime horaInicio;
        private LocalTime horaFin;
    }
}