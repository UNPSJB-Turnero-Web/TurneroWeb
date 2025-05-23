package unpsjb.labprog.backend.model;

import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
public class EsquemaTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false)
    private int intervalo; // Duración del turno en minutos

   
    @OneToMany(mappedBy = "esquemaTurno")
    @JsonManagedReference
    private List<Agenda> agendas;

    @ElementCollection
    private List<String> diasSemana;
    @ManyToOne
    @JsonIgnoreProperties("esquemasTurno")
    private DisponibilidadMedico disponibilidadMedico; 
    @ManyToOne
    private CentroAtencion centroAtencion;

    @ManyToOne
    private Consultorio consultorio;

}