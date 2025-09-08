package unpsjb.labprog.backend.business.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Operador;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {

    boolean existsByDni(Long dni);

    Optional<Operador> findByDni(Long dni);

    Optional<Operador> findByEmail(String email);

}