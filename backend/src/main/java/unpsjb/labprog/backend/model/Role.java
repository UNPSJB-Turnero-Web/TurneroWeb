package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * Entidad para gestionar roles del sistema
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {
    
    // Constantes para los roles del sistema
    public static final String PACIENTE = "PACIENTE";
    public static final String MEDICO = "MEDICO";
    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String OPERADOR = "OPERADOR";
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String name;
    
    @Column(length = 100)
    private String displayName;
    
    @Column(length = 255)
    private String description;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    // ===============================
    // CONSTRUCTORES
    // ===============================
    
    public Role(String name, String displayName, String description) {
        this.name = name.toUpperCase();
        this.displayName = displayName;
        this.description = description;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }
    
    public Role(String name, String displayName) {
        this(name, displayName, null);
    }
    
    // ===============================
    // MÉTODOS FACTORY
    // ===============================
    
    public static Role createPacienteRole() {
        return new Role(PACIENTE, "Paciente", "Usuario paciente del sistema de turnos");
    }
    
    public static Role createMedicoRole() {
        return new Role(MEDICO, "Médico", "Profesional médico del sistema");
    }
    
    public static Role createAdministradorRole() {
        return new Role(ADMINISTRADOR, "Administrador", "Administrador del sistema");
    }
    
    public static Role createOperarioRole() {
        return new Role(OPERADOR, "Operador", "Operador del centro de atención");
    }
    
    // ===============================
    // MÉTODOS DE GESTIÓN
    // ===============================
    
    public void activate() {
        this.active = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return String.format("Role{id=%d, name='%s', displayName='%s', active=%s}", 
                           id, name, displayName, active);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Role role = (Role) obj;
        return name != null ? name.equals(role.name) : role.name == null;
    }
    
    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }
}
