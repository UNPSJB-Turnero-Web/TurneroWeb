package unpsjb.labprog.backend.config;

/**
 * Contexto simplificado para auditoría - solo maneja usuario actual
 */
public class AuditContext {
    
    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();
    
    public static void setCurrentUser(String user) {
        currentUser.set(user != null ? user : "SYSTEM");
    }
    
    public static String getCurrentUser() {
        String user = currentUser.get();
        return user != null ? user : "SYSTEM";
    }
    
    public static void clear() {
        currentUser.remove();
    }
}
