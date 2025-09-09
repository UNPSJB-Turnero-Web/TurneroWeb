package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unpsjb.labprog.backend.business.repository.RoleRepository;
import unpsjb.labprog.backend.model.Role;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestionar los roles del sistema
 */
@Service
@Transactional
public class RoleService {
    
    @Autowired
    private RoleRepository roleRepository;
    
    /**
     * Obtiene o crea un rol por nombre
     */
    public Role getOrCreateRole(String roleName) {
        return roleRepository.findByNameIgnoreCase(roleName)
                .orElseGet(() -> createDefaultRole(roleName));
    }
    
    /**
     * Busca un rol por nombre
     */
    public Optional<Role> findByName(String name) {
        return roleRepository.findByNameIgnoreCase(name);
    }
    
    /**
     * Obtiene todos los roles activos
     */
    public List<Role> findAllActive() {
        return roleRepository.findActiveRolesOrderByName();
    }
    
    /**
     * Obtiene todos los roles
     */
    public List<Role> findAll() {
        return roleRepository.findAllOrderByName();
    }
    
    /**
     * Crea un nuevo rol
     */
    public Role createRole(String name, String displayName, String description) {
        if (roleRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ya existe un rol con el nombre: " + name);
        }
        
        Role role = new Role(name, displayName, description);
        return roleRepository.save(role);
    }
    
    /**
     * Actualiza un rol existente
     */
    public Role updateRole(Long id, String displayName, String description, Boolean active) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));
        
        if (displayName != null) {
            role.setDisplayName(displayName);
        }
        if (description != null) {
            role.setDescription(description);
        }
        if (active != null) {
            if (active) {
                role.activate();
            } else {
                role.deactivate();
            }
        }
        
        return roleRepository.save(role);
    }
    
    /**
     * Activa un rol
     */
    public Role activateRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));
        
        role.activate();
        return roleRepository.save(role);
    }
    
    /**
     * Desactiva un rol
     */
    public Role deactivateRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));
        
        role.deactivate();
        return roleRepository.save(role);
    }
    
    /**
     * Inicializa los roles por defecto del sistema
     */
    @Transactional
    public void initializeDefaultRoles() {
        createDefaultRoleIfNotExists(Role.PACIENTE, "Paciente", "Usuario paciente del sistema de turnos");
        createDefaultRoleIfNotExists(Role.MEDICO, "Médico", "Profesional médico del sistema");
        createDefaultRoleIfNotExists(Role.ADMINISTRADOR, "Administrador", "Administrador del sistema");
        createDefaultRoleIfNotExists(Role.OPERADOR, "Operador", "Operador del centro de atención");
    }
    
    /**
     * Crea un rol por defecto basado en el nombre
     */
    private Role createDefaultRole(String roleName) {
        String upperRoleName = roleName.toUpperCase(); 
        
        return switch (upperRoleName) {
            case Role.PACIENTE -> roleRepository.save(Role.createPacienteRole());
            case Role.MEDICO -> roleRepository.save(Role.createMedicoRole());
            case Role.ADMINISTRADOR -> roleRepository.save(Role.createAdministradorRole());
            case Role.OPERADOR -> roleRepository.save(Role.createOperarioRole());
            default -> roleRepository.save(new Role(upperRoleName, roleName, "Rol personalizado"));
        };
    }
    
    /**
     * Crea un rol por defecto si no existe
     */
    private void createDefaultRoleIfNotExists(String name, String displayName, String description) {
        if (!roleRepository.existsByNameIgnoreCase(name)) {
            Role role = new Role(name, displayName, description);
            roleRepository.save(role);
        }
    }
    
    /**
     * Busca roles por término de búsqueda
     */
    public List<Role> searchRoles(String searchTerm) {
        return roleRepository.findByNameContainingIgnoreCase(searchTerm);
    }
    
    /**
     * Verifica si un rol existe
     */
    public boolean existsByName(String name) {
        return roleRepository.existsByNameIgnoreCase(name);
    }
}
