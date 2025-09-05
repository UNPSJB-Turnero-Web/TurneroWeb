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

    /*
     * @Column(nullable = false)
     */ private String nombre;
    /*
     * @Column(nullable = false)
     */ private String apellido;

    @Column(unique = true, nullable = false)
    private Long dni;

    /*
     * @Column(nullable = false, unique = true)
     */ private String email;

    /*
     * @Column(nullable = false)
     */ private String hashedPassword; // Hash de la contraseña

    /*
     * @Column(nullable = false)
     */ private String telefono;

}