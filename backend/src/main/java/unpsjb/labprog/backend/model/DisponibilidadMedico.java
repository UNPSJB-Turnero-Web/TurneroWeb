package unpsjb.labprog.backend.model;

import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class DisponibilidadMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

     @ElementCollection
    private List<String> diaSemana; // Cambiado de String a List<String>

    @Column(nullable = false)
    private LocalTime horaInicio; // Hora de inicio

    @Column(nullable = false)
    private LocalTime horaFin; // Hora de fin

    @ManyToOne(optional = false)
    private StaffMedico staffMedico; // Relación con StaffMedico
}