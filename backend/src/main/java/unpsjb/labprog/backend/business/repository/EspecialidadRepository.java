package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.Especialidad;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {
    boolean existsByNombre(String nombre);

    // Verifica si existe una especialidad con el nombre (ignorando mayúsculas/minúsculas)
    boolean existsByNombreIgnoreCase(String nombre);

    // Verifica si existe una especialidad con el nombre (ignorando mayúsculas/minúsculas) excluyendo un ID específico
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, int id);
}
