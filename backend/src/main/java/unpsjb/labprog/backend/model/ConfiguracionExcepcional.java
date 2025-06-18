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

/**
 * Entidad para manejar configuraciones excepcionales (feriados, mantenimientos, etc.)
 * Separada de la entidad Agenda para simplificar la lógica y evitar duplicación.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionExcepcional {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private LocalDate fecha;
    
    @Enumerated(EnumType.STRING)
    private TipoExcepcion tipo;
    
    private String descripcion;
    
    // Para atención especial
    private LocalTime horaInicio;
    private LocalTime horaFin;
    
    // Para mantenimientos y atención especial
    private Integer duracion;
    
    // Relaciones opcionales
    @ManyToOne(optional = true)
    private CentroAtencion centroAtencion;  // NULL para feriados globales
    
    @ManyToOne(optional = true) 
    private Consultorio consultorio;        // Para mantenimientos específicos
    
    @ManyToOne(optional = true)
    private EsquemaTurno esquemaTurno;      // Para excepciones de esquemas específicos
    
    private boolean activo = true;

    public enum TipoExcepcion {
        FERIADO,           // Aplica a todo el sistema
        MANTENIMIENTO,     // Aplica a un consultorio específico
        ATENCION_ESPECIAL  // Horarios especiales para un esquema específico
    }
}
