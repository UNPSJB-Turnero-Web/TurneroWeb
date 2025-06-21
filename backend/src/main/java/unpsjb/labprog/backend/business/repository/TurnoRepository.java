package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Integer>, JpaSpecificationExecutor<Turno> {
    boolean existsByFechaAndHoraInicioAndStaffMedico_Consultorio_CentroAtencion(
            LocalDate fecha, LocalTime horaInicio, CentroAtencion centroAtencion);

    boolean existsByStaffMedico_IdAndEstado(Integer staffMedicoId, EstadoTurno estado);

    boolean existsByFechaAndHoraInicioAndStaffMedicoId(LocalDate fecha, LocalTime horaInicio, Integer staffMedicoId);

    // Verificar si existe un turno activo (no cancelado) en un slot específico
    boolean existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
        LocalDate fecha, LocalTime horaInicio, Integer staffMedicoId, EstadoTurno estado);

    // Buscar turnos por paciente ID
    List<Turno> findByPaciente_Id(Integer pacienteId);
    
    // Verificar si existen turnos en una fecha específica para un staff médico
    boolean existsByFechaAndStaffMedico_Id(LocalDate fecha, Integer staffMedicoId);
    
    // Buscar turnos por fecha y staff médico
    List<Turno> findByFechaAndStaffMedico_Id(LocalDate fecha, Integer staffMedicoId);

    // === CONSULTAS AVANZADAS PARA FILTROS ===
    
    // Filtros básicos
    List<Turno> findByEstado(EstadoTurno estado);
    Page<Turno> findByEstado(EstadoTurno estado, Pageable pageable);
    
    List<Turno> findByStaffMedico_Id(Integer staffMedicoId);
    Page<Turno> findByStaffMedico_Id(Integer staffMedicoId, Pageable pageable);
    
    List<Turno> findByStaffMedico_Medico_Especialidad_Id(Integer especialidadId);
    Page<Turno> findByStaffMedico_Medico_Especialidad_Id(Integer especialidadId, Pageable pageable);
    
    List<Turno> findByConsultorio_CentroAtencion_Id(Integer centroId);
    Page<Turno> findByConsultorio_CentroAtencion_Id(Integer centroId, Pageable pageable);
    
    List<Turno> findByConsultorio_Id(Integer consultorioId);
    Page<Turno> findByConsultorio_Id(Integer consultorioId, Pageable pageable);
    
    // Filtros por fecha
    List<Turno> findByFechaBetween(LocalDate fechaDesde, LocalDate fechaHasta);
    Page<Turno> findByFechaBetween(LocalDate fechaDesde, LocalDate fechaHasta, Pageable pageable);
    
    List<Turno> findByFecha(LocalDate fecha);
    Page<Turno> findByFecha(LocalDate fecha, Pageable pageable);
    
    // Consultas con múltiples filtros usando @Query
    @Query("SELECT t FROM Turno t WHERE " +
           "(:estado IS NULL OR t.estado = :estado) AND " +
           "(:pacienteId IS NULL OR t.paciente.id = :pacienteId) AND " +
           "(:staffMedicoId IS NULL OR t.staffMedico.id = :staffMedicoId) AND " +
           "(:especialidadId IS NULL OR t.staffMedico.medico.especialidad.id = :especialidadId) AND " +
           "(:centroId IS NULL OR t.consultorio.centroAtencion.id = :centroId) AND " +
           "(:consultorioId IS NULL OR t.consultorio.id = :consultorioId) AND " +
           "(:fechaDesde IS NULL OR t.fecha >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR t.fecha <= :fechaHasta)")
    Page<Turno> findByFilters(@Param("estado") EstadoTurno estado,
                             @Param("pacienteId") Integer pacienteId,
                             @Param("staffMedicoId") Integer staffMedicoId,
                             @Param("especialidadId") Integer especialidadId,
                             @Param("centroId") Integer centroId,
                             @Param("consultorioId") Integer consultorioId,
                             @Param("fechaDesde") LocalDate fechaDesde,
                             @Param("fechaHasta") LocalDate fechaHasta,
                             Pageable pageable);
    
    @Query("SELECT t FROM Turno t WHERE " +
           "(:estado IS NULL OR t.estado = :estado) AND " +
           "(:pacienteId IS NULL OR t.paciente.id = :pacienteId) AND " +
           "(:staffMedicoId IS NULL OR t.staffMedico.id = :staffMedicoId) AND " +
           "(:especialidadId IS NULL OR t.staffMedico.medico.especialidad.id = :especialidadId) AND " +
           "(:centroId IS NULL OR t.consultorio.centroAtencion.id = :centroId) AND " +
           "(:consultorioId IS NULL OR t.consultorio.id = :consultorioId) AND " +
           "(:fechaDesde IS NULL OR t.fecha >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR t.fecha <= :fechaHasta)")
    List<Turno> findByFiltersForExport(@Param("estado") EstadoTurno estado,
                                      @Param("pacienteId") Integer pacienteId,
                                      @Param("staffMedicoId") Integer staffMedicoId,
                                      @Param("especialidadId") Integer especialidadId,
                                      @Param("centroId") Integer centroId,
                                      @Param("consultorioId") Integer consultorioId,
                                      @Param("fechaDesde") LocalDate fechaDesde,
                                      @Param("fechaHasta") LocalDate fechaHasta);
    
    // Búsquedas por texto (nombres parciales)
    @Query("SELECT t FROM Turno t WHERE " +
           "(:nombrePaciente IS NULL OR LOWER(CONCAT(t.paciente.nombre, ' ', t.paciente.apellido)) LIKE LOWER(CONCAT('%', :nombrePaciente, '%'))) AND " +
           "(:nombreMedico IS NULL OR LOWER(CONCAT(t.staffMedico.medico.nombre, ' ', t.staffMedico.medico.apellido)) LIKE LOWER(CONCAT('%', :nombreMedico, '%'))) AND " +
           "(:nombreEspecialidad IS NULL OR LOWER(t.staffMedico.medico.especialidad.nombre) LIKE LOWER(CONCAT('%', :nombreEspecialidad, '%'))) AND " +
           "(:nombreCentro IS NULL OR LOWER(t.consultorio.centroAtencion.nombre) LIKE LOWER(CONCAT('%', :nombreCentro, '%')))")
    Page<Turno> findByTextFilters(@Param("nombrePaciente") String nombrePaciente,
                                 @Param("nombreMedico") String nombreMedico,
                                 @Param("nombreEspecialidad") String nombreEspecialidad,
                                 @Param("nombreCentro") String nombreCentro,
                                 Pageable pageable);
}
