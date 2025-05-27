package unpsjb.labprog.backend.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private LocalDate fecha;              // Día de la agenda
    private LocalTime horaInicio;         // Hora real de inicio
    private LocalTime horaFin;            // Hora real de fin
    private Integer tiempoTolerancia;     // Minutos permitidos de atraso

    private boolean habilitado = true;
    private String motivoInhabilitacion;

    @ManyToOne(optional = false)
    private EsquemaTurno esquemaTurno;

    @OneToMany(mappedBy = "agenda", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<BloqueHorario> bloquesReservados;
}