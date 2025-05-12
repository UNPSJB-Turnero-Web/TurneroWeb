package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
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
    private Long DNI;
}