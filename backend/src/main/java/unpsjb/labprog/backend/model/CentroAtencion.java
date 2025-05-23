package unpsjb.labprog.backend.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
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

    // Relación uno a muchos con StaffMedico
    @OneToMany(mappedBy = "centro", cascade = CascadeType.PERSIST)
    @JsonManagedReference
    private List<StaffMedico> staffMedico;

    // Relación uno a muchos con Consultorio
    @OneToMany(mappedBy = "centroAtencion", cascade = CascadeType.PERSIST)
    private List<Consultorio> consultorios;

    // Relación muchos a muchos con Especialidad
    @ManyToMany
    @JoinTable(
        name = "centro_especialidad",
        joinColumns = @JoinColumn(name = "centro_id"),
        inverseJoinColumns = @JoinColumn(name = "especialidad_id")
    )
    private Set<Especialidad> especialidades = new HashSet<>();
}
