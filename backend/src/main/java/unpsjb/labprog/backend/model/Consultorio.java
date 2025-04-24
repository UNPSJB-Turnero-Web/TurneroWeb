package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Consultorio {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private int numero;

    private String nombre;

    @ManyToOne
    private CentroAtencion centroAtencion;
}
