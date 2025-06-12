package unpsjb.labprog.backend.dto;

import java.time.LocalTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class ConsultorioDTO {
    private Integer id;
    private Integer numero;
    private String nombre;
    private Integer centroId;
    private String nombreCentro;
    
    // Horarios por defecto del consultorio
    private LocalTime horaAperturaDefault;
    private LocalTime horaCierreDefault;
    
    // Horarios específicos por día de la semana
    private List<HorarioConsultorioDTO> horariosSemanales;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HorarioConsultorioDTO {
        private String diaSemana; // LUNES, MARTES, etc.
        private LocalTime horaApertura;
        private LocalTime horaCierre;
        private Boolean activo = true; // Para días que no atiende
    }
}
