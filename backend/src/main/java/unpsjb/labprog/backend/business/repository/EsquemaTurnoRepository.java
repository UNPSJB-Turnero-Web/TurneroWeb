package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.EsquemaTurno;

@Repository
public interface EsquemaTurnoRepository extends JpaRepository<EsquemaTurno, Long> {
    // Puedes agregar métodos personalizados si es necesario
}