package unpsjb.labprog.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidad para gestionar tokens de activación de cuenta.
 * Cada token permite activar una cuenta de usuario mediante email.
 */
@Entity
@Table(name = "account_activation_tokens")
@Getter
@Setter
@NoArgsConstructor
public class AccountActivationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Token único para la activación
     */
    @Column(nullable = false, unique = true, length = 64)
    private String token;
    
    /**
     * Usuario asociado al token
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * Fecha y hora de creación del token
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    /**
     * Fecha y hora de expiración del token
     */
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    /**
     * Indica si el token ya fue usado
     */
    @Column(nullable = false)
    private Boolean used = false;
    
    /**
     * Fecha y hora en que fue usado el token
     */
    private LocalDateTime usedAt;
    
    /**
     * Constructor para crear un nuevo token de activación
     */
    public AccountActivationToken(String token, User user, LocalDateTime expiresAt) {
        this.token = token;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.used = false;
    }
    
    /**
     * Verifica si el token ha expirado
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Verifica si el token es válido (no usado y no expirado)
     */
    public boolean isValid() {
        return !used && !isExpired();
    }
    
    /**
     * Marca el token como usado
     */
    public void markAsUsed() {
        this.used = true;
        this.usedAt = LocalDateTime.now();
    }
}
