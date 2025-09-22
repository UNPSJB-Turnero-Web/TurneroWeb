package unpsjb.labprog.backend.business.service;

import unpsjb.labprog.backend.model.Role;

import java.util.HashSet;
import java.util.Set;

/**
 * Clase utilitaria para gestionar la jerarquía de roles del sistema.
 * Centraliza la lógica de herencia y permisos de roles.
 */
public class RoleHierarchy {

    /**
     * Verifica si el rol concedido tiene acceso al rol requerido.
     * Es decir, si el rol concedido incluye o hereda del rol requerido.
     *
     * @param granted el rol que se concede (ej: ADMINISTRADOR)
     * @param required el rol requerido (ej: PACIENTE)
     * @return true si granted tiene acceso a required, false en caso contrario
     */
    public static boolean hasRole(Role granted, Role required) {
        if (granted == null || required == null) {
            return false;
        }
        return granted.hasAccessTo(required);
    }

    /**
     * Obtiene todos los roles heredados por el rol especificado (recursivamente).
     * Incluye tanto los roles directamente heredados como los heredados indirectamente.
     *
     * @param role el rol del cual obtener los roles heredados
     * @return un conjunto inmutable de todos los roles heredados
     */
    public static Set<Role> getAllInheritedRoles(Role role) {
        if (role == null) {
            return Set.of();
        }
        return role.getAllInheritedRoles();
    }

    /**
     * Verifica si un rol incluye directamente a otro rol.
     * No considera herencia recursiva, solo herencia directa.
     *
     * @param parent el rol padre
     * @param child el rol hijo
     * @return true si parent incluye directamente a child
     */
    public static boolean includesDirectly(Role parent, Role child) {
        if (parent == null || child == null) {
            return false;
        }
        return parent.includes(child);
    }

    /**
     * Obtiene la jerarquía completa de un rol, incluyendo el rol mismo
     * y todos sus roles heredados.
     *
     * @param role el rol base
     * @return conjunto con el rol y todos sus heredados
     */
    public static Set<Role> getRoleHierarchy(Role role) {
        if (role == null) {
            return Set.of();
        }
        Set<Role> hierarchy = new HashSet<>(role.getAllInheritedRoles());
        hierarchy.add(role);
        return Set.copyOf(hierarchy);
    }
}