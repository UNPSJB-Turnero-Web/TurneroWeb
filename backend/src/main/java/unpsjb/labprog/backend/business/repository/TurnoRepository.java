package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

public interface TurnoRepository extends JpaRepository<Turno, Long> {
    boolean existsByFechaAndHoraInicioAndCentroAtencion(LocalDate fecha, LocalTime horaInicio,
            CentroAtencion centroAtencion);


boolean existsByStaffMedico_IdAndEstado(Long staffMedicoId, EstadoTurno estado);
}
