package unpsjb.labprog.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AgendaDTO {
    private Integer id; 
    private Integer especialidadId;
    private String especialidadNombre;
    private String diaInicio; // ISO yyyy-MM-dd
    private String diaFin;    // ISO yyyy-MM-dd
    private List<DiaDTO> dias;
    private List<String> feriados; // Fechas ISO yyyy-MM-dd
    private List<DiaExcepcionalDTO> diasExcepcionales;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiaDTO {
        private String fecha; // ISO yyyy-MM-dd
        private String diaSemana;
        private String apertura; // HH:mm
        private String cierre;   // HH:mm
        private Boolean inhabilitado;
        private String motivoInhabilitacion;
        private List<SlotDTO> slots;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotDTO {
        private Integer id;
        private String fecha; // ISO yyyy-MM-dd
        private String diaSemana;
        private String horaInicio; // HH:mm
        private String horaFin;    // HH:mm
        private Boolean inhabilitado;
        private String motivoInhabilitacion;
        private Boolean esUrgencia;
        private String motivo;
        private Integer centroAtencionId;
        private String centroAtencionNombre;
        private Integer consultorioId;
        private String consultorioNombre;
        private Integer medicoId;
        private String medicoNombre;
        private String medicoApellido;
        private String especialidadStaffMedico;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiaExcepcionalDTO {
        private String fecha; // ISO yyyy-MM-dd
        private String descripcion;
        private String apertura; // HH:mm
        private String cierre;   // HH:mm
    }

}