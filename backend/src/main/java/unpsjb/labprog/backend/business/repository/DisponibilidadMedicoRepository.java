package unpsjb.labprog.backend.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.DisponibilidadMedico;

@Repository
public interface DisponibilidadMedicoRepository extends CrudRepository<DisponibilidadMedico, Long>, PagingAndSortingRepository<DisponibilidadMedico, Long> {
    // Puedes agregar métodos personalizados si es necesario
}