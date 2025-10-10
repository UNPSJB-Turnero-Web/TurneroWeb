package unpsjb.labprog.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO público para exponer turnos disponibles sin información sensible.
 * Este DTO NO contiene datos del paciente para proteger su privacidad.
 * Solo expone información básica necesaria para que usuarios anónimos
 * puedan consultar la disponibilidad de turnos.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TurnoPublicoDTO {
    
    /**
     * ID del turno
     */
    private Integer id;
    
    /**
     * Fecha del turno
     */
    private LocalDate fecha;
    
    /**
     * Hora de inicio del turno
     */
    private LocalTime hora;
    
    /**
     * Nombre del médico
     */
    private String nombreMedico;
    
    /**
     * Apellido del médico
     */
    private String apellidoMedico;
    
    /**
     * Especialidad médica
     */
    private String especialidad;
    
    /**
     * Nombre del centro de atención
     */
    private String nombreCentroAtencion;
}
