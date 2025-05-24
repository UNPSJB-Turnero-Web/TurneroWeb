package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import unpsjb.labprog.backend.model.BloqueHorario;

public interface BloqueHorarioRepository extends CrudRepository<BloqueHorario, Integer> {
    List<BloqueHorario> findByAgendaId(Integer agendaId);
}