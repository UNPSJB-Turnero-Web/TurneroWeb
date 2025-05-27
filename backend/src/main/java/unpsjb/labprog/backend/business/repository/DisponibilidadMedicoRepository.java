package unpsjb.labprog.backend.business.repository;

import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.StaffMedico;

@Repository
public interface DisponibilidadMedicoRepository extends JpaRepository<DisponibilidadMedico, Integer> {

    @Query("SELECT COUNT(d) > 0 FROM DisponibilidadMedico d " +
           "JOIN d.horarios h " +
           "WHERE d.staffMedico = :staffMedico " +
           "AND h.dia = :dia " +
           "AND h.horaInicio = :horaInicio " +
           "AND h.horaFin = :horaFin")
    boolean existsByStaffMedicoAndHorariosDiaAndHorariosHoraInicioAndHorariosHoraFin(
        @Param("staffMedico") StaffMedico staffMedico,
        @Param("dia") String dia,
        @Param("horaInicio") LocalTime horaInicio,
        @Param("horaFin") LocalTime horaFin
    );


    @Query("SELECT COUNT(d) > 0 FROM DisponibilidadMedico d " +
       "JOIN d.horarios h " +
       "WHERE d.staffMedico = :staffMedico " +
       "AND h.dia = :dia " +
       "AND h.horaInicio = :horaInicio " +
       "AND h.horaFin = :horaFin " +
       "AND d.id <> :id")
boolean existsByStaffMedicoAndHorariosDiaAndHorariosHoraInicioAndHorariosHoraFinExcludingId(
    @Param("staffMedico") StaffMedico staffMedico,
    @Param("dia") String dia,
    @Param("horaInicio") LocalTime horaInicio,
    @Param("horaFin") LocalTime horaFin,
    @Param("id") Integer id
);
}