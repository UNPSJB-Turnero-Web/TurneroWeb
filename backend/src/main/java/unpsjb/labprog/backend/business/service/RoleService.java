package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.RoleRepository;
import unpsjb.labprog.backend.model.Role;

/**
 * Servicio para gestionar los roles de usuario con la entidad Role unificada
 */
@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Asigna un rol a un usuario
     * @param dni DNI del usuario
     * @param roleName Nombre del rol (PACIENTE, MEDICO, etc.)
     * @param assignedBy Usuario que asigna el rol
     * @param comments Comentarios sobre la asignación
     * @return El rol creado o existente
     */
    @Transactional
    public Role assignRole(Long dni, String roleName, String assignedBy, String comments) {
        String roleNameUpper = roleName != null ? roleName.toUpperCase() : null;
        
        // Verificar si ya tiene el rol activo
        Optional<Role> existingRole = roleRepository.findByDniAndRoleNameAndActiveTrue(dni, roleNameUpper);
        if (existingRole.isPresent()) {
            return existingRole.get(); // Ya tiene el rol activo
        }

        // Crear nuevo rol usando factory method
        Role newRole = createRoleByName(dni, roleNameUpper);
        if (assignedBy != null) newRole.setAssignedBy(assignedBy);
        if (comments != null) newRole.setComments(comments);
        
        return roleRepository.save(newRole);
    }

    /**
     * Asigna un rol a un usuario (versión simplificada)
     */
    public Role assignRole(Long dni, String roleName) {
        return assignRole(dni, roleName, null, null);
    }

    /**
     * Factory method para crear roles usando los métodos estáticos
     */
    private Role createRoleByName(Long dni, String roleName) {
        if (roleName == null) {
            throw new IllegalArgumentException("El nombre del rol no puede ser nulo");
        }
        
        switch (roleName.toUpperCase()) {
            case Role.PACIENTE:
                return Role.createPacienteRole(dni);
            case Role.MEDICO:
                return Role.createMedicoRole(dni);
            case Role.ADMINISTRADOR:
                return Role.createAdministradorRole(dni);
            case Role.OPERARIO:
                return Role.createOperarioRole(dni);
            default:
                // Para roles personalizados
                return new Role(dni, roleName, roleName);
        }
    }

    /**
     * Remueve un rol específico de un usuario
     */
    @Transactional
    public boolean removeRole(Long dni, String roleName) {
        String roleNameUpper = roleName != null ? roleName.toUpperCase() : null;
        Optional<Role> role = roleRepository.findByDniAndRoleNameAndActiveTrue(dni, roleNameUpper);
        if (role.isPresent()) {
            role.get().deactivate();
            roleRepository.save(role.get());
            return true;
        }
        return false;
    }

    /**
     * Remueve todos los roles de un usuario
     */
    @Transactional
    public int removeAllRoles(Long dni) {
        List<Role> activeRoles = roleRepository.findByDniAndActiveTrue(dni);
        for (Role role : activeRoles) {
            role.deactivate();
        }
        roleRepository.saveAll(activeRoles);
        return activeRoles.size();
    }

    /**
     * Obtiene todos los roles activos de un usuario
     */
    public List<Role> getUserRoles(Long dni) {
        return roleRepository.findByDniAndActiveTrueOrderByCreatedAtDesc(dni);
    }

    /**
     * Obtiene los nombres de roles activos de un usuario
     */
    public Set<String> getUserRoleNames(Long dni) {
        return roleRepository.findByDniAndActiveTrue(dni)
                .stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());
    }

    /**
     * Verifica si un usuario tiene un rol específico
     */
    public boolean hasRole(Long dni, String roleName) {
        String roleNameUpper = roleName != null ? roleName.toUpperCase() : null;
        return roleRepository.hasActiveRole(dni, roleNameUpper);
    }

    /**
     * Verifica si un usuario tiene al menos uno de los roles especificados
     */
    public boolean hasAnyRole(Long dni, String... roleNames) {
        if (roleNames == null || roleNames.length == 0) {
            return false;
        }
        
        Set<String> userRoles = getUserRoleNames(dni);
        for (String roleName : roleNames) {
            if (roleName != null && userRoles.contains(roleName.toUpperCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verifica si un usuario tiene todos los roles especificados
     */
    public boolean hasAllRoles(Long dni, String... roleNames) {
        if (roleNames == null || roleNames.length == 0) {
            return true;
        }
        
        Set<String> userRoles = getUserRoleNames(dni);
        for (String roleName : roleNames) {
            if (roleName == null || !userRoles.contains(roleName.toUpperCase())) {
                return false;
            }
        }
        return true;
    }

    /**
     * Obtiene todos los usuarios con un rol específico
     */
    public List<Role> getUsersByRole(String roleName) {
        String roleNameUpper = roleName != null ? roleName.toUpperCase() : null;
        return roleRepository.findByRoleNameAndActiveTrue(roleNameUpper);
    }

    /**
     * Obtiene todos los nombres de roles disponibles
     */
    public List<String> getAllRoleNames() {
        return roleRepository.findAllActiveRoleNames();
    }

    /**
     * Obtiene estadísticas de roles
     */
    public String getRoleStatistics() {
        List<Object[]> stats = roleRepository.getRoleStatistics();
        StringBuilder result = new StringBuilder("Estadísticas de Roles:\n");
        
        for (Object[] stat : stats) {
            String roleName = (String) stat[0];
            String displayName = (String) stat[1];
            Long count = (Long) stat[2];
            result.append(String.format("- %s (%s): %d usuarios\n", displayName, roleName, count));
        }
        
        return result.toString();
    }

    /**
     * Reactiva un rol previamente desactivado
     */
    @Transactional
    public boolean reactivateRole(Long dni, String roleName) {
        String roleNameUpper = roleName != null ? roleName.toUpperCase() : null;
        List<Role> roles = roleRepository.findByDni(dni);
        Optional<Role> inactiveRole = roles.stream()
                .filter(role -> roleNameUpper != null && 
                               role.getRoleName() != null && 
                               role.getRoleName().equalsIgnoreCase(roleNameUpper) && 
                               !role.getActive())
                .findFirst();

        if (inactiveRole.isPresent()) {
            inactiveRole.get().activate();
            roleRepository.save(inactiveRole.get());
            return true;
        }
        return false;
    }

    /**
     * Obtiene todos los roles (activos e inactivos) de un usuario
     */
    public List<Role> getAllUserRoles(Long dni) {
        return roleRepository.findByDniOrderByCreatedAtDesc(dni);
    }

    // ========================================
    // MÉTODOS DE CONVENIENCIA PARA ROLES ESPECÍFICOS
    // ========================================

    public Role assignPacienteRole(Long dni) {
        return assignRole(dni, Role.PACIENTE);
    }

    public Role assignPacienteRole(Long dni, String assignedBy) {
        return assignRole(dni, Role.PACIENTE, assignedBy, null);
    }

    public Role assignMedicoRole(Long dni) {
        return assignRole(dni, Role.MEDICO);
    }

    public Role assignMedicoRole(Long dni, String assignedBy) {
        return assignRole(dni, Role.MEDICO, assignedBy, null);
    }

    public Role assignAdministradorRole(Long dni) {
        return assignRole(dni, Role.ADMINISTRADOR);
    }

    public Role assignAdministradorRole(Long dni, String assignedBy) {
        return assignRole(dni, Role.ADMINISTRADOR, assignedBy, null);
    }

    public Role assignOperarioRole(Long dni) {
        return assignRole(dni, Role.OPERARIO);
    }

    public Role assignOperarioRole(Long dni, String assignedBy) {
        return assignRole(dni, Role.OPERARIO, assignedBy, null);
    }

    // Métodos de verificación específicos
    public boolean isPaciente(Long dni) {
        return hasRole(dni, Role.PACIENTE);
    }

    public boolean isMedico(Long dni) {
        return hasRole(dni, Role.MEDICO);
    }

    public boolean isAdministrador(Long dni) {
        return hasRole(dni, Role.ADMINISTRADOR);
    }

    public boolean isOperario(Long dni) {
        return hasRole(dni, Role.OPERARIO);
    }

    /**
     * Verifica si un usuario tiene permisos administrativos (ADMINISTRADOR u OPERARIO)
     */
    public boolean hasAdminPermissions(Long dni) {
        return hasAnyRole(dni, Role.ADMINISTRADOR, Role.OPERARIO);
    }

    /**
     * Verifica si un usuario está relacionado con el área médica (MEDICO u OPERARIO)
     */
    public boolean hasMedicalAccess(Long dni) {
        return hasAnyRole(dni, Role.MEDICO, Role.OPERARIO, Role.ADMINISTRADOR);
    }
}