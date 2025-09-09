package unpsjb.labprog.backend.model;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
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
    private List<DiaHorario> horarios = new ArrayList<>(); // Lista de días con horarios

    @ManyToOne(optional = false)
    @JsonBackReference
    private StaffMedico staffMedico; // Relación con StaffMedico

    @ManyToOne(optional = true)
    @JoinColumn(name = "especialidad_id")
    private Especialidad especialidad; // Relación con Especialidad
    
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class DiaHorario {
        private String dia; // Día de la semana (LUNES, MARTES, etc.)
        private LocalTime horaInicio; // Hora de inicio
        private LocalTime horaFin; // Hora de fin
    }
}