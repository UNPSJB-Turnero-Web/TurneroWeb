package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Especialidad;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.StaffMedico;

public interface StaffMedicoRepository extends JpaRepository<StaffMedico, Long> {
    boolean existsByMedicoAndCentro(Medico medico, CentroAtencion centro);

    List<StaffMedico> findByCentroId(Long centroId);

    boolean existsByMedicoAndCentroAndEspecialidad(Medico medico, CentroAtencion centro, Especialidad especialidad);

    StaffMedico findByMedicoAndCentroAndEspecialidad(Medico medico, CentroAtencion centro, Especialidad especialidad);

}