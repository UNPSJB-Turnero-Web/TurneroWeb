package unpsjb.labprog.backend.business.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unpsjb.labprog.backend.business.repository.UserRepository;
import unpsjb.labprog.backend.model.User;

/**
 * Servicio unificado para la gestión de contraseñas.
 * Maneja tanto el cambio desde perfil como la recuperación por email.
 */
@Service
@Transactional
public class PasswordService {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private PasswordResetService passwordResetService; // Para flujo de recuperación
    
    @Autowired
    private AuditLogService auditLogService;
    
    // ===============================
    // CAMBIO DESDE PERFIL (Usuario autenticado)
    // ===============================
    
    /**
     * Cambia la contraseña de un usuario autenticado validando la contraseña actual.
     * 
     * @param userId ID del usuario
     * @param currentPassword contraseña actual (para validación)
     * @param newPassword nueva contraseña
     * @return true si el cambio fue exitoso
     * @throws IllegalArgumentException si la contraseña actual es incorrecta
     */
    public boolean changePasswordFromProfile(Long userId, String currentPassword, String newPassword) {
        // 1. Obtener usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));
        
        // 2. Validar contraseña actual
        if (!passwordEncoder.matches(currentPassword, user.getHashedPassword())) {
            logger.warn("Intento de cambio de contraseña con contraseña incorrecta para usuario ID: {}", userId);
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }
        
        // 3. Validar nueva contraseña
        validatePasswordStrength(newPassword);
        
        // 4. Actualizar contraseña
        String newHashedPassword = passwordEncoder.encode(newPassword);
        user.setHashedPassword(newHashedPassword);
        userRepository.save(user);
        
        // 5. Auditar cambio
        auditLogService.logPasswordChange(userId, user.getEmail(), "PROFILE_CHANGE", "Cambio desde perfil del usuario");
        
        logger.info("Contraseña cambiada exitosamente desde perfil para usuario ID: {}", userId);
        return true;
    }
    
    /**
     * Cambia la contraseña desde perfil con auditoría detallada.
     * 
     * @param userId ID del usuario
     * @param currentPassword contraseña actual
     * @param newPassword nueva contraseña
     * @param performedBy email del usuario que realiza el cambio (normalmente el mismo usuario)
     * @return true si el cambio fue exitoso
     */
    public boolean changePasswordFromProfileWithAudit(Long userId, String currentPassword, 
                                                     String newPassword, String performedBy) {
        boolean success = changePasswordFromProfile(userId, currentPassword, newPassword);
        
        if (success) {
            // Auditoría adicional si es necesaria
            logger.info("Cambio de contraseña desde perfil auditado. Usuario: {}, Realizado por: {}", 
                       userId, performedBy);
        }
        
        return success;
    }
    
    // ===============================
    // RECUPERACIÓN POR EMAIL (Usuario NO autenticado)
    // ===============================
    
    /**
     * Delega al PasswordResetService para recuperación por email.
     * Mantiene la compatibilidad con la lógica existente.
     */
    public void initiatePasswordRecovery(String email) {
        passwordResetService.initiatePasswordReset(email);
        logger.info("Proceso de recuperación iniciado para email: {}", email);
    }
    
    /**
     * Delega la validación de tokens al PasswordResetService.
     */
    public boolean validateRecoveryToken(String token) {
        return passwordResetService.validateResetToken(token);
    }
    
    /**
     * Delega el reset por token al PasswordResetService.
     */
    public boolean resetPasswordWithToken(String token, String newPassword) {
        return passwordResetService.resetPassword(token, newPassword);
    }
    
    // ===============================
    // MÉTODOS AUXILIARES
    // ===============================
    
    /**
     * Valida la fortaleza de la nueva contraseña.
     * 
     * @param password contraseña a validar
     * @throws IllegalArgumentException si la contraseña no cumple los criterios
     */
    private void validatePasswordStrength(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía");
        }
        
        if (password.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        
        // Aquí puedes agregar más validaciones de fortaleza si necesitas
        // Por ejemplo: mayúsculas, números, caracteres especiales, etc.
        
        // Ejemplo de validación más estricta:
        // if (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$")) {
        //     throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número");
        // }
    }
    
    
}
