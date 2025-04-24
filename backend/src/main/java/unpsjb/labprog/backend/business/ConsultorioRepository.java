package unpsjb.labprog.backend.business;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.CentroAtencion;

@Repository
public interface ConsultorioRepository extends CrudRepository<Consultorio, Integer> {

    List<Consultorio> findByCentroAtencion(CentroAtencion centro);

    boolean existsByNumeroAndCentroAtencion(int numero, CentroAtencion centro);

    boolean existsByNombreAndCentroAtencion(String nombre, CentroAtencion centro);
}
