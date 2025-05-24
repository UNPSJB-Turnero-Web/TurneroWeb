package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.EsquemaTurno;

public interface EsquemaTurnoRepository extends JpaRepository<EsquemaTurno, Integer> {

    List<EsquemaTurno> findByStaffMedicoId(Integer staffMedicoId);

}