package unpsjb.labprog.backend.config;

/**
 * Contexto simplificado para auditoría - solo maneja usuario actual
 */
public class AuditContext {
    
    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();
    
    public static void setCurrentUser(String user) {
        currentUser.set(user);
    }
    
    public static String getCurrentUser() {
        return currentUser.get(); // Retorna null si no hay usuario configurado
    }
    
    public static void clear() {
        currentUser.remove();
    }
}
