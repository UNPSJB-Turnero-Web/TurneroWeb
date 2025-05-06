package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha; // Fecha del turno

    @Column(nullable = false)
    private LocalTime horaInicio; // Hora de inicio del turno

    @Column(nullable = false)
    private LocalTime horaFin; // Hora de fin del turno

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTurno estado; // Estado del turno (PENDIENTE, CONFIRMADO, CANCELADO)

    @ManyToOne
    private EsquemaTurno esquemaTurno; // Relación con EsquemaTurno

    @ManyToOne
    private Paciente paciente; // Relación con Paciente

    @ManyToOne
    private Medico medico; // Relación con Medico

    @ManyToOne
    private CentroAtencion centroAtencion; // Relación con CentroAtencion

    public void confirmarTurno() {
        if (this.estado != EstadoTurno.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden confirmar turnos en estado PENDIENTE.");
        }
        this.estado = EstadoTurno.CONFIRMADO;
    }

    public void cancelarTurno() {
        if (this.estado == EstadoTurno.CANCELADO) {
            throw new IllegalStateException("El turno ya está cancelado.");
        }
        this.estado = EstadoTurno.CANCELADO;
    }
}
