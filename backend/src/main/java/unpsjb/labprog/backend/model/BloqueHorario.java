package unpsjb.labprog.backend.model;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

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
public class BloqueHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private LocalDate fecha; // Puede ser null si es recurrente semanalmente

    private String diaSemana; // Opcional: "LUNES", "MARTES", etc. (si es recurrente)
    private boolean esUrgencia; 
    private LocalTime horaInicio;
    private LocalTime horaFin;

    private String motivo; // Ej: "Cirugía", "Sanitización", "Feriado", etc.

    @ManyToOne
    @JsonBackReference
    private Agenda agenda;
}