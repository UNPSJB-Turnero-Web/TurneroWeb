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
    
    /**
     * Indica si la cuenta está habilitada
     */
    @Column(nullable = false)
    private Boolean enabled = true;
    
    /**
     * Indica si la cuenta no ha expirado
     */
    @Column(nullable = false)
    private Boolean accountNonExpired = true;
    
    /**
     * Indica si la cuenta no está bloqueada
     */
    @Column(nullable = false)
    private Boolean accountNonLocked = true;
    
    /**
     * Indica si las credenciales no han expirado
     */
    @Column(nullable = false)
    private Boolean credentialsNonExpired = true;
    
    // ===============================
    // MÉTODOS DE CONVENIENCIA
    // ===============================
    
    /**
     * Constructor de conveniencia para crear un usuario
     */
    public User(String nombre, String apellido, Long dni, String email, String hashedPassword, String telefono) {
        this.setNombre(nombre);
        this.setApellido(apellido);
        this.setDni(dni);
        this.setEmail(email);
        this.setHashedPassword(hashedPassword);
        this.setTelefono(telefono);
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
        // TODO: Integrar con RoleService cuando esté disponible
        // Por ahora retorna rol básico USER
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    @Override
    public String getPassword() {
        return this.getHashedPassword(); // Usar el campo hashedPassword de Persona
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
