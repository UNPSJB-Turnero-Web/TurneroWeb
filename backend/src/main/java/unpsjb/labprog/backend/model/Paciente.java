package unpsjb.labprog.backend.model;

import java.util.Date;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AttributeOverride(name = "dni", column = @Column(name = "dni", unique = true, nullable = false))
public class Paciente extends Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;


    private String nombre;
    private String apellido;
    private String email;
    private String telefono;

    @Temporal(TemporalType.DATE)
    private Date fechaNacimiento;

    @ManyToOne
    private ObraSocial obraSocial; 
}
