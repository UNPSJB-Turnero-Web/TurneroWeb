package unpsjb.labprog.backend.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Contexto de auditoría que obtiene automáticamente el usuario del token JWT
 * desde el SecurityContext de Spring Security
 */
public class AuditContext {

    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();

    /**
     * Obtiene el usuario actual desde el SecurityContext (JWT token)
     * Si no hay usuario autenticado, retorna null
     */
    public static String getCurrentUser() {
        // Primero verificar si hay un usuario establecido manualmente (para casos especiales)
        String manualUser = currentUser.get();
        if (manualUser != null) {
            return manualUser;
        }

        // Obtener usuario del SecurityContext (JWT)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                return ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                return (String) principal;
            }
        }

        return null;
    }

    /**
     * Establece manualmente el usuario actual (para casos especiales donde no hay JWT)
     * Útil para operaciones en background o testing
     */
    public static void setCurrentUser(String user) {
        currentUser.set(user);
    }

    /**
     * Limpia el usuario establecido manualmente
     */
    public static void clear() {
        currentUser.remove();
    }
}
