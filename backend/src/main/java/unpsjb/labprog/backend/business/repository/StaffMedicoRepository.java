package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.StaffMedico;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.CentroAtencion;

public interface StaffMedicoRepository extends JpaRepository<StaffMedico, Long> {
    boolean existsByMedicoAndCentro(Medico medico, CentroAtencion centro);
}