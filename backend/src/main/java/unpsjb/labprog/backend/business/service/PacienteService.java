package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.dto.ObraSocialDTO;
import unpsjb.labprog.backend.dto.PacienteDTO;
import unpsjb.labprog.backend.model.ObraSocial;
import unpsjb.labprog.backend.model.Paciente;
import unpsjb.labprog.backend.model.User;
import unpsjb.labprog.backend.model.AuditLog;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository repository;

    private static final Logger logger = LoggerFactory.getLogger(PacienteService.class);

    @Autowired
    private RegistrationService registrationService;



    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuditLogService auditLogService;

    public List<PacienteDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<PacienteDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    public Optional<PacienteDTO> findByDni(Integer dni) {
        return repository.findByDni(Long.valueOf(dni)).map(this::toDTO);
    }

    public Optional<PacienteDTO> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDTO);
    }

    @Transactional
    public PacienteDTO saveOrUpdate(PacienteDTO dto, String performedBy) {
        Paciente paciente = toEntity(dto);
        // validarPaciente(paciente);

        // Para testing: si no hay usuario autenticado, usar valor por defecto
        if (performedBy == null) {
            performedBy = "SYSTEM_TEST";
        }

        // Validaciones para evitar duplicados
        if (paciente.getId() == null || paciente.getId() == 0) {
            // CREACIÓN
            if (repository.existsByDni(paciente.getDni())) {
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }

            // Si es creado por ADMIN/OPERADOR (tiene performedBy), crear también el User
            if (dto.getPerformedBy() != null && !dto.getPerformedBy().trim().isEmpty()) {
                // Generar contraseña automática
                String password = dto.getPassword();
                if (password == null || password.trim().isEmpty()) {
                    password = generarPasswordAutomatica();
                }

                // 1. Crear usuario en la tabla User con auditoría
                registrationService.registrarPacienteWithAudit(
                        paciente.getEmail(),
                        password,
                        paciente.getDni(),
                        paciente.getNombre(),
                        paciente.getApellido(),
                        paciente.getTelefono(),
                        dto.getPerformedBy());

                // 2. Crear entidad paciente

                // Obtener obra social si se especifica
                if (dto.getObraSocialId() != null) {
                    //TODO 
                }
                
                Paciente pacienteCreado = repository.save(paciente);

                // 3. Enviar contraseña por mail
                enviarPasswordPorMail(paciente.getEmail(), password);

                return toDTO(pacienteCreado);
            } else {
                // Creación simple (solo entidad Paciente) - asume que el User ya existe
                // Esto ocurre cuando se llama desde AuthController después de crear el User
                
                // Verificar que no exista ya un paciente con este email
                if (repository.existsByEmail(paciente.getEmail())) {
                    throw new IllegalStateException("Ya existe un paciente con el email: " + paciente.getEmail());
                }
                
                // Obtener obra social si se especifica
                if (dto.getObraSocialId() != null) {
                    //TODO 
                }
                
                Paciente pacienteCreado = repository.save(paciente);
                return toDTO(pacienteCreado);
            }

        } else {
            // MODIFICACIÓN
            Paciente existente = repository.findById(paciente.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el paciente que se intenta modificar.");
            }

            if (!existente.getDni().equals(paciente.getDni()) &&
                    repository.existsByDni(paciente.getDni())) {
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }
            if (!existente.getEmail().equals(paciente.getEmail()) &&
                    repository.existsByEmail(paciente.getEmail())) {
                throw new IllegalStateException("Ya existe un paciente con el email: " + paciente.getEmail());
            }
            // No manejamos contraseña en la entidad paciente, solo en User
            
            // Actualizar también el User correspondiente si existe
            Optional<User> userOpt = userService.findByEmail(existente.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Actualizar los datos personales del usuario
                user.setNombre(paciente.getNombre());
                user.setApellido(paciente.getApellido());
                user.setEmail(paciente.getEmail());
                user.setTelefono(paciente.getTelefono());
                user.setDni(paciente.getDni());
                
                // Guardar el usuario actualizado
                userService.save(user);
            }
        }

        Paciente saved = repository.save(paciente);

        // 🎯 AUDITORÍA
        if (paciente.getId() == null) {
            auditLogService.logGenericAction(AuditLog.EntityTypes.PACIENTE, saved.getId().longValue(),
                                           AuditLog.Actions.CREATE, performedBy, null, "ACTIVO",
                                           null, saved, "Paciente creado");
        } else {
            auditLogService.logGenericAction(AuditLog.EntityTypes.PACIENTE, saved.getId().longValue(),
                                           AuditLog.Actions.UPDATE, performedBy, null, null,
                                           null, saved, "Paciente actualizado");
        }

        return toDTO(saved);
    }

    /**
     * Genera una contraseña automática segura para el paciente
     */
    private String generarPasswordAutomatica() {
        return java.util.UUID.randomUUID().toString().substring(0, 10);
    }

    /**
     * Envía la contraseña inicial por correo electrónico al paciente
     */
    private void enviarPasswordPorMail(String email, String password) {
        try {
            // Obtener el nombre del paciente desde el email o usar un nombre genérico
            String userName = email.split("@")[0];
            emailService.sendInitialCredentialsEmail(email, userName, password);
            logger.info("Credenciales iniciales enviadas por correo a paciente: {}", email);
        } catch (Exception e) {
            logger.error("Error al enviar credenciales iniciales por correo a paciente {}: {}", email, e.getMessage());
        }
    }

    public Page<PacienteDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    /**
     * Búsqueda paginada avanzada con filtros y ordenamiento
     * @param page Número de página (0-based)
     * @param size Tamaño de página
     * @param nombreApellido Filtro unificado para nombre O apellido (opcional)
     * @param documento Filtro por DNI (opcional)
     * @param email Filtro por email (opcional)
     * @param sortBy Campo para ordenar (opcional)
     * @param sortDir Dirección del ordenamiento (asc/desc, opcional)
     * @return Page<PacienteDTO> con los resultados paginados
     */
    public Page<PacienteDTO> findByPage(
            int page,
            int size,
            String nombreApellido,
            String documento,
            String email,
            String sortBy,
            String sortDir) {

        // Configurar ordenamiento
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Ejecutar consulta con filtros
        Page<Paciente> result = repository.findByFiltros(
            nombreApellido, documento, email, pageable);

        // Mapear a DTO
        return result.map(this::toDTO);
    }

    @Transactional
    public void delete(Integer id, String performedBy) {
        Paciente paciente = repository.findById(id).orElse(null);
        if (paciente == null) {
            throw new IllegalStateException("No existe un paciente con el ID: " + id);
        }

        // Para testing: si no hay usuario autenticado, usar valor por defecto
        if (performedBy == null) {
            performedBy = "SYSTEM_TEST";
        }

        // 🎯 AUDITORÍA
        auditLogService.logGenericAction(AuditLog.EntityTypes.PACIENTE, id.longValue(),
                                       AuditLog.Actions.DELETE, performedBy, "ACTIVO", "ELIMINADO",
                                       paciente, null, "Paciente eliminado");

        repository.deleteById(id);
    }

    private PacienteDTO toDTO(Paciente paciente) {
        PacienteDTO dto = new PacienteDTO();
        dto.setId(paciente.getId());
        dto.setNombre(paciente.getNombre());
        dto.setApellido(paciente.getApellido());
        dto.setDni(paciente.getDni());
        dto.setFechaNacimiento(paciente.getFechaNacimiento());
        dto.setEmail(paciente.getEmail());
        dto.setTelefono(paciente.getTelefono());

        // Mapear la relación con ObraSocial
        if (paciente.getObraSocial() != null) {
            ObraSocialDTO obraSocialDTO = new ObraSocialDTO();
            obraSocialDTO.setId(paciente.getObraSocial().getId());
            obraSocialDTO.setNombre(paciente.getObraSocial().getNombre());
            obraSocialDTO.setCodigo(paciente.getObraSocial().getCodigo());
            obraSocialDTO.setDescripcion(paciente.getObraSocial().getDescripcion());
            dto.setObraSocial(obraSocialDTO);
        }
        return dto;
    }

    private Paciente toEntity(PacienteDTO dto) {
        Paciente paciente = new Paciente();
        paciente.setId(dto.getId());
        paciente.setNombre(dto.getNombre());
        paciente.setApellido(dto.getApellido());
        paciente.setDni(dto.getDni());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setEmail(dto.getEmail());
        paciente.setTelefono(dto.getTelefono());

        if (dto.getObraSocial() != null) {
            ObraSocial obraSocial = new ObraSocial();
            obraSocial.setId(Integer.valueOf(dto.getObraSocial().getId()));
            obraSocial.setNombre(dto.getObraSocial().getNombre());
            obraSocial.setCodigo(dto.getObraSocial().getCodigo());
            obraSocial.setDescripcion(dto.getObraSocial().getDescripcion());
            paciente.setObraSocial(obraSocial);
        }
        return paciente;
    }

    /**
     * Sincronización automática de usuarios multi-rol en tabla pacientes.
     * 
     * Este método garantiza que todo usuario con rol MEDICO, OPERADOR o ADMINISTRADOR
     * tenga un registro correspondiente en la tabla pacientes, permitiendo que
     * puedan operar en el dashboard de pacientes y sacar turnos.
     * 
     * IMPORTANTE: 
     * - Es idempotente: puede llamarse múltiples veces sin crear duplicados
     * - Excluye usuarios con rol PACIENTE puro (ya deben estar creados)
     * - Utiliza DNI como identificador único primario, email como secundario
     * 
     * @param user Usuario autenticado que requiere sincronización
     * @return PacienteDTO con el ID del paciente (existente o creado)
     * @throws IllegalArgumentException si el usuario es null o no tiene datos básicos
     */
    @Transactional
    public PacienteDTO ensurePacienteExistsForUser(User user) {
        // Validaciones de entrada
        if (user == null) {
            throw new IllegalArgumentException("Usuario no puede ser null");
        }
        
        if (user.getRole() == null) {
            throw new IllegalArgumentException("Usuario debe tener un rol asignado");
        }

        logger.info("🔄 Iniciando sincronización de paciente para usuario: {} (rol: {})", 
                    user.getEmail(), user.getRole());

        // REGLA 1: Usuarios con rol PACIENTE puro no deben sincronizarse aquí
        // ya que su registro debe haberse creado al momento del alta de paciente
        if (user.getRole() == unpsjb.labprog.backend.model.Role.PACIENTE) {
            logger.debug("⏭️  Usuario con rol PACIENTE puro - se espera registro existente");
            // Buscar el paciente existente
            Optional<Paciente> existingPaciente = repository.findByEmail(user.getEmail());
            if (existingPaciente.isEmpty()) {
                logger.warn("⚠️  Usuario PACIENTE sin registro en tabla pacientes - posible inconsistencia de datos");
                // En este caso excepcional, crear el paciente
                return createPacienteFromUser(user, "SYSTEM_SYNC");
            }
            return toDTO(existingPaciente.get());
        }

        // REGLA 2: Buscar paciente existente por DNI (identificador más confiable)
        Optional<Paciente> pacienteByDni = Optional.empty();
        if (user.getDni() != null) {
            pacienteByDni = repository.findByDni(user.getDni());
            if (pacienteByDni.isPresent()) {
                logger.info("✅ Paciente encontrado por DNI: {}", user.getDni());
                return toDTO(pacienteByDni.get());
            }
        }

        // REGLA 3: Buscar paciente existente por email (fallback)
        Optional<Paciente> pacienteByEmail = repository.findByEmail(user.getEmail());
        if (pacienteByEmail.isPresent()) {
            logger.info("✅ Paciente encontrado por email: {}", user.getEmail());
            return toDTO(pacienteByEmail.get());
        }

        // REGLA 4: No existe paciente - crear uno nuevo para el usuario multi-rol
        logger.info("🆕 Creando nuevo registro de paciente para usuario multi-rol: {}", user.getEmail());
        return createPacienteFromUser(user, "SYSTEM_SYNC");
    }

    /**
     * Crea un nuevo registro de paciente a partir de los datos de un usuario.
     * Método privado auxiliar para ensurePacienteExistsForUser.
     * 
     * @param user Usuario origen de los datos
     * @param performedBy Usuario que ejecuta la acción (para auditoría)
     * @return PacienteDTO del paciente creado
     */
    private PacienteDTO createPacienteFromUser(User user, String performedBy) {
        Paciente nuevoPaciente = new Paciente();
        nuevoPaciente.setNombre(user.getNombre());
        nuevoPaciente.setApellido(user.getApellido());
        nuevoPaciente.setDni(user.getDni());
        nuevoPaciente.setEmail(user.getEmail());
        nuevoPaciente.setTelefono(user.getTelefono());
        // fechaNacimiento y obraSocial quedan null - pueden completarse después

        Paciente savedPaciente = repository.save(nuevoPaciente);

        // 🎯 AUDITORÍA
        auditLogService.logGenericAction(
            AuditLog.EntityTypes.PACIENTE,
            savedPaciente.getId().longValue(),
            AuditLog.Actions.CREATE,
            performedBy,
            null,
            "SINCRONIZADO",
            null,
            savedPaciente,
            "Paciente creado automáticamente por sincronización multi-rol desde usuario: " + user.getEmail()
        );

        logger.info("✅ Paciente creado exitosamente - ID: {}, Email: {}", 
                    savedPaciente.getId(), savedPaciente.getEmail());

        return toDTO(savedPaciente);
    }


}