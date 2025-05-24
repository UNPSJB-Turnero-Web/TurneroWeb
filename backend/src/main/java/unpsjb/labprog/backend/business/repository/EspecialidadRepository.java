package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Especialidad;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {
    boolean existsByNombre(String nombre);

    // Verifica si existe una especialidad con el nombre (ignorando
    // mayúsculas/minúsculas)
    boolean existsByNombreIgnoreCase(String nombre);

    Especialidad findByNombreIgnoreCase(String nombre);

    // Verifica si existe una especialidad con el nombre (ignorando
    // mayúsculas/minúsculas) excluyendo un ID específico
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);
    




}
