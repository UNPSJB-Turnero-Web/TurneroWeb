package unpsjb.labprog.backend.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class CentroAtencion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String localidad;

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @OneToMany(mappedBy = "centro", cascade = CascadeType.PERSIST)
    private List<StaffMedico> staffMedico; // Relación con StaffMedico

    public void agregarConsultorio(Consultorio consultorio) {
        if (this.staffMedico == null) {
            throw new IllegalStateException("El centro no tiene staff médico asociado.");
        }
        consultorio.setCentroAtencion(this);
    }
}
