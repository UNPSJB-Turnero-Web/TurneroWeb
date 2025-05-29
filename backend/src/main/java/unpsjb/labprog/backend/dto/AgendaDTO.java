package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.Data;

@Data
public class AgendaDTO {
    private Integer id;
    private String fecha; // ISO yyyy-MM-dd

    private LocalTime horaInicio;
    private LocalTime horaFin;

    private Boolean habilitado;
    private String motivoInhabilitacion;
    private Integer tiempoTolerancia;
    private Integer consultorioId;
    private Integer esquemaTurnoId;
    private Integer staffMedicoId;
    private String nombreMedico;
    private String nombreConsultorio;

    private List<BloqueHorarioDTO> bloquesReservados; // ✔️ si lo estás usando
    private List<BloqueHorarioDTO> bloquesGenerados; // Representación de los bloques generados
}
