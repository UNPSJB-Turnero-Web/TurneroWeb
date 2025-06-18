package unpsjb.labprog.backend.model;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class EsquemaTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne(optional = false)
    private DisponibilidadMedico disponibilidadMedico; // Relación con DisponibilidadMedico

    @Column(nullable = false)
    private int intervalo;

    @ManyToOne(optional = false)
    private StaffMedico staffMedico;

    @ManyToOne(optional = false)
    private CentroAtencion centroAtencion;

    @ManyToOne(optional = true)
    private Consultorio consultorio;

    // Nueva lista de horarios específicos para el esquema de turno
    @ElementCollection
    @CollectionTable(name = "esquema_turno_horarios", joinColumns = @JoinColumn(name = "esquema_turno_id"))
    private List<Horario> horarios = new ArrayList<>(); // Inicializar la lista

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Horario {
        @Column(nullable = false)
        private String dia; // Día de la semana (ejemplo: "LUNES")

        @Column(nullable = false)
        private LocalTime horaInicio;

        @Column(nullable = false)
        private LocalTime horaFin;
    }
}
