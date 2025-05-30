package unpsjb.labprog.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsquemaTurnoDTO {
    private Integer id;
    private int intervalo;

    private Integer disponibilidadMedicoId; // ID de DisponibilidadMedico
    private List<DisponibilidadMedicoDTO.DiaHorarioDTO> horarios; // Horarios de DisponibilidadMedico

    private Integer staffMedicoId;
    private String nombreStaffMedico; // Nuevo campo para el nombre del médico

    private Integer centroId;
    private String nombreCentro;

    private Integer consultorioId;
    private String nombreConsultorio;
}