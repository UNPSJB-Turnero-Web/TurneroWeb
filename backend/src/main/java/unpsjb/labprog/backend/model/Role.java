package unpsjb.labprog.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Role {

    public static final String PACIENTE = "PACIENTE";
    public static final String MEDICO = "MEDICO";
    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String OPERARIO = "OPERARIO";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long dni;

    @Column(nullable = false)
    private String roleName;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private Boolean active = true;

    @Column
    private String assignedBy;

    @Column
    private String comments;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    public Role(Long dni, String roleName, String displayName) {
        this.dni = dni;
        this.roleName = roleName != null ? roleName.toUpperCase() : null;
        this.displayName = displayName;
        this.active = true;
    }

    public static Role createPacienteRole(Long dni) {
        return new Role(dni, PACIENTE, "Paciente");
    }

    public static Role createMedicoRole(Long dni) {
        return new Role(dni, MEDICO, "Médico");
    }

    public static Role createAdministradorRole(Long dni) {
        return new Role(dni, ADMINISTRADOR, "Administrador");
    }

    public static Role createOperarioRole(Long dni) {
        return new Role(dni, OPERARIO, "Operario");
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.roleName != null) {
            this.roleName = this.roleName.toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.roleName != null) {
            this.roleName = this.roleName.toUpperCase();
        }
    }
}