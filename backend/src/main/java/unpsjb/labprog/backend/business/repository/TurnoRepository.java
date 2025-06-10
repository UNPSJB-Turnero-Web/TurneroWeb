package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Integer> {
    boolean existsByFechaAndHoraInicioAndStaffMedico_Consultorio_CentroAtencion(
            LocalDate fecha, LocalTime horaInicio, CentroAtencion centroAtencion);

    boolean existsByStaffMedico_IdAndEstado(Integer staffMedicoId, EstadoTurno estado);

    boolean existsByFechaAndHoraInicioAndStaffMedicoId(LocalDate fecha, LocalTime horaInicio, Integer staffMedicoId);

    // Verificar si existe un turno activo (no cancelado) en un slot específico
    boolean existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
        LocalDate fecha, LocalTime horaInicio, Integer staffMedicoId, EstadoTurno estado);

    // Buscar turnos por paciente ID
    List<Turno> findByPaciente_Id(Integer pacienteId);

}
