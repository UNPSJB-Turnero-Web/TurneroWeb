package unpsjb.labprog.backend.business.repository;

import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;

import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.StaffMedico;

public interface DisponibilidadMedicoRepository extends JpaRepository<DisponibilidadMedico, Integer> {
    boolean existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
        StaffMedico staffMedico, String diaSemana, LocalTime horaInicio, LocalTime horaFin);
}