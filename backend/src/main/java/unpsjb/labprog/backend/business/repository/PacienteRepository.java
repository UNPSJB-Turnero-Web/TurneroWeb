package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Integer> {
    boolean existsByDni(Long dni);
}
