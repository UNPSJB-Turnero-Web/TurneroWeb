package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.PasswordResetToken;
import unpsjb.labprog.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de tokens de recuperación de contraseña
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    /**
     * Busca un token válido por su valor
     */
    Optional<PasswordResetToken> findByToken(String token);
    
    /**
     * Busca tokens válidos para un usuario específico
     */
    List<PasswordResetToken> findByUserAndUsedFalseAndExpiresAtAfter(User user, LocalDateTime now);
    
    /**
     * Busca tokens por usuario
     */
    List<PasswordResetToken> findByUser(User user);
    
    /**
     * Elimina tokens expirados (limpieza automática)
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * Invalida (marca como usado) todos los tokens activos de un usuario
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    void invalidateAllUserTokens(@Param("user") User user);
    
    /**
     * Cuenta tokens válidos para un usuario
     */
    @Query("SELECT COUNT(t) FROM PasswordResetToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now")
    long countValidTokensForUser(@Param("user") User user, @Param("now") LocalDateTime now);
}
