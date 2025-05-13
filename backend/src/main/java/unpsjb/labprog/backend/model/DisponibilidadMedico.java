package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class DisponibilidadMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String diaSemana; // Ej: Lunes, Martes, etc.

    @Column(nullable = false)
    private LocalTime horaInicio; // Hora de inicio

    @Column(nullable = false)
    private LocalTime horaFin; // Hora de fin

    @ManyToOne(optional = false)
    private StaffMedico staffMedico; // Relación con StaffMedico
}