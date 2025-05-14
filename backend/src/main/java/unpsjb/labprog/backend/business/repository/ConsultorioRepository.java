package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

@Repository
public interface ConsultorioRepository extends JpaRepository<Consultorio, Integer> {

    List<Consultorio> findByCentroAtencion(CentroAtencion centro);

    List<Consultorio> findByCentroAtencionId(Long centroAtencionId);

    boolean existsByNumeroAndCentroAtencion(int numero, CentroAtencion centro);

    boolean existsByNameAndCentroAtencion(String name, CentroAtencion centro);

    List<Consultorio> findByNameContainingIgnoreCase(String term);
}
