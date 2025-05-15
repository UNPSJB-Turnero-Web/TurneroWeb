package unpsjb.labprog.backend.model;

import java.util.List;

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
public class StaffMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    private CentroAtencion centro; // Relación con CentroAtencion

    @ManyToOne
    private Medico medico; // Relación con Medico

    @ManyToOne
    private Especialidad especialidad; 

    @OneToMany(mappedBy = "staffMedico", cascade = CascadeType.PERSIST)
    private List<DisponibilidadMedico> disponibilidad; // Relación con DisponibilidadMedico
}