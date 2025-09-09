package unpsjb.labprog.backend.business.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Medico;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Integer> { 
    boolean existsByDni(Long dni);
    boolean existsByMatricula(String matricula);
    boolean existsByEmail(String email);

    Optional<Medico> findByDni(Long dni);
    Optional<Medico> findByMatricula(String matricula);
    Optional<Medico> findByEmail(String email);
}
