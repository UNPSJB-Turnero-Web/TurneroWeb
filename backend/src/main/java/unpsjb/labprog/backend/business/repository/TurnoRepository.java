package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.criteria.JoinType;
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
    
    List<Turno> findByStaffMedico_Especialidad_Id(Integer especialidadId);
    Page<Turno> findByStaffMedico_Especialidad_Id(Integer especialidadId, Pageable pageable);
    
    List<Turno> findByConsultorio_CentroAtencion_Id(Integer centroId);
    Page<Turno> findByConsultorio_CentroAtencion_Id(Integer centroId, Pageable pageable);
    
    List<Turno> findByConsultorio_Id(Integer consultorioId);
    Page<Turno> findByConsultorio_Id(Integer consultorioId, Pageable pageable);
    
    // Filtros por fecha
    List<Turno> findByFechaBetween(LocalDate fechaDesde, LocalDate fechaHasta);
    Page<Turno> findByFechaBetween(LocalDate fechaDesde, LocalDate fechaHasta, Pageable pageable);
    
    List<Turno> findByFecha(LocalDate fecha);
    Page<Turno> findByFecha(LocalDate fecha, Pageable pageable);
    
    // === CONSULTAS USANDO SPECIFICATIONS (Solucionan problemas con PostgreSQL y parámetros null) ===
    
    // Los métodos que usan Specifications están implementados automáticamente por JpaSpecificationExecutor
    // Se usan desde el service con repository.findAll(specification, pageable)
    
    // === CONSULTAS LEGACY (DEPRECATED - mantener por compatibilidad) ===
    // Estas consultas pueden fallar con PostgreSQL cuando hay parámetros null
    
    @Query("SELECT t FROM Turno t WHERE " +
           "(:estado IS NULL OR t.estado = :estado) AND " +
           "(:pacienteId IS NULL OR t.paciente.id = :pacienteId) AND " +
           "(:staffMedicoId IS NULL OR t.staffMedico.id = :staffMedicoId) AND " +
           "(:especialidadId IS NULL OR t.staffMedico.especialidad.id = :especialidadId) AND " +
           "(:centroId IS NULL OR t.consultorio.centroAtencion.id = :centroId) AND " +
           "(:consultorioId IS NULL OR t.consultorio.id = :consultorioId) AND " +
           "(:fechaDesde IS NULL OR t.fecha >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR t.fecha <= :fechaHasta)")
    Page<Turno> findByFiltersLegacy(@Param("estado") EstadoTurno estado,
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
           "(:especialidadId IS NULL OR t.staffMedico.especialidad.id = :especialidadId) AND " +
           "(:centroId IS NULL OR t.consultorio.centroAtencion.id = :centroId) AND " +
           "(:consultorioId IS NULL OR t.consultorio.id = :consultorioId) AND " +
           "(:fechaDesde IS NULL OR t.fecha >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR t.fecha <= :fechaHasta)")
    List<Turno> findByFiltersForExportLegacy(@Param("estado") EstadoTurno estado,
                                            @Param("pacienteId") Integer pacienteId,
                                            @Param("staffMedicoId") Integer staffMedicoId,
                                            @Param("especialidadId") Integer especialidadId,
                                            @Param("centroId") Integer centroId,
                                            @Param("consultorioId") Integer consultorioId,
                                            @Param("fechaDesde") LocalDate fechaDesde,
                                            @Param("fechaHasta") LocalDate fechaHasta);
    
    // Búsquedas por texto (nombres parciales)
    @Query("SELECT t FROM Turno t " +
           "LEFT JOIN t.paciente p " +
           "LEFT JOIN t.staffMedico sm " +
           "LEFT JOIN sm.medico m " +
           "LEFT JOIN sm.especialidad e " +
           "LEFT JOIN t.consultorio c " +
           "LEFT JOIN c.centroAtencion ca " +
           "WHERE " +
           "(:nombrePaciente IS NULL OR LOWER(CONCAT(p.nombre, ' ', p.apellido)) LIKE LOWER(CONCAT('%', :nombrePaciente, '%'))) AND " +
           "(:nombreMedico IS NULL OR LOWER(CONCAT(m.nombre, ' ', m.apellido)) LIKE LOWER(CONCAT('%', :nombreMedico, '%'))) AND " +
           "(:nombreEspecialidad IS NULL OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :nombreEspecialidad, '%'))) AND " +
           "(:nombreCentro IS NULL OR LOWER(ca.nombre) LIKE LOWER(CONCAT('%', :nombreCentro, '%')))")
    Page<Turno> findByTextFilters(@Param("nombrePaciente") String nombrePaciente,
                                 @Param("nombreMedico") String nombreMedico,
                                 @Param("nombreEspecialidad") String nombreEspecialidad,
                                 @Param("nombreCentro") String nombreCentro,
                                 Pageable pageable);

    // === SPECIFICATIONS PARA BÚSQUEDAS DINÁMICAS ===
    // Estos métodos estáticos generan Specification<Turno> para evitar problemas con PostgreSQL y parámetros null

    /**
     * Filtro por estado del turno
     */
    static Specification<Turno> hasEstado(EstadoTurno estado) {
        return (root, query, criteriaBuilder) -> {
            if (estado == null) {
                return null; // No aplicar filtro
            }
            return criteriaBuilder.equal(root.get("estado"), estado);
        };
    }

    /**
     * Filtro por ID del paciente
     */
    static Specification<Turno> hasPacienteId(Integer pacienteId) {
        return (root, query, criteriaBuilder) -> {
            if (pacienteId == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("paciente").get("id"), pacienteId);
        };
    }

    /**
     * Filtro por ID del staff médico
     */
    static Specification<Turno> hasStaffMedicoId(Integer staffMedicoId) {
        return (root, query, criteriaBuilder) -> {
            if (staffMedicoId == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("staffMedico").get("id"), staffMedicoId);
        };
    }

    /**
     * Filtro por ID de especialidad
     */
    static Specification<Turno> hasEspecialidadId(Integer especialidadId) {
        return (root, query, criteriaBuilder) -> {
            if (especialidadId == null) {
                return null;
            }
            return criteriaBuilder.equal(
                root.join("staffMedico", JoinType.INNER)
                    .join("medico", JoinType.INNER)
                    .join("especialidad", JoinType.INNER)
                    .get("id"), 
                especialidadId
            );
        };
    }

    /**
     * Filtro por ID de centro de atención
     */
    static Specification<Turno> hasCentroId(Integer centroId) {
        return (root, query, criteriaBuilder) -> {
            if (centroId == null) {
                return null;
            }
            return criteriaBuilder.equal(
                root.join("consultorio", JoinType.INNER)
                    .join("centroAtencion", JoinType.INNER)
                    .get("id"), 
                centroId
            );
        };
    }

    /**
     * Filtro por ID de consultorio
     */
    static Specification<Turno> hasConsultorioId(Integer consultorioId) {
        return (root, query, criteriaBuilder) -> {
            if (consultorioId == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("consultorio").get("id"), consultorioId);
        };
    }

    /**
     * Filtro por fecha desde (mayor o igual)
     */
    static Specification<Turno> hasFechaDesde(LocalDate fechaDesde) {
        return (root, query, criteriaBuilder) -> {
            if (fechaDesde == null) {
                return null;
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("fecha"), fechaDesde);
        };
    }

    /**
     * Filtro por fecha hasta (menor o igual)
     */
    static Specification<Turno> hasFechaHasta(LocalDate fechaHasta) {
        return (root, query, criteriaBuilder) -> {
            if (fechaHasta == null) {
                return null;
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("fecha"), fechaHasta);
        };
    }

    /**
     * Filtro por fecha exacta
     */
    static Specification<Turno> hasFechaExacta(LocalDate fechaExacta) {
        return (root, query, criteriaBuilder) -> {
            if (fechaExacta == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("fecha"), fechaExacta);
        };
    }

    /**
     * Filtro por nombre del paciente (búsqueda parcial)
     */
    static Specification<Turno> hasNombrePaciente(String nombrePaciente) {
        return (root, query, criteriaBuilder) -> {
            if (nombrePaciente == null || nombrePaciente.trim().isEmpty()) {
                return null;
            }
            String searchPattern = "%" + nombrePaciente.toLowerCase() + "%";
            return criteriaBuilder.like(
                criteriaBuilder.lower(
                    criteriaBuilder.concat(
                        criteriaBuilder.concat(root.get("paciente").get("nombre"), " "),
                        root.get("paciente").get("apellido")
                    )
                ),
                searchPattern
            );
        };
    }

    /**
     * Filtro por nombre del médico (búsqueda parcial)
     */
    static Specification<Turno> hasNombreMedico(String nombreMedico) {
        return (root, query, criteriaBuilder) -> {
            if (nombreMedico == null || nombreMedico.trim().isEmpty()) {
                return null;
            }
            String searchPattern = "%" + nombreMedico.toLowerCase() + "%";
            return criteriaBuilder.like(
                criteriaBuilder.lower(
                    criteriaBuilder.concat(
                        criteriaBuilder.concat(
                            root.join("staffMedico", JoinType.LEFT)
                                .join("medico", JoinType.LEFT)
                                .get("nombre"), 
                            " "
                        ),
                        root.join("staffMedico", JoinType.LEFT)
                            .join("medico", JoinType.LEFT)
                            .get("apellido")
                    )
                ),
                searchPattern
            );
        };
    }

    /**
     * Filtro por nombre de especialidad (búsqueda parcial)
     */
    static Specification<Turno> hasNombreEspecialidad(String nombreEspecialidad) {
        return (root, query, criteriaBuilder) -> {
            if (nombreEspecialidad == null || nombreEspecialidad.trim().isEmpty()) {
                return null;
            }
            String searchPattern = "%" + nombreEspecialidad.toLowerCase() + "%";
            return criteriaBuilder.like(
                criteriaBuilder.lower(
                    root.join("staffMedico", JoinType.LEFT)
                        .join("medico", JoinType.LEFT)
                        .join("especialidad", JoinType.LEFT)
                        .get("nombre")
                ),
                searchPattern
            );
        };
    }

    /**
     * Filtro por nombre del centro de atención (búsqueda parcial)
     */
    static Specification<Turno> hasNombreCentro(String nombreCentro) {
        return (root, query, criteriaBuilder) -> {
            if (nombreCentro == null || nombreCentro.trim().isEmpty()) {
                return null;
            }
            String searchPattern = "%" + nombreCentro.toLowerCase() + "%";
            return criteriaBuilder.like(
                criteriaBuilder.lower(
                    root.join("consultorio", JoinType.LEFT)
                        .join("centroAtencion", JoinType.LEFT)
                        .get("nombre")
                ),
                searchPattern
            );
        };
    }

    /**
     * Combina todas las especificaciones usando AND
     */
    static Specification<Turno> buildSpecification(EstadoTurno estado, 
                                                   Integer pacienteId,
                                                   Integer staffMedicoId,
                                                   Integer especialidadId,
                                                   Integer centroId,
                                                   Integer consultorioId,
                                                   LocalDate fechaDesde,
                                                   LocalDate fechaHasta,
                                                   LocalDate fechaExacta,
                                                   String nombrePaciente,
                                                   String nombreMedico,
                                                   String nombreEspecialidad,
                                                   String nombreCentro) {
        
        Specification<Turno> spec = Specification.where(null);
        
        // Si hay fecha exacta, usar solo esa (ignora desde/hasta)
        if (fechaExacta != null) {
            spec = spec.and(hasFechaExacta(fechaExacta));
        } else {
            // Usar rango de fechas
            spec = spec.and(hasFechaDesde(fechaDesde));
            spec = spec.and(hasFechaHasta(fechaHasta));
        }
        
        // Agregar otros filtros
        spec = spec.and(hasEstado(estado));
        spec = spec.and(hasPacienteId(pacienteId));
        spec = spec.and(hasStaffMedicoId(staffMedicoId));
        spec = spec.and(hasEspecialidadId(especialidadId));
        spec = spec.and(hasCentroId(centroId));
        spec = spec.and(hasConsultorioId(consultorioId));
        spec = spec.and(hasNombrePaciente(nombrePaciente));
        spec = spec.and(hasNombreMedico(nombreMedico));
        spec = spec.and(hasNombreEspecialidad(nombreEspecialidad));
        spec = spec.and(hasNombreCentro(nombreCentro));
        
        return spec;
    }
}
