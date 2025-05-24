package unpsjb.labprog.backend.model;

import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
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
    private Integer id;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false)
    private int intervalo;

    @ElementCollection
    private List<String> diasSemana;

    @ManyToOne(optional = false)
    private StaffMedico staffMedico;

    @ManyToOne(optional = false)
    private CentroAtencion centroAtencion;

    @ManyToOne(optional = false)
    private Consultorio consultorio;

    @OneToMany(mappedBy = "esquemaTurno", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Agenda> agendas;
}
