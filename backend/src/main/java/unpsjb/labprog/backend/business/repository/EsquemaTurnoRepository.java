package unpsjb.labprog.backend.business.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.EsquemaTurno;

@Repository
public interface EsquemaTurnoRepository extends JpaRepository<EsquemaTurno, Integer> {

    List<EsquemaTurno> findByStaffMedicoId(Integer staffMedicoId);

    @Query("SELECT e FROM EsquemaTurno e WHERE e.id = :id")
    Optional<EsquemaTurno> findById(@Param("id") Integer id);
}