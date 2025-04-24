package unpsjb.labprog.backend.business;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.Medico;

@Repository
public interface MedicoRepository extends CrudRepository<Medico, Integer>, PagingAndSortingRepository<Medico, Integer> {
}
