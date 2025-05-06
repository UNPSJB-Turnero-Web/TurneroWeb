package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Paciente extends Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nombre;
    private String apellido;
    private String email;
    private String telefono;

    @Temporal(TemporalType.DATE)
    private Date fechaNacimiento;

    @ManyToOne
    private ObraSocial obraSocial; // Relación con ObraSocial
}
