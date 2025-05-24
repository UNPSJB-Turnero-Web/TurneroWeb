package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

public interface TurnoRepository extends JpaRepository<Turno, Integer> {
    boolean existsByFechaAndHoraInicioAndStaffMedico_Consultorio_CentroAtencion(
            LocalDate fecha, LocalTime horaInicio, CentroAtencion centroAtencion);

    boolean existsByStaffMedico_IdAndEstado(Integer staffMedicoId, EstadoTurno estado);

    List<Turno> findByAgenda_IdAndEstado(Integer agendaId, EstadoTurno estado);
}
