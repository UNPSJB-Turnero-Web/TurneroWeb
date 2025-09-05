package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Especialidad;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.StaffMedico;

@Repository
public interface StaffMedicoRepository extends JpaRepository<StaffMedico, Integer> {

    List<StaffMedico> findByCentroAtencionId(Integer centroId);

    boolean existsByMedicoAndCentroAtencionAndEspecialidad(Medico medico, CentroAtencion centro, Especialidad especialidad);

    StaffMedico findByMedicoAndCentroAtencionAndEspecialidad(Medico medico, CentroAtencion centroAtencion, Especialidad especialidad);

}