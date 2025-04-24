package unpsjb.labprog.backend.model;

import java.util.Calendar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private Calendar fechaHora; // Día y hora del turno

    @ManyToOne
    private Medico medico;

    @ManyToOne
    private CentroAtencion centroAtencion;  // Donde se da el turno

    // Opcional si ya lo tenés en Medico, pero puede usarse para turnos específicos
    @ManyToOne
    private Especialidad especialidad;
}
