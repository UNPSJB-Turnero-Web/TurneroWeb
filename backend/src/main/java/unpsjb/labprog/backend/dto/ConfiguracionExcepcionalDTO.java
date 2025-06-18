package unpsjb.labprog.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import unpsjb.labprog.backend.model.ConfiguracionExcepcional;

/**
 * DTO para la entidad ConfiguracionExcepcional
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionExcepcionalDTO {

    private Integer id;
    private LocalDate fecha;
    private String tipo;
    private String descripcion;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer duracion;
    private boolean activo;
    
    // IDs de las entidades relacionadas para evitar circular references
    private Integer centroAtencionId;
    private String centroAtencionNombre;
    
    private Integer consultorioId;
    private String consultorioNombre;
    
    private Integer esquemaTurnoId;
    private String esquemaTurnoDescripcion;
    
    // Información adicional del esquema de turno para mostrar en el frontend
    private LocalTime esquemaTurnoHoraInicio;
    private LocalTime esquemaTurnoHoraFin;
    private Integer esquemaTurnoDuracion;
    
    // Información adicional del médico
    private String medicoId; 
    private String medicoNombre;
    private String medicoApellido;
    private String especialidadNombre;

    /**
     * Convierte una entidad ConfiguracionExcepcional a DTO
     */
    public static ConfiguracionExcepcionalDTO fromEntity(ConfiguracionExcepcional entity) {
        if (entity == null) {
            return null;
        }

        ConfiguracionExcepcionalDTO dto = new ConfiguracionExcepcionalDTO();
        dto.setId(entity.getId());
        dto.setFecha(entity.getFecha());
        dto.setTipo(entity.getTipo() != null ? entity.getTipo().name() : null);
        dto.setDescripcion(entity.getDescripcion());
        dto.setHoraInicio(entity.getHoraInicio());
        dto.setHoraFin(entity.getHoraFin());
        dto.setDuracion(entity.getDuracion());
        dto.setActivo(entity.isActivo());

        // Centro de atención
        if (entity.getCentroAtencion() != null) {
            dto.setCentroAtencionId(entity.getCentroAtencion().getId());
            dto.setCentroAtencionNombre(entity.getCentroAtencion().getNombre());
        }

        // Consultorio
        if (entity.getConsultorio() != null) {
            dto.setConsultorioId(entity.getConsultorio().getId());
            dto.setConsultorioNombre(entity.getConsultorio().getNombre());
        }

        // Esquema de turno con información adicional
        if (entity.getEsquemaTurno() != null) {
            dto.setEsquemaTurnoId(entity.getEsquemaTurno().getId());
            dto.setEsquemaTurnoDuracion(entity.getEsquemaTurno().getIntervalo());
            
            // Información del médico a través de StaffMedico directamente
            if (entity.getEsquemaTurno().getStaffMedico() != null) {
                var staffMedico = entity.getEsquemaTurno().getStaffMedico();
                if (staffMedico.getMedico() != null) {
                    dto.setMedicoNombre(staffMedico.getMedico().getNombre());
                    dto.setMedicoApellido(staffMedico.getMedico().getApellido());
                    
                    if (staffMedico.getMedico().getEspecialidad() != null) {
                        dto.setEspecialidadNombre(staffMedico.getMedico().getEspecialidad().getNombre());
                    }
                }
            }

            // Horarios del esquema de turno
            if (entity.getEsquemaTurno().getHorarios() != null && !entity.getEsquemaTurno().getHorarios().isEmpty()) {
                var horario = entity.getEsquemaTurno().getHorarios().get(0); // Tomamos el primer horario como referencia
                dto.setEsquemaTurnoHoraInicio(horario.getHoraInicio());
                dto.setEsquemaTurnoHoraFin(horario.getHoraFin());
                
                // Crear descripción descriptiva
                String descripcion = String.format("%s %s - %s (%s)", 
                    dto.getMedicoNombre() != null ? dto.getMedicoNombre() : "",
                    dto.getMedicoApellido() != null ? dto.getMedicoApellido() : "",
                    dto.getEspecialidadNombre() != null ? dto.getEspecialidadNombre() : "",
                    horario.getDia()
                );
                dto.setEsquemaTurnoDescripcion(descripcion.trim());
            }
        }

        return dto;
    }
}
