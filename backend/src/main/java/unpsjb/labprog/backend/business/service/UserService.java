package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.UserRepository;
import unpsjb.labprog.backend.model.User;

/**
 * Servicio para la gestión de usuarios.
 * Implementa UserDetailsService para integración con Spring Security.
 */
@Service
@Transactional
public class UserService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    // TODO: Cuando esté disponible EncryptationService, descomentar:
    // @Autowired
    // private EncryptationService encryptationService;
    
    // ===============================
    // IMPLEMENTACIÓN DE UserDetailsService
    // ===============================
    
    /**
     * Carga un usuario por su email para autenticación con Spring Security
     * @param email email del usuario (username)
     * @return UserDetails del usuario encontrado
     * @throws UsernameNotFoundException si no se encuentra el usuario
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }
    
    // ===============================
    // MÉTODOS CRUD
    // ===============================
    
    /**
     * Busca un usuario por email
     * @param email email del usuario
     * @return Optional<User> usuario encontrado o vacío
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Busca un usuario por DNI
     * @param dni DNI del usuario
     * @return Optional<User> usuario encontrado o vacío
     */
    public Optional<User> findByDni(Long dni) {
        return userRepository.findByDni(dni);
    }
    
    /**
     * Crea un nuevo usuario (versión simplificada)
     * @param email email del usuario
     * @param hashedPassword contraseña ya hasheada
     * @param dni DNI del usuario
     * @param nombre nombre del usuario
     * @param apellido apellido del usuario
     * @param telefono teléfono del usuario
     * @return User usuario creado
     * @throws IllegalArgumentException si el usuario ya existe
     */
    public User createUser(String email, String hashedPassword, Long dni, String nombre, String apellido, String telefono) {
        // Verificar que no exista un usuario con el mismo email o DNI
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un usuario con el email: " + email);
        }
        
        if (userRepository.existsByDni(dni)) {
            throw new IllegalArgumentException("Ya existe un usuario con el DNI: " + dni);
        }
        
        // Crear el nuevo usuario
        User user = new User();
        user.setEmail(email);
        user.setDni(dni);
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setTelefono(telefono);
        user.setHashedPassword(hashedPassword);
        
        return userRepository.save(user);
    }
    
    /**
     * Actualiza la información básica de un usuario
     * @param userId ID del usuario
     * @param nombre nuevo nombre
     * @param apellido nuevo apellido
     * @param telefono nuevo teléfono
     * @return User usuario actualizado
     * @throws IllegalArgumentException si el usuario no existe
     */
    public User updateUserInfo(Long userId, String nombre, String apellido, String telefono) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));
        
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setTelefono(telefono);
        
        return userRepository.save(user);
    }
    
    /**
     * Obtiene todos los usuarios
     * @return List<User> lista de todos los usuarios
     */
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    /**
     * Obtiene todos los usuarios activos
     * @return List<User> lista de usuarios activos
     */
    public List<User> findActiveUsers() {
        return userRepository.findByEnabled(true);
    }
    
    /**
     * Deshabilita un usuario
     * @param userId ID del usuario
     * @throws IllegalArgumentException si el usuario no existe
     */
    public void disableUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));
        
        user.disable();
        userRepository.save(user);
    }
    
    /**
     * Habilita un usuario
     * @param userId ID del usuario
     * @throws IllegalArgumentException si el usuario no existe
     */
    public void enableUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));
        
        user.enable();
        userRepository.save(user);
    }
    
    /**
     * Elimina un usuario
     * @param userId ID del usuario
     * @throws IllegalArgumentException si el usuario no existe
     */
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + userId);
        }
        
        userRepository.deleteById(userId);
    }
}
