package unpsjb.labprog.backend.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.ObraSocial;

@Repository
public interface ObraSocialRepository extends CrudRepository<ObraSocial, Integer>, PagingAndSortingRepository<ObraSocial, Integer> {
}