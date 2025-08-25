package unpsjb.labprog.backend.presenter;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.RoleService;
import unpsjb.labprog.backend.dto.RoleDTO;
import unpsjb.labprog.backend.model.Role;

/**
 * Controlador REST para la gestión de roles (entidad unificada)
 */
@RestController
@RequestMapping("roles")
public class RolePresenter {

    @Autowired
    private RoleService roleService;

    // ========================================
    // ENDPOINTS PRINCIPALES
    // ========================================

    /**
     * Asigna un rol a un usuario
     * POST /roles/assign
     */
    @PostMapping("/assign")
    public ResponseEntity<Object> assignRole(@RequestBody RoleDTO request) {
        try {
            Role role = roleService.assignRole(
                request.getDni(),
                request.getRoleName(),
                request.getAssignedBy(),
                request.getComments()
            );
            return Response.ok(role, "Rol asignado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al asignar el rol: " + e.getMessage());
        }
    }

    /**
     * Obtiene todos los roles de un usuario
     * GET /roles/user/{dni}
     */
    @GetMapping("/user/{dni}")
    public ResponseEntity<Object> getUserRoles(@PathVariable Long dni) {
        try {
            List<Role> roles = roleService.getUserRoles(dni);
            return Response.ok(roles, "Roles obtenidos exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener los roles: " + e.getMessage());
        }
    }

    /**
     * Obtiene los nombres de roles de un usuario
     * GET /roles/user/{dni}/names
     */
    @GetMapping("/user/{dni}/names")
    public ResponseEntity<Object> getUserRoleNames(@PathVariable Long dni) {
        try {
            Set<String> roleNames = roleService.getUserRoleNames(dni);
            return Response.ok(roleNames, "Nombres de roles obtenidos exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener los nombres de roles: " + e.getMessage());
        }
    }

