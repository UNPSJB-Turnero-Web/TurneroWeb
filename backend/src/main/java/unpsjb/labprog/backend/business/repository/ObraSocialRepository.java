package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.ObraSocial;

public interface ObraSocialRepository extends JpaRepository<ObraSocial, Integer> {
    boolean existsByNombre(String nombre);
}