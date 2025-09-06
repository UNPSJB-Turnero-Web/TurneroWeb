package unpsjb.labprog.backend.business.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.MedicoRepository;
import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.model.Especialidad;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.ObraSocial;
import unpsjb.labprog.backend.model.Paciente;

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
    
    @Autowired
    private MedicoRepository medicoRepository;
    
    @Autowired
    private PacienteRepository pacienteRepository;
    
    
    /**
     * Registra un nuevo médico en el sistema
     * Crea tanto el usuario para autenticación como la entidad médico para lógica de negocio
     * 
     * @param email email del médico
     * @param plainPassword contraseña en texto plano
     * @param dni DNI del médico
     * @param nombre nombre del médico
     * @param apellido apellido del médico
     * @param telefono teléfono del médico
     * @param matricula matrícula profesional del médico
     * @param especialidad especialidad médica
     * @return Medico entidad del médico creado
     * @throws IllegalArgumentException si los datos son inválidos o ya existe el usuario
     */
    public Medico registrarMedico(String email, String plainPassword, Long dni, 
                                 String nombre, String apellido, String telefono,
                                 String matricula, Especialidad especialidad) {
        
        // 1. Validar datos básicos
        validateBasicData(email, dni, nombre, apellido);
        validateMedicoData(matricula, especialidad);
        
        // 2. Hashear la contraseña con BCrypt
        String hashedPassword = hashPassword(plainPassword);
        
        // 3. Crear User para autenticación
        userService.createUser(nombre, apellido, dni, email, hashedPassword, telefono, "Medico");
        
        // 4. Crear Medico para lógica de negocio
        Medico medico = new Medico();
        medico.setNombre(nombre);
        medico.setApellido(apellido);
        medico.setDni(dni);
        medico.setEmail(email);
        medico.setHashedPassword(hashedPassword); // Misma contraseña hasheada
        medico.setTelefono(telefono);
        //medico.setMatricula(matricula);
        //medico.setEspecialidad(especialidad);
        
        // Validar que no exista médico con esa matrícula
        if (medicoRepository.existsByMatricula(matricula)) {
            throw new IllegalArgumentException("Ya existe un médico con la matrícula: " + matricula);
        }
        
        // Guardar médico usando el repository
        Medico savedMedico = medicoRepository.save(medico);
        
        // 5. Asignar rol (cuando esté disponible RoleService)
        // roleService.assignMedicoRole(dni, "REGISTRATION_SYSTEM");
        
        return savedMedico;
    }

    
    
    /**
     * Registra un nuevo paciente en el sistema
     * Crea tanto el usuario para autenticación como la entidad paciente para lógica de negocio
     * 
     * @param email email del paciente
     * @param plainPassword contraseña en texto plano
     * @param dni DNI del paciente
     * @param nombre nombre del paciente
     * @param apellido apellido del paciente
     * @param telefono teléfono del paciente
     * @param fechaNacimiento fecha de nacimiento del paciente
     * @param obraSocial obra social del paciente (puede ser null)
     * @return Paciente entidad del paciente creado
     * @throws IllegalArgumentException si los datos son inválidos o ya existe el usuario
     */
    public Paciente registrarPaciente(String email, String plainPassword, Long dni,
                                    String nombre, String apellido, String telefono,
                                    Date fechaNacimiento, ObraSocial obraSocial) {
        
        // 1. Validar datos básicos
        //validateBasicData(email, dni, nombre, apellido);
        //validatePacienteData(fechaNacimiento);
        
        // 2. Hashear la contraseña
        String hashedPassword = hashPassword(plainPassword);
        
        // 3. Crear User para autenticación
        userService.createUser(nombre, apellido, dni, email, hashedPassword, telefono, "Paciente");
        
        // 4. Crear Paciente para lógica de negocio
        Paciente paciente = new Paciente();
        paciente.setNombre(nombre);
        paciente.setApellido(apellido);
        paciente.setDni(dni);
        paciente.setEmail(email);
        paciente.setHashedPassword(hashedPassword);
        paciente.setTelefono(telefono);
        paciente.setFechaNacimiento(fechaNacimiento);
        paciente.setObraSocial(obraSocial);
        
        // Validar que no exista paciente con ese DNI
        if (pacienteRepository.existsByDni(dni)) {
            throw new IllegalArgumentException("Ya existe un paciente con el DNI: " + dni);
        }
        
        // Guardar paciente usando el repository
        Paciente savedPaciente = pacienteRepository.save(paciente);
        
        // 5. Asignar rol (cuando esté disponible RoleService)
        // roleService.assignPacienteRole(dni, "REGISTRATION_SYSTEM");
        
        return savedPaciente;
    }
    
    /**
     * Sobrecarga del metodo registrarPaciente sin obra social ni fecha de nacimiento, usado para el registro
     * 
     * @param email email del paciente
     * @param plainPassword contraseña en texto plano
     * @param dni DNI del paciente
     * @param nombre nombre del paciente
     * @param apellido apellido del paciente
     * @param telefono teléfono del paciente
     * @return Paciente entidad del paciente creado
     * @throws IllegalArgumentException si los datos son inválidos o ya existe el usuario
     */
    public Paciente registrarPaciente(String email, String plainPassword, Long dni,
                                    String nombre, String apellido, String telefono
                                    ) {
        
        // 1. Validar datos básicos
        validateBasicData(email, dni, nombre, apellido);
        //validatePacienteData(fechaNacimiento);
        
        // 2. Hashear la contraseña
        String hashedPassword = hashPassword(plainPassword);
        
        // 3. Crear User para autenticación
        userService.createUser(nombre, apellido, dni, email, hashedPassword, telefono, "Paciente");
        
        // 4. Crear Paciente para lógica de negocio
        Paciente paciente = new Paciente();
        paciente.setNombre(nombre);
        paciente.setApellido(apellido);
        paciente.setDni(dni);
        paciente.setEmail(email);
        paciente.setHashedPassword(hashedPassword);
        paciente.setTelefono(telefono);
        
        // Validar que no exista paciente con ese DNI
        if (pacienteRepository.existsByDni(dni)) {
            throw new IllegalArgumentException("Ya existe un paciente con el DNI: " + dni);
        }
        
        // Guardar paciente usando el repository
        Paciente savedPaciente = pacienteRepository.save(paciente);
        
        return savedPaciente;
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
     * Valida datos específicos de médico
     */
    private void validateMedicoData(String matricula, Especialidad especialidad) {
        if (matricula == null || matricula.trim().isEmpty()) {
            throw new IllegalArgumentException("Matrícula es requerida");
        }
        
        if (especialidad == null) {
            throw new IllegalArgumentException("Especialidad es requerida");
        }
    }
    
    /**
     * Valida datos específicos de paciente
     */
    private void validatePacienteData(Date fechaNacimiento) {
        if (fechaNacimiento == null) {
            throw new IllegalArgumentException("Fecha de nacimiento es requerida");
        }
        
        // Validar que no sea fecha futura
        if (fechaNacimiento.after(new Date())) {
            throw new IllegalArgumentException("La fecha de nacimiento no puede ser futura");
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
