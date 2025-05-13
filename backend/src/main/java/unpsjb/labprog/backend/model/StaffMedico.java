package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class StaffMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    private CentroAtencion centro; // Relación con CentroAtencion

    @ManyToOne
    private Medico medico; // Relación con Medico

    @OneToMany(mappedBy = "staffMedico", cascade = CascadeType.PERSIST)
    private List<DisponibilidadMedico> disponibilidad; // Relación con DisponibilidadMedico
}