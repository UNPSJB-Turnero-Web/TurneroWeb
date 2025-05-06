package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.Turno;

import java.time.LocalDate;
import java.time.LocalTime;
import unpsjb.labprog.backend.model.CentroAtencion;

public interface TurnoRepository extends JpaRepository<Turno, Long> {
    boolean existsByFechaAndHoraAndCentroAtencion(LocalDate fecha, LocalTime hora, CentroAtencion centroAtencion);
}
