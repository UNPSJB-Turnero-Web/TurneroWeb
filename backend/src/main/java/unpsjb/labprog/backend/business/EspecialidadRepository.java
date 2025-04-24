package unpsjb.labprog.backend.business;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.Especialidad;

@Repository
public interface EspecialidadRepository extends CrudRepository<Especialidad, Integer>, PagingAndSortingRepository<Especialidad, Integer> {
}
