package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class DisponibilidadMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String diaSemana; // Ej: Lunes, Martes, etc.
    private String horaInicio;
    private String horaFin;

    @ManyToOne
    private StaffMedico staffMedico; // Relación con StaffMedico
}