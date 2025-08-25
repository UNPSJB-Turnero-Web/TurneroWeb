package unpsjb.labprog.backend.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
public abstract class Persona {

    private String nombre;
    private String apellido;

    @Column(unique = true, nullable = false)
    private Long dni;

    @OneToMany(mappedBy = "dni")
    private List<Role> roles;
}