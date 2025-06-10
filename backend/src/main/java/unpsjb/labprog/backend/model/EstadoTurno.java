package unpsjb.labprog.backend.model;

public enum EstadoTurno {
    PROGRAMADO,    // Turno registrado sin confirmación del paciente
    CONFIRMADO,    // Turno aceptado y confirmado por el paciente
    CANCELADO,     // Turno anulado por el paciente o el sistema
    REAGENDADO     // Turno reprogramado para otra fecha y/u horario
}