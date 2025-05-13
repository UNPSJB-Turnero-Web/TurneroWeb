package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.EsquemaTurno;

public interface EsquemaTurnoRepository extends JpaRepository<EsquemaTurno, Long> {
    boolean existsByNombre(String nombre);
}