package unpsjb.labprog.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import unpsjb.labprog.backend.model.TipoNotificacion;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionDTO {
    
    private Long id;
    private Integer pacienteId;
    private String titulo;
    private String mensaje;
    private TipoNotificacion tipo;
    private String tipoDescripcion;
    private String tipoCategoria;
    private Boolean leida;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaLeida;
    private Integer turnoId;
    private String usuarioCreador;
    
    // Campos adicionales para la UI
    private String fechaCreacionFormateada;
    private String fechaLeidaFormateada;
    private boolean esNueva; // Para mostrar badge "nuevo"
    private String iconoTipo; // Icono según el tipo
    
    public NotificacionDTO(Long id, Integer pacienteId, String titulo, String mensaje, 
                          TipoNotificacion tipo, Boolean leida, LocalDateTime fechaCreacion, 
                          LocalDateTime fechaLeida, Integer turnoId, String usuarioCreador) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.tipoDescripcion = tipo.getDescripcion();
        this.tipoCategoria = tipo.getCategoria();
        this.leida = leida;
        this.fechaCreacion = fechaCreacion;
        this.fechaLeida = fechaLeida;
        this.turnoId = turnoId;
        this.usuarioCreador = usuarioCreador;
        
        // Determinar si es nueva (menos de 24 horas y no leída)
        this.esNueva = !leida && fechaCreacion.isAfter(LocalDateTime.now().minusHours(24));
        
        // Asignar icono según el tipo
        this.iconoTipo = getIconoPorTipo(tipo);
    }
    
    private String getIconoPorTipo(TipoNotificacion tipo) {
        switch (tipo) {
            case CONFIRMACION:
                return "fas fa-check-circle";
            case CANCELACION:
                return "fas fa-times-circle";
            case REAGENDAMIENTO:
                return "fas fa-calendar-alt";
            case RECORDATORIO:
                return "fas fa-bell";
            case NUEVO_TURNO:
                return "fas fa-plus-circle";
            case SISTEMA_MANTENIMIENTO:
                return "fas fa-tools";
            case INFORMACION_GENERAL:
                return "fas fa-info-circle";
            case URGENTE:
                return "fas fa-exclamation-triangle";
            default:
                return "fas fa-envelope";
        }
    }
}
