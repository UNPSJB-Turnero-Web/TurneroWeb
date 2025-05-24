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
    private Integer id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTurno estado;

    @ManyToOne(optional = false)
    private Paciente paciente;

    @ManyToOne(optional = false)
    private StaffMedico staffMedico;

    @ManyToOne(optional = false)
    private Agenda agenda;

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