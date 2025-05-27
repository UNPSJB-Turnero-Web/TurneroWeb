package unpsjb.labprog.backend.model;

import jakarta.persistence.Column;
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

    @ManyToOne(optional = false)
    private Consultorio consultorio;

 
}