    /**
     * Verifica si un usuario tiene un rol específico
     * GET /roles/user/{dni}/has-role?roleName=PACIENTE
     */
    @GetMapping("/user/{dni}/has-role")
    public ResponseEntity<Object> hasRole(@PathVariable Long dni, @RequestParam String roleName) {
        try {
            boolean hasRole = roleService.hasRole(dni, roleName);
            return Response.ok(hasRole, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar el rol: " + e.getMessage());
        }
    }

    /**
     * Obtiene todos los usuarios con un rol específico
     * GET /roles/role/{roleName}/users
     */
    @GetMapping("/role/{roleName}/users")
    public ResponseEntity<Object> getUsersByRole(@PathVariable String roleName) {
        try {
            List<Role> users = roleService.getUsersByRole(roleName);
            return Response.ok(users, "Usuarios obtenidos exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener los usuarios: " + e.getMessage());
        }
    }

    /**
     * Remueve un rol específico de un usuario
     * DELETE /roles/user/{dni}/role/{roleName}
     */
    @DeleteMapping("/user/{dni}/role/{roleName}")
    public ResponseEntity<Object> removeRole(@PathVariable Long dni, @PathVariable String roleName) {
        try {
            boolean removed = roleService.removeRole(dni, roleName);
            if (removed) {
                return Response.ok(true, "Rol removido exitosamente");
            } else {
                return Response.notFound("Rol no encontrado o ya inactivo");
            }
        } catch (Exception e) {
            return Response.error(null, "Error al remover el rol: " + e.getMessage());
        }
    }

    /**
     * Remueve todos los roles de un usuario
     * DELETE /roles/user/{dni}/all
     */
    @DeleteMapping("/user/{dni}/all")
    public ResponseEntity<Object> removeAllRoles(@PathVariable Long dni) {
        try {
            int removedCount = roleService.removeAllRoles(dni);
            return Response.ok(removedCount, "Roles removidos exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al remover los roles: " + e.getMessage());
        }
    }

    /**
     * Reactiva un rol previamente desactivado
     * PUT /roles/user/{dni}/reactivate/{roleName}
     */
    @PutMapping("/user/{dni}/reactivate/{roleName}")
    public ResponseEntity<Object> reactivateRole(@PathVariable Long dni, @PathVariable String roleName) {
        try {
            boolean reactivated = roleService.reactivateRole(dni, roleName);
            if (reactivated) {
                return Response.ok(true, "Rol reactivado exitosamente");
            } else {
                return Response.notFound("Rol no encontrado para reactivar");
            }
        } catch (Exception e) {
            return Response.error(null, "Error al reactivar el rol: " + e.getMessage());
        }
    }

    /**
     * Obtiene estadísticas de roles
     * GET /roles/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Object> getRoleStatistics() {
        try {
            String statistics = roleService.getRoleStatistics();
            return Response.ok(statistics, "Estadísticas obtenidas exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener estadísticas: " + e.getMessage());
        }
    }

    /**
     * Obtiene todos los nombres de roles disponibles
     * GET /roles/names
     */
    @GetMapping("/names")
    public ResponseEntity<Object> getAllRoleNames() {
        try {
            List<String> roleNames = roleService.getAllRoleNames();
            return Response.ok(roleNames, "Nombres de roles obtenidos exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener nombres de roles: " + e.getMessage());
        }
    }

    // ========================================
    // ENDPOINTS DE CONVENIENCIA PARA ROLES ESPECÍFICOS
    // ========================================

    /**
     * Asigna rol de paciente
     * POST /roles/user/{dni}/paciente
     */
    @PostMapping("/user/{dni}/paciente")
    public ResponseEntity<Object> assignPacienteRole(@PathVariable Long dni, 
            @RequestParam(required = false) String assignedBy) {
        try {
            Role role = assignedBy != null ? 
                roleService.assignPacienteRole(dni, assignedBy) : 
                roleService.assignPacienteRole(dni);
            return Response.ok(role, "Rol de paciente asignado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al asignar rol de paciente: " + e.getMessage());
        }
    }

    /**
     * Asigna rol de médico
     * POST /roles/user/{dni}/medico
     */
    @PostMapping("/user/{dni}/medico")
    public ResponseEntity<Object> assignMedicoRole(@PathVariable Long dni, 
            @RequestParam(required = false) String assignedBy) {
        try {
            Role role = assignedBy != null ? 
                roleService.assignMedicoRole(dni, assignedBy) : 
                roleService.assignMedicoRole(dni);
            return Response.ok(role, "Rol de médico asignado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al asignar rol de médico: " + e.getMessage());
        }
    }

    /**
     * Asigna rol de administrador
     * POST /roles/user/{dni}/administrador
     */
    @PostMapping("/user/{dni}/administrador")
    public ResponseEntity<Object> assignAdministradorRole(@PathVariable Long dni, 
            @RequestParam(required = false) String assignedBy) {
        try {
            Role role = assignedBy != null ? 
                roleService.assignAdministradorRole(dni, assignedBy) : 
                roleService.assignAdministradorRole(dni);
            return Response.ok(role, "Rol de administrador asignado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al asignar rol de administrador: " + e.getMessage());
        }
    }

    /**
     * Asigna rol de operario
     * POST /roles/user/{dni}/operario
     */
    @PostMapping("/user/{dni}/operario")
    public ResponseEntity<Object> assignOperarioRole(@PathVariable Long dni, 
            @RequestParam(required = false) String assignedBy) {
        try {
            Role role = assignedBy != null ? 
                roleService.assignOperarioRole(dni, assignedBy) : 
                roleService.assignOperarioRole(dni);
            return Response.ok(role, "Rol de operario asignado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al asignar rol de operario: " + e.getMessage());
        }
    }

    // ========================================
    // ENDPOINTS DE VERIFICACIÓN ESPECÍFICA
    // ========================================

    /**
     * Verifica si es paciente
     * GET /roles/user/{dni}/is-paciente
     */
    @GetMapping("/user/{dni}/is-paciente")
    public ResponseEntity<Object> isPaciente(@PathVariable Long dni) {
        try {
            boolean isPaciente = roleService.isPaciente(dni);
            return Response.ok(isPaciente, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar si es paciente: " + e.getMessage());
        }
    }

    /**
     * Verifica si es médico
     * GET /roles/user/{dni}/is-medico
     */
    @GetMapping("/user/{dni}/is-medico")
    public ResponseEntity<Object> isMedico(@PathVariable Long dni) {
        try {
            boolean isMedico = roleService.isMedico(dni);
            return Response.ok(isMedico, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar si es médico: " + e.getMessage());
        }
    }

    /**
     * Verifica si es administrador
     * GET /roles/user/{dni}/is-administrador
     */
    @GetMapping("/user/{dni}/is-administrador")
    public ResponseEntity<Object> isAdministrador(@PathVariable Long dni) {
        try {
            boolean isAdministrador = roleService.isAdministrador(dni);
            return Response.ok(isAdministrador, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar si es administrador: " + e.getMessage());
        }
    }

    /**
     * Verifica si es operario
     * GET /roles/user/{dni}/is-operario
     */
    @GetMapping("/user/{dni}/is-operario")
    public ResponseEntity<Object> isOperario(@PathVariable Long dni) {
        try {
            boolean isOperario = roleService.isOperario(dni);
            return Response.ok(isOperario, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar si es operario: " + e.getMessage());
        }
    }

    /**
     * Verifica si tiene permisos administrativos
     * GET /roles/user/{dni}/has-admin-permissions
     */
    @GetMapping("/user/{dni}/has-admin-permissions")
    public ResponseEntity<Object> hasAdminPermissions(@PathVariable Long dni) {
        try {
            boolean hasAdmin = roleService.hasAdminPermissions(dni);
            return Response.ok(hasAdmin, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar permisos administrativos: " + e.getMessage());
        }
    }

    /**
     * Verifica si tiene acceso al área médica
     * GET /roles/user/{dni}/has-medical-access
     */
    @GetMapping("/user/{dni}/has-medical-access")
    public ResponseEntity<Object> hasMedicalAccess(@PathVariable Long dni) {
        try {
            boolean hasMedical = roleService.hasMedicalAccess(dni);
            return Response.ok(hasMedical, "Verificación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar acceso médico: " + e.getMessage());
        }
    }
}