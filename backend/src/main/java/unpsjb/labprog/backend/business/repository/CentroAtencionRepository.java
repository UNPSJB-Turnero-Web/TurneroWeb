package unpsjb.labprog.backend.business.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;

@Repository
public interface CentroAtencionRepository extends CrudRepository<CentroAtencion, Integer>, PagingAndSortingRepository<CentroAtencion, Integer> {

    

    @Query("SELECT c FROM CentroAtencion c WHERE UPPER(c.name) LIKE ?1")
    List<CentroAtencion> search(String term);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.name = ?1 AND c.direccion = ?2")
    boolean existsByNameAndDireccion(String name, String direccion);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.direccion = ?1")
    boolean existsByDireccion(String direccion);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.name = ?1")
    boolean existsByName(String name);


    CentroAtencion findByName(String centroNombre);



}