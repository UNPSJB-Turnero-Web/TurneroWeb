package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Agenda;

/**
 * Repositorio simplificado para Agenda - solo para agendas operacionales.
 * Las configuraciones excepcionales ahora se manejan en ConfiguracionExcepcionalRepository.
 */
@Repository
public interface AgendaRepository extends CrudRepository<Agenda, Integer>, PagingAndSortingRepository<Agenda, Integer> {
    
    // Métodos básicos para agendas operacionales
    List<Agenda> findByEsquemaTurno_StaffMedico_Consultorio_Id(Integer consultorioId);

    List<Agenda> findByEsquemaTurno_StaffMedico_Medico_Id(Integer medicoId);

    List<Agenda> findByEsquemaTurno_StaffMedico_Consultorio_IdAndEsquemaTurno_StaffMedico_Medico_Especialidad_IdAndHabilitadoTrue(
        Integer consultorioId, Integer especialidadId
    );
    
    // Buscar agenda por fecha y esquema de turno
    List<Agenda> findByFechaAndEsquemaTurno_Id(LocalDate fecha, Integer esquemaTurnoId);
        
    // Buscar agendas por esquema de turno
    List<Agenda> findByEsquemaTurno_Id(Integer esquemaTurnoId);
    
    // Buscar agendas por fecha
    List<Agenda> findByFecha(LocalDate fecha);
}
