

package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unpsjb.labprog.backend.model.User;

/**
 * Servicio para orquestar el registro completo de usuarios en el sistema.
 * Se encarga de coordinar la creación de usuarios para autenticación y 
 * las entidades específicas para lógica de negocio.
 */
@Service
@Transactional
public class RegistrationService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    

    
    


    /**
     * Registra un nuevo médico con auditoría (creado por ADMIN)
     * Solo crea el usuario para autenticación, la entidad médico se crea en MedicoService
     * 
     * @param email email del médico
     * @param plainPassword contraseña en texto plano
     * @param dni DNI del médico
     * @param nombre nombre del médico
     * @param apellido apellido del médico
     * @param telefono teléfono del médico
     * @param performedBy usuario que registra al médico (ADMIN)
     * @return User entidad del usuario creado
     * @throws IllegalArgumentException si los datos son inválidos o ya existe el usuario
     */
    public User registrarMedicoWithAudit(String email, String plainPassword, Long dni, 
                                        String nombre, String apellido, String telefono,
                                        String performedBy) {
        
        // 1. Validar datos básicos
        validateBasicData(email, dni, nombre, apellido);
        
        // 2. Hashear la contraseña con BCrypt
        String hashedPassword = hashPassword(plainPassword);
        
        // 3. Crear User para autenticación con auditoría
        User user = userService.createUserWithAudit(nombre, apellido, dni, email, hashedPassword, 
                                                   telefono, "Medico", performedBy);
        
        return user;
    }

    
     public User registrarPaciente(String email, String password, Long dniAsLong, String nombre, String apellido,
            String telefono) {
        return registrarPacienteWithAudit(email, password, dniAsLong, nombre, apellido, telefono, "AUTO REGISTRO");
    }
    
    /**
     * Registra un nuevo paciente con auditoría (creado por ADMIN/OPERADOR)
     * Solo crea el usuario para autenticación, la entidad paciente se crea en PacienteService
     * 
     * @param email email del paciente
     * @param plainPassword contraseña en texto plano
     * @param dni DNI del paciente
     * @param nombre nombre del paciente
     * @param apellido apellido del paciente
     * @param telefono teléfono del paciente
     * @param performedBy usuario que registra al paciente (ADMIN/OPERADOR)
     * @return User entidad del usuario creado
     * @throws IllegalArgumentException si los datos son inválidos o ya existe el usuario
     */
    public User registrarPacienteWithAudit(String email, String plainPassword, Long dni,
                                          String nombre, String apellido, String telefono,
                                          String performedBy) {
        
        // 1. Validar datos básicos
        validateBasicData(email, dni, nombre, apellido);
        
        // 2. Hashear la contraseña
        String hashedPassword = hashPassword(plainPassword);
        
        // 3. Crear User para autenticación con auditoría
        User user = userService.createUserWithAudit(nombre, apellido, dni, email, hashedPassword, 
                                                   telefono, "Paciente", performedBy);
        
        return user;
    }

        /**
     * Registra un nuevo operador en el sistema
     * Crea el usuario para autenticación con rol OPERADOR
     * @param email email del operador
     * @param plainPassword contraseña en texto plano (generada automáticamente)
     * @param dni DNI del operador
     * @param nombre nombre del operador
     * @param apellido apellido del operador
     * @param telefono teléfono del operador
     * @return User entidad del usuario creado
     * @throws IllegalArgumentException si los datos son inválidos o ya existe el usuario
     */
    public User registrarOperador(String email, String plainPassword, Long dni,
                                  String nombre, String apellido, String telefono) {
        return registrarOperadorWithAudit(email, plainPassword, dni, nombre, apellido, telefono, "ADMIN");
    }

    /**
     * Registra un nuevo operador con auditoría
     * @param email email del operador
     * @param plainPassword contraseña en texto plano
     * @param dni DNI del operador
     * @param nombre nombre del operador
     * @param apellido apellido del operador
     * @param telefono teléfono del operador
     * @param performedBy usuario que registra al operador
     * @return User entidad del usuario creado
     */
    public User registrarOperadorWithAudit(String email, String plainPassword, Long dni,
                                          String nombre, String apellido, String telefono, String performedBy) {
        // Validar datos básicos
        validateBasicData(email, dni, nombre, apellido);

        // Hashear la contraseña
        String hashedPassword = hashPassword(plainPassword);

        // Crear User para autenticación con rol OPERADOR usando auditoría
        User user = userService.createUserWithAudit(nombre, apellido, dni, email, hashedPassword, telefono, "Operador", performedBy);

        return user;
    }

    // ===============================
    // MÉTODOS PRIVADOS DE VALIDACIÓN
    // ===============================
    
    /**
     * Valida que los datos básicos estén correctos
     */
    private void validateBasicData(String email, Long dni, String nombre, String apellido) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email es requerido");
        }
        
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Formato de email inválido");
        }
        
        if (dni == null || dni <= 0) {
            throw new IllegalArgumentException("DNI es requerido y debe ser mayor a 0");
        }
        
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre es requerido");
        }
        
        if (apellido == null || apellido.trim().isEmpty()) {
            throw new IllegalArgumentException("Apellido es requerido");
        }
    }
    

    
    /**
     * Valida formato básico de email
     */
    private boolean isValidEmail(String email) {
        return email.contains("@") && email.contains(".");
    }
    
    /**
     * Hashea la contraseña usando BCrypt
     */
    private String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Contraseña es requerida");
        }
        
        if (plainPassword.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        
        return passwordEncoder.encode(plainPassword);
    }
    
    // ===============================
    // MÉTODOS DE INFORMACIÓN
    // ===============================
    
    /**
     * Verifica si un email ya está registrado en el sistema
     */
    public boolean existsByEmail(String email) {
        return userService.findByEmail(email).isPresent();
    }
    
    /**
     * Verifica si un DNI ya está registrado en el sistema
     */
    public boolean existsByDni(Long dni) {
        return userService.findByDni(dni).isPresent();
    }



   
}
