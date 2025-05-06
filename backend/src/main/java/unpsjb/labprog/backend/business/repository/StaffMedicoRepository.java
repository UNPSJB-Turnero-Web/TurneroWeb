package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.StaffMedico;

@Repository
public interface StaffMedicoRepository extends JpaRepository<StaffMedico, Long> {
    // Puedes agregar métodos personalizados si es necesario
}