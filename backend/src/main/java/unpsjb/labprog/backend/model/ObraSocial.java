package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ObraSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id; // Cambiar de int a Integer

    @Column(nullable = false)
    private String nombre;

    @Column(unique = true, nullable = false)
    private String codigo;
}