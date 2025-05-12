package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;

@Repository

public interface CentroAtencionRepository
        extends JpaRepository<CentroAtencion, Integer> {
    // heredas un List<CentroAtencion> findAll()
    

    @Query("SELECT c FROM CentroAtencion c WHERE UPPER(c.name) LIKE ?1")
    List<CentroAtencion> search(String term);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.name = ?1 AND c.direccion = ?2")
    boolean existsByNameAndDireccion(String name, String direccion);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.direccion = ?1")
    boolean existsByDireccion(String direccion);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.name = ?1")
    boolean existsByName(String name);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.direccion = ?1 AND c.id != ?2")
    boolean existsByDireccionAndIdNot(String direccion, int id);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.name = ?1 AND c.direccion = ?2 AND c.id != ?3")
    boolean existsByNameAndDireccionAndIdNot(String name, String direccion, int id);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.name = ?1 AND c.id != ?2")
    boolean existsByNameAndIdNot(String name, int id);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.latitud = ?1 AND c.longitud = ?2 AND c.id != ?3")
    boolean existsByCoordenadasAndIdNot(Double latitud, Double longitud, int id);

    CentroAtencion findByName(String centroNombre);



}