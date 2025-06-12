package unpsjb.labprog.backend.model;

import java.time.LocalDate;
import java.time.LocalTime;

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
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private LocalDate fecha;              // Día de la agenda
    private LocalTime horaInicio;         // Hora real de inicio
    private LocalTime horaFin;            // Hora real de fin
    private Integer tiempoTolerancia;     // Minutos permitidos de atraso
    
    // Nuevos campos para días excepcionales
    @Enumerated(EnumType.STRING)
    private TipoAgenda tipoAgenda = TipoAgenda.NORMAL;
    
    private String descripcionExcepcion;  // Para feriados, mantenimiento, etc.
    
    // Campo para tiempo de sanitización entre turnos
    private Integer tiempoSanitizacion = 0; // Minutos de sanitización

    private boolean habilitado = true;
    private String motivoInhabilitacion;

    @ManyToOne(optional = true)  // Permitir null para feriados
    private EsquemaTurno esquemaTurno;

    public enum TipoAgenda {
        NORMAL,
        FERIADO,
        ATENCION_ESPECIAL,
        MANTENIMIENTO
    }
}