package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.AccountActivationToken;
import unpsjb.labprog.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de tokens de activación de cuenta.
 */
@Repository
public interface AccountActivationTokenRepository extends JpaRepository<AccountActivationToken, Long> {
    
    /**
     * Busca un token de activación por su valor y que no haya sido usado
     */
    Optional<AccountActivationToken> findByTokenAndUsedFalse(String token);
    
    /**
     * Busca un token de activación por su valor
     */
    Optional<AccountActivationToken> findByToken(String token);
    
    /**
     * Obtiene todos los tokens de un usuario
     */
    List<AccountActivationToken> findByUser(User user);
    
    /**
     * Obtiene tokens activos (no usados y no expirados) de un usuario
     */
    @Query("SELECT t FROM AccountActivationToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now")
    List<AccountActivationToken> findActiveTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    /**
     * Cuenta tokens activos de un usuario
     */
    @Query("SELECT COUNT(t) FROM AccountActivationToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now")
    int countActiveTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    /**
     * Elimina tokens expirados
     */
    @Modifying
    @Query("DELETE FROM AccountActivationToken t WHERE t.expiresAt < :cutoffTime")
    int deleteExpiredTokens(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Invalida (marca como usados) todos los tokens de un usuario
     */
    @Modifying
    @Query("UPDATE AccountActivationToken t SET t.used = true, t.usedAt = :now WHERE t.user = :user AND t.used = false")
    int invalidateAllUserTokens(@Param("user") User user, @Param("now") LocalDateTime now);
    
    /**
     * Busca tokens por usuario y estado
     */
    List<AccountActivationToken> findByUserAndUsed(User user, Boolean used);
    
    /**
     * Elimina todos los tokens de un usuario
     */
    void deleteByUser(User user);
}
