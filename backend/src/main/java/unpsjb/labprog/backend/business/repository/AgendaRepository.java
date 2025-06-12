package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Agenda;

@Repository
public interface AgendaRepository extends CrudRepository<Agenda, Integer>, PagingAndSortingRepository<Agenda, Integer> {
    List<Agenda> findByEsquemaTurno_StaffMedico_Consultorio_Id(Integer consultorioId);

    List<Agenda> findByEsquemaTurno_StaffMedico_Medico_Id(Integer medicoId);

    List<Agenda> findByEsquemaTurno_StaffMedico_Consultorio_IdAndEsquemaTurno_StaffMedico_Medico_Especialidad_IdAndHabilitadoTrue(
        Integer consultorioId, Integer especialidadId
    );
    
    // Nuevos métodos para días excepcionales y sanitización
    
    // Buscar agenda por fecha y esquema de turno
    Optional<Agenda> findByFechaAndEsquemaTurno_Id(LocalDate fecha, Integer esquemaTurnoId);
    
    // Verificar si existe una agenda de tipo específico para una fecha
    boolean existsByFechaAndTipoAgenda(LocalDate fecha, Agenda.TipoAgenda tipoAgenda);
    
    // Verificar si existe una agenda de tipo específico para una fecha y esquema específico
    boolean existsByFechaAndTipoAgendaAndEsquemaTurno_Id(LocalDate fecha, Agenda.TipoAgenda tipoAgenda, Integer esquemaTurnoId);
    
    // Buscar agendas de tipo específico para un rango de fechas
    List<Agenda> findByFechaBetweenAndTipoAgenda(LocalDate fechaInicio, LocalDate fechaFin, Agenda.TipoAgenda tipoAgenda);
    
    // Buscar agendas excepcionales por centro de atención
    List<Agenda> findByFechaBetweenAndTipoAgendaNotAndEsquemaTurno_CentroAtencion_Id(
        LocalDate fechaInicio, LocalDate fechaFin, Agenda.TipoAgenda tipoExcluir, Integer centroId);
    
    // Buscar agendas excepcionales por consultorio
    List<Agenda> findByFechaBetweenAndTipoAgendaNotAndEsquemaTurno_Consultorio_Id(
        LocalDate fechaInicio, LocalDate fechaFin, Agenda.TipoAgenda tipoExcluir, Integer consultorioId);
        
    // Buscar todas las agendas excepcionales (no normales) sin filtro de centro
    List<Agenda> findByFechaBetweenAndTipoAgendaNot(LocalDate fechaInicio, LocalDate fechaFin, Agenda.TipoAgenda tipoExcluir);
        
    // Buscar agendas por esquema de turno
    List<Agenda> findByEsquemaTurno_Id(Integer esquemaTurnoId);
}
