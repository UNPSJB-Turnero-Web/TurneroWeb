package unpsjb.labprog.backend.business.repository;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.StaffMedico;
@Repository

public interface DisponibilidadMedicoRepository extends JpaRepository<DisponibilidadMedico, Integer> {

    @Query("SELECT COUNT(d) > 0 FROM DisponibilidadMedico d " +
           "JOIN d.diaSemana ds " +
           "WHERE d.staffMedico = :staffMedico " +
           "AND d.horaInicio = :horaInicio " +
           "AND d.horaFin = :horaFin " +
           "AND ds IN :diaSemana")
    boolean existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
        @Param("staffMedico") StaffMedico staffMedico,
        @Param("diaSemana") List<String> diaSemana,
        @Param("horaInicio") LocalTime horaInicio,
        @Param("horaFin") LocalTime horaFin
    );
}