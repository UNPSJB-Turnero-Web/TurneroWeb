package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.ObraSocial;

@Repository
public interface ObraSocialRepository extends JpaRepository<ObraSocial, Integer> {
    // Métodos personalizados si son necesarios
}