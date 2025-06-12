package unpsjb.labprog.backend.model;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Consultorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private String nombre; 

    @ManyToOne(optional = false)
    @JoinColumn(name = "centro_atencion_id", nullable = false)
    private CentroAtencion centroAtencion;

    // Horarios por defecto del consultorio
    private LocalTime horaAperturaDefault;
    private LocalTime horaCierreDefault;

    // Horarios específicos por día de la semana
    @ElementCollection
    @CollectionTable(name = "consultorio_horarios", joinColumns = @JoinColumn(name = "consultorio_id"))
    private List<HorarioConsultorio> horariosSemanales = new ArrayList<>();

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class HorarioConsultorio {
        @Column(nullable = false)
        private String diaSemana; // LUNES, MARTES, etc.
        
        private LocalTime horaApertura;
        private LocalTime horaCierre;
        
        @Column(nullable = false)
        private Boolean activo = true; // Para días que no atiende
        
        public HorarioConsultorio(String diaSemana, LocalTime horaApertura, LocalTime horaCierre, Boolean activo) {
            this.diaSemana = diaSemana;
            this.horaApertura = horaApertura;
            this.horaCierre = horaCierre;
            this.activo = activo;
        }
    }
}