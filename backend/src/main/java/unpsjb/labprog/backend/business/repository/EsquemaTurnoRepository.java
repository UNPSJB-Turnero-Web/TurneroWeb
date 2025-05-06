package unpsjb.labprog.backend.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.EsquemaTurno;

@Repository
public interface EsquemaTurnoRepository extends CrudRepository<EsquemaTurno, Long>, PagingAndSortingRepository<EsquemaTurno, Long> {
}