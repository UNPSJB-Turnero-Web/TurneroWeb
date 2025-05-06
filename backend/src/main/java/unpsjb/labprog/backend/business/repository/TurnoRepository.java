package unpsjb.labprog.backend.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.Turno;

@Repository
public interface TurnoRepository extends CrudRepository<Turno, Integer>, PagingAndSortingRepository<Turno, Integer> {
}
