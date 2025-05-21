package unpsjb.labprog.backend.model;

import java.util.Calendar;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    private int id;

    private Calendar fechaHora; // Día y hora del turno
    private Integer tiempoTolerancia;
    private java.time.LocalTime horaInicio;
    private java.time.LocalTime horaFin;

    private boolean habilitado = true; // mantenimiento/sanitización
    private String motivoInhabilitacion; // mantenimiento, sanit
    @ManyToOne
    private Medico medico;

    @ManyToOne
    private CentroAtencion centroAtencion;

    @ManyToOne
    private Consultorio consultorio;

    @ManyToOne
    private Especialidad especialidad;

    @ManyToOne
    @JsonBackReference
    private EsquemaTurno esquemaTurno;
    
    @OneToMany(mappedBy = "agenda", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<BloqueHorario> bloquesReservados;

}
