package unpsjb.labprog.backend.config;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Interceptor simplificado para capturar información básica de auditoría.
 */
@Component
public class AuditInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, 
                           @NonNull HttpServletResponse response, 
                           @NonNull Object handler) {
        // Capturar solo el usuario actual
        String currentUser = extractUserFromRequest(request);
        AuditContext.setCurrentUser(currentUser);
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, 
                               @NonNull HttpServletResponse response, 
                               @NonNull Object handler, 
                               @Nullable Exception ex) {
        // Limpiar el contexto después de la request
        AuditContext.clear();
    }

    private String extractUserFromRequest(HttpServletRequest request) {
        // 1. Header personalizado
        String user = request.getHeader("X-User-ID");
        if (user != null && !user.trim().isEmpty()) {
            return user;
        }
        
        // 2. Parámetro de query
        user = request.getParameter("userId");
        if (user != null && !user.trim().isEmpty()) {
            return user;
        }
        
        // 3. JWT Token (simulado)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return "ADMIN"; // Por ahora retorna ADMIN por defecto
        }
        
        // 4. Sesión HTTP
        if (request.getSession(false) != null) {
            Object sessionUser = request.getSession().getAttribute("currentUser");
            if (sessionUser != null) {
                return sessionUser.toString();
            }
        }
        
        // Por defecto, usar ADMIN para operaciones administrativas
        String path = request.getRequestURI();
        if (path.contains("/turno/") && 
            (path.contains("/cancelar") || path.contains("/confirmar") || path.contains("/reagendar"))) {
            return "ADMIN";
        }
        
        return "SYSTEM";
    }
}
