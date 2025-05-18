package unpsjb.labprog.backend.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private StaffMedico staffMedico;

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
