package unpsjb.labprog.backend.business.service;

import org.springframework.stereotype.Service;
import unpsjb.labprog.backend.model.Turno;
import unpsjb.labprog.backend.model.EstadoTurno;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Servicio para validar operaciones sobre turnos y transiciones de estado
 */
@Service
public class TurnoValidationService {

    // Definir transiciones de estado válidas
    private static final Map<EstadoTurno, List<EstadoTurno>> VALID_TRANSITIONS = new HashMap<>();
    
    static {
        // PROGRAMADO puede ir a: CONFIRMADO, CANCELADO, REAGENDADO
        VALID_TRANSITIONS.put(EstadoTurno.PROGRAMADO, 
            Arrays.asList(EstadoTurno.CONFIRMADO, EstadoTurno.CANCELADO, EstadoTurno.REAGENDADO));
            
        // CONFIRMADO puede ir a: COMPLETO, CANCELADO, REAGENDADO
        VALID_TRANSITIONS.put(EstadoTurno.CONFIRMADO, 
            Arrays.asList(EstadoTurno.COMPLETO, EstadoTurno.CANCELADO, EstadoTurno.REAGENDADO));
            
        // REAGENDADO puede ir a: CONFIRMADO, CANCELADO
        VALID_TRANSITIONS.put(EstadoTurno.REAGENDADO, 
            Arrays.asList(EstadoTurno.CONFIRMADO, EstadoTurno.CANCELADO));
            
        // CANCELADO y COMPLETO son estados finales (no pueden cambiar)
        VALID_TRANSITIONS.put(EstadoTurno.CANCELADO, Arrays.asList());
        VALID_TRANSITIONS.put(EstadoTurno.COMPLETO, Arrays.asList());
    }

    /**
     * Valida si una transición de estado es válida
     */
    public boolean isValidStateTransition(EstadoTurno currentState, EstadoTurno newState) {
        if (currentState == null || newState == null) {
            return false;
        }
        
        List<EstadoTurno> validNextStates = VALID_TRANSITIONS.get(currentState);
        return validNextStates != null && validNextStates.contains(newState);
    }

    /**
     * Valida si un turno puede ser modificado
     */
    public boolean canTurnoBeModified(Turno turno) {
        if (turno == null) {
            return false;
        }
        
        // No se pueden modificar turnos cancelados o completados
        return turno.getEstado() != EstadoTurno.CANCELADO && 
               turno.getEstado() != EstadoTurno.COMPLETO;
    }

    /**
     * Valida si se requiere motivo para una transición específica
     */
    public boolean requiresReason(EstadoTurno currentState, EstadoTurno newState) {
        // Cancelaciones siempre requieren motivo
        if (newState == EstadoTurno.CANCELADO) {
            return true;
        }
        
        // Reagendamientos siempre requieren motivo
        if (newState == EstadoTurno.REAGENDADO) {
            return true;
        }
        
        return false;
    }

    /**
     * Valida permisos de usuario (simplificado - en producción integrar con sistema de autenticación)
     */
    public boolean hasPermissionToModifyTurno(String userId) {
        // Por ahora, permitir a todos los usuarios autenticados
        // En producción, verificar roles específicos como ADMIN, STAFF_MEDICO, etc.
        return userId != null && !userId.trim().isEmpty();
    }

    /**
     * Obtiene los estados válidos para una transición desde el estado actual
     */
    public List<EstadoTurno> getValidNextStates(EstadoTurno currentState) {
        return VALID_TRANSITIONS.getOrDefault(currentState, Arrays.asList());
    }

    /**
     * Valida motivo de cancelación
     */
    public boolean isValidCancellationReason(String reason) {
        return reason != null && reason.trim().length() >= 5; // Mínimo 5 caracteres
    }

    /**
     * Valida motivo de reagendamiento
     */
    public boolean isValidReschedulingReason(String reason) {
        return reason != null && reason.trim().length() >= 5; // Mínimo 5 caracteres
    }
}