package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.Especialidad;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {
    boolean existsByNombre(String nombre);
}
