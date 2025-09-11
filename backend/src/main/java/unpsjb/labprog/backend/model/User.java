package unpsjb.labprog.backend.model;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad centralizada para autenticación y gestión de usuarios.
 * Implementa UserDetails para integración con Spring Security.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User extends Persona implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    @Column(nullable = false)
    private String hashedPassword; // Hash de la contraseña para autenticación
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false)
    private Boolean accountNonExpired = true;
    
    @Column(nullable = false)
    private Boolean accountNonLocked = true;
    
    @Column(nullable = false)
    private Boolean credentialsNonExpired = true;
    
    // ===============================
    // MÉTODOS DE CONVENIENCIA
    // ===============================
    
    /**
     * Constructor de conveniencia para crear un usuario con rol por defecto (Paciente)
     */
    public User(String nombre, String apellido, Long dni, String email, String hashedPassword, String telefono) {
        this.setNombre(nombre);
        this.setApellido(apellido);
        this.setDni(dni);
        this.setEmail(email);
        this.hashedPassword = hashedPassword; // Asignar directamente al campo de User
        this.setTelefono(telefono);
        // El rol se debe asignar después de crear el usuario usando el RoleService
        this.enabled = true;
        this.accountNonExpired = true;
        this.accountNonLocked = true;
        this.credentialsNonExpired = true;
    }
    
    /**
     * Constructor de conveniencia para crear un usuario con rol específico
     */
    public User(String nombre, String apellido, Long dni, String email, String hashedPassword, String telefono, Role role) {
        this.setNombre(nombre);
        this.setApellido(apellido);
        this.setDni(dni);
        this.setEmail(email);
        this.hashedPassword = hashedPassword; // Asignar directamente al campo de User
        this.setTelefono(telefono);
        this.role = role;
        this.enabled = true;
        this.accountNonExpired = true;
        this.accountNonLocked = true;
        this.credentialsNonExpired = true;
    }
    
    /**
     * Deshabilita la cuenta del usuario
     */
    public void disable() {
        this.enabled = false;
    }
    
    /**
     * Habilita la cuenta del usuario
     */
    public void enable() {
        this.enabled = true;
    }
    
    /**
     * Bloquea la cuenta del usuario
     */
    public void lock() {
        this.accountNonLocked = false;
    }
    
    /**
     * Desbloquea la cuenta del usuario
     */
    public void unlock() {
        this.accountNonLocked = true;
    }
    
    /**
     * Marca las credenciales como expiradas
     */
    public void expireCredentials() {
        this.credentialsNonExpired = false;
    }
    
    /**
     * Renueva las credenciales
     */
    public void renewCredentials() {
        this.credentialsNonExpired = true;
    }
    
    /**
     * Marca la cuenta como expirada
     */
    public void expireAccount() {
        this.accountNonExpired = false;
    }
    
    /**
     * Renueva la cuenta
     */
    public void renewAccount() {
        this.accountNonExpired = true;
    }
    
    /**
     * Verifica si la cuenta está activa y habilitada para uso
     */
    public boolean isActive() {
        return enabled && accountNonExpired && accountNonLocked && credentialsNonExpired;
    }
    
    // ===============================
    // IMPLEMENTACIÓN DE UserDetails
    // ===============================
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role.getName() : "USER")));
    }
    
    @Override
    public String getPassword() {
        return this.hashedPassword; // Usar el campo hashedPassword propio de User
    }
    
    @Override
    public String getUsername() {
        return this.getEmail(); // Email como username
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Override
    public String toString() {
        return String.format("User{id=%d, dni=%d, email='%s', enabled=%s}", 
                           id, getDni(), getEmail(), enabled);
    }
}
