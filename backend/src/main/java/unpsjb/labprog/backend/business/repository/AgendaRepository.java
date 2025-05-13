package unpsjb.labprog.backend.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.Agenda;

@Repository
public interface AgendaRepository extends CrudRepository<Agenda, Integer>, PagingAndSortingRepository<Agenda, Integer> {
}
