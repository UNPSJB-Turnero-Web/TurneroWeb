package unpsjb.labprog.backend.business.repository;

import java.util.List;

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
}
