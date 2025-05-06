package unpsjb.labprog.backend.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.StaffMedico;

@Repository
public interface StaffMedicoRepository extends CrudRepository<StaffMedico, Long>, PagingAndSortingRepository<StaffMedico, Long> {
    // Puedes agregar métodos personalizados si es necesario
}