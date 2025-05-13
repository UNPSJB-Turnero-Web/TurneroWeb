package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.StaffMedico;

import java.time.LocalTime;

public interface DisponibilidadMedicoRepository extends JpaRepository<DisponibilidadMedico, Long> {
    boolean existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
        StaffMedico staffMedico, String diaSemana, LocalTime horaInicio, LocalTime horaFin);
}