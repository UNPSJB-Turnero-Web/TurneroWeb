package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.Medico;

public interface MedicoRepository extends JpaRepository<Medico, Long> { // Cambiar a Long
    boolean existsByDni(Long dni);
    boolean existsByMatricula(String matricula);
}
