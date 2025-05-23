package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.EsquemaTurno;

public interface EsquemaTurnoRepository extends JpaRepository<EsquemaTurno, Long> {
    List<EsquemaTurno> findByDisponibilidadMedico_StaffMedico_Id(Long staffMedicoId);
}
