package unpsjb.labprog.backend.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad Agenda simplificada - solo para agendas normales operacionales.
 * Las configuraciones excepcionales (feriados, mantenimientos) se manejan 
 * en ConfiguracionExcepcional.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private LocalDate fecha;              // Día de la agenda
    private LocalTime horaInicio;         // Hora real de inicio (si difiere del esquema)
    private LocalTime horaFin;            // Hora real de fin (si difiere del esquema)
    private Integer tiempoTolerancia;     // Minutos permitidos de atraso
    
    // Campo para tiempo de sanitización específico de esta agenda
    private Integer tiempoSanitizacion;   // Si es diferente al del esquema
    
    private boolean habilitado = true;
    private String motivoInhabilitacion;

    @ManyToOne
    private EsquemaTurno esquemaTurno;    // Siempre requerido
}