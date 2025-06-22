package unpsjb.labprog.backend.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO para filtrar turnos en consultas avanzadas
 */
@Getter
@Setter
public class TurnoFilterDTO {
    
    // Filtros básicos
    private String estado;                    // PROGRAMADO, CONFIRMADO, CANCELADO, REAGENDADO
    private Integer pacienteId;               // ID del paciente
    private String nombrePaciente;            // Buscar por nombre del paciente (parcial)
    private Integer staffMedicoId;            // ID del médico
    private String nombreMedico;              // Buscar por nombre del médico (parcial)
    private Integer especialidadId;           // ID de la especialidad
    private String nombreEspecialidad;       // Buscar por nombre de especialidad (parcial)
    private String especialidad;             // Buscar por nombre de especialidad (alias)
    private Integer centroAtencionId;         // ID del centro de atención
    private String nombreCentro;             // Buscar por nombre del centro (parcial)
    private Integer centroId;                // ID del centro (alias)
    private Integer consultorioId;            // ID del consultorio
    private Integer medicoId;                // ID del médico (alias)
    
    // Filtros de fecha
    private LocalDate fechaDesde;             // Fecha desde (inclusive)
    private LocalDate fechaHasta;             // Fecha hasta (inclusive)
    private LocalDate fechaExacta;            // Fecha exacta (si se proporciona, ignora desde/hasta)
    
    // Filtros de auditoría
    private String usuarioModificacion;      // Usuario que realizó modificaciones
    private Boolean conModificaciones;       // true = solo turnos modificados, false = solo sin modificar
    
    // Paginación y ordenamiento
    private Integer page = 0;                 // Página (base 0)
    private Integer size = 20;                // Tamaño de página
    private String sortBy = "fecha";          // Campo por el que ordenar
    private String sortDirection = "ASC";     // ASC o DESC
    
    // Formato de exportación
    private String exportFormat;             // CSV, PDF (si se especifica, es para exportar)
}
