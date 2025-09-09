
/*
 * DEPRECATED (NO USAR)
 */






package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.RoleService;
import unpsjb.labprog.backend.model.Role;

import java.util.List;

/**
 * Controlador REST para la gestión de roles
 */
@RestController
@RequestMapping("/api/roles")
public class RoleController {
    
    @Autowired
    private RoleService roleService;
    
    /**
     * Obtiene todos los roles activos
     * GET /api/roles
     */
    @GetMapping
    public ResponseEntity<Object> getAllActiveRoles() {
        try {
            List<Role> roles = roleService.findAllActive();
            return Response.response(HttpStatus.OK, "Roles obtenidos exitosamente", roles);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al obtener roles: " + e.getMessage(), null);
        }
    }
    
    /**
     * Obtiene todos los roles (incluyendo inactivos)
     * GET /api/roles/all
     */
    @GetMapping("/all")
    public ResponseEntity<Object> getAllRoles() {
        try {
            List<Role> roles = roleService.findAll();
            return Response.response(HttpStatus.OK, "Roles obtenidos exitosamente", roles);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al obtener roles: " + e.getMessage(), null);
        }
    }
    
    /**
     * Busca un rol por nombre
     * GET /api/roles/search/{name}
     */
    @GetMapping("/search/{name}")
    public ResponseEntity<Object> getRoleByName(@PathVariable String name) {
        try {
            return roleService.findByName(name)
                .map(role -> Response.response(HttpStatus.OK, "Rol encontrado", role))
                .orElse(Response.response(HttpStatus.NOT_FOUND, "Rol no encontrado", null));
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al buscar rol: " + e.getMessage(), null);
        }
    }
    
    /**
     * Crea un nuevo rol
     * POST /api/roles
     */
    @PostMapping
    public ResponseEntity<Object> createRole(@RequestBody CreateRoleRequest request) {
        try {
            Role role = roleService.createRole(
                request.getName(), 
                request.getDisplayName(), 
                request.getDescription()
            );
            return Response.response(HttpStatus.CREATED, "Rol creado exitosamente", role);
        } catch (IllegalArgumentException e) {
            return Response.response(HttpStatus.BAD_REQUEST, 
                "Error de validación: " + e.getMessage(), null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al crear rol: " + e.getMessage(), null);
        }
    }
    
    /**
     * Actualiza un rol existente
     * PUT /api/roles/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateRole(@PathVariable Long id, 
                                           @RequestBody UpdateRoleRequest request) {
        try {
            Role role = roleService.updateRole(
                id, 
                request.getDisplayName(), 
                request.getDescription(), 
                request.getActive()
            );
            return Response.response(HttpStatus.OK, "Rol actualizado exitosamente", role);
        } catch (IllegalArgumentException e) {
            return Response.response(HttpStatus.NOT_FOUND, e.getMessage(), null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al actualizar rol: " + e.getMessage(), null);
        }
    }
    
    /**
     * Activa un rol
     * PUT /api/roles/{id}/activate
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<Object> activateRole(@PathVariable Long id) {
        try {
            Role role = roleService.activateRole(id);
            return Response.response(HttpStatus.OK, "Rol activado exitosamente", role);
        } catch (IllegalArgumentException e) {
            return Response.response(HttpStatus.NOT_FOUND, e.getMessage(), null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al activar rol: " + e.getMessage(), null);
        }
    }
    
    /**
     * Desactiva un rol
     * PUT /api/roles/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Object> deactivateRole(@PathVariable Long id) {
        try {
            Role role = roleService.deactivateRole(id);
            return Response.response(HttpStatus.OK, "Rol desactivado exitosamente", role);
        } catch (IllegalArgumentException e) {
            return Response.response(HttpStatus.NOT_FOUND, e.getMessage(), null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al desactivar rol: " + e.getMessage(), null);
        }
    }
    
    /**
     * Busca roles por término de búsqueda
     * GET /api/roles/search?term={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<Object> searchRoles(@RequestParam String term) {
        try {
            List<Role> roles = roleService.searchRoles(term);
            return Response.response(HttpStatus.OK, "Búsqueda completada", roles);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error en la búsqueda: " + e.getMessage(), null);
        }
    }
    
    /**
     * Inicializa los roles por defecto del sistema
     * POST /api/roles/initialize
     */
    @PostMapping("/initialize")
    public ResponseEntity<Object> initializeDefaultRoles() {
        try {
            roleService.initializeDefaultRoles();
            return Response.response(HttpStatus.OK, "Roles por defecto inicializados exitosamente", null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al inicializar roles: " + e.getMessage(), null);
        }
    }
    
    // ===============================
    // CLASES INTERNAS PARA REQUESTS
    // ===============================
    
    public static class CreateRoleRequest {
        private String name;
        private String displayName;
        private String description;
        
        // Getters y setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class UpdateRoleRequest {
        private String displayName;
        private String description;
        private Boolean active;
        
        // Getters y setters
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}
