package unpsjb.labprog.backend.business.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.Medico;

public interface MedicoRepository extends JpaRepository<Medico, Long> { 
    boolean existsByDni(Long dni);

    boolean existsByMatricula(String matricula);

    Optional<Medico> findByDni(Long dni);

}
