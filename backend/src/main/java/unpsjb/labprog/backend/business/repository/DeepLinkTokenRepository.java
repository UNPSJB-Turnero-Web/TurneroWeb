package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.DeepLinkToken;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DeepLinkTokenRepository extends JpaRepository<DeepLinkToken, Long> {
    
    /**
     * Buscar token por su valor
     */
    Optional<DeepLinkToken> findByToken(String token);
    
    /**
     * Buscar token válido (no usado y no expirado)
     */
    @Query("SELECT d FROM DeepLinkToken d WHERE d.token = :token AND d.usado = false AND d.fechaExpiracion > :now")
    Optional<DeepLinkToken> findValidToken(String token, LocalDateTime now);
    
    /**
     * Eliminar tokens expirados
     */
    @Modifying
    @Query("DELETE FROM DeepLinkToken d WHERE d.fechaExpiracion < :now")
    void deleteExpiredTokens(LocalDateTime now);
    
    /**
     * Eliminar tokens usados antiguos (más de 7 días)
     */
    @Modifying
    @Query("DELETE FROM DeepLinkToken d WHERE d.usado = true AND d.fechaCreacion < :date")
    void deleteOldUsedTokens(LocalDateTime date);
}
