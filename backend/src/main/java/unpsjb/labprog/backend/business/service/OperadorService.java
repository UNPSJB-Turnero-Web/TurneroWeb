package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.OperadorRepository;
import unpsjb.labprog.backend.dto.OperadorDTO;
import unpsjb.labprog.backend.model.Operador;
import unpsjb.labprog.backend.model.User;

@Service
public class OperadorService {

    @Autowired
    private OperadorRepository repository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(OperadorService.class);

    public List<OperadorDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<OperadorDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    public Optional<OperadorDTO> findByDni(Long dni) {
        return repository.findByDni(dni).map(this::toDTO);
    }

    public Optional<OperadorDTO> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDTO);
    }

    @Transactional
    public OperadorDTO saveOrUpdate(OperadorDTO dto) {
        Operador operador = toEntity(dto);
        validarOperador(operador);

        // Validaciones de duplicados
        if (operador.getId() == null || operador.getId() <= 0L) {
            if (repository.existsByDni(operador.getDni())) {
                throw new IllegalStateException("Ya existe un operador con el DNI: " + operador.getDni());
            }

            // Si es creado con auditoría (tiene performedBy), usar auditoría
            if (dto.getPerformedBy() != null && !dto.getPerformedBy().trim().isEmpty()) {
                // Generar contraseña automática
                String password = dto.getPassword();
                if (password == null || password.trim().isEmpty()) {
                    password = generarPasswordAutomatica();
                }

                // Crear usuario con auditoría (retorna User, no Operador)
                registrationService.registrarOperadorWithAudit(
                        operador.getEmail(),
                        password,
                        operador.getDni(),
                        operador.getNombre(),
                        operador.getApellido(),
                        operador.getTelefono(),
                        dto.getPerformedBy());

                // Crear operador en tabla operador
                Operador operadorCreado = repository.save(operador);

                // Enviar contraseña por mail
                enviarPasswordPorMail(operador.getEmail(), password);
                return toDTO(operadorCreado);
            } else {
                // Creación normal sin auditoría
                String password = generarPasswordAutomatica();

                // Crear usuario en la tabla User
                registrationService.registrarOperador(
                        operador.getEmail(),
                        password,
                        operador.getDni(),
                        operador.getNombre(),
                        operador.getApellido(),
                        operador.getTelefono());

                // Enviar la contraseña por mail
                enviarPasswordPorMail(operador.getEmail(), password);
            }

        } else {
            Operador existente = repository.findById(operador.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el operador que se intenta modificar.");
            }

            if (!existente.getDni().equals(operador.getDni()) &&
                    repository.existsByDni(operador.getDni())) {
                throw new IllegalStateException("Ya existe un operador con el DNI: " + operador.getDni());
            }
            // No manejamos contraseña en la entidad operador, solo en User
            
            // Actualizar también el User correspondiente si existe
            Optional<User> userOpt = userService.findByEmail(existente.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Actualizar los datos personales del usuario
                user.setNombre(operador.getNombre());
                user.setApellido(operador.getApellido());
                user.setEmail(operador.getEmail());
                user.setTelefono(operador.getTelefono());
                user.setDni(operador.getDni());
                
                // Guardar el usuario actualizado
                userService.save(user);
            }
        }

        return toDTO(repository.save(operador));
    }

    public Page<OperadorDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    /**
     * Genera una contraseña automática segura para el operador
     */
    private String generarPasswordAutomatica() {
        // Puedes mejorar este generador según tus necesidades
        return java.util.UUID.randomUUID().toString().substring(0, 10);
    }

    /**
     * Envía la contraseña inicial por correo electrónico al operador
     */
    private void enviarPasswordPorMail(String email, String password) {
        try {
            // Obtener el nombre del operador desde el email o usar un nombre genérico
            String userName = email.split("@")[0];
            emailService.sendInitialCredentialsEmail(email, userName, password);
            logger.info("Credenciales iniciales enviadas por correo a operador: {}", email);
        } catch (Exception e) {
            logger.error("Error al enviar credenciales iniciales por correo a operador {}: {}", email, e.getMessage());
            // No lanzamos excepción para no interrumpir el flujo de creación del operador
        }
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id); // si quieres borrado lógico, aquí cambiarías a setActivo(false)
    }

    @Transactional
    public void deleteLogico(Long id) {
        Operador operador = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Operador no encontrado"));
        operador.setActivo(false);
        repository.save(operador);
    }

    private OperadorDTO toDTO(Operador operador) {
        OperadorDTO dto = new OperadorDTO();
        dto.setId(operador.getId());
        dto.setNombre(operador.getNombre());
        dto.setApellido(operador.getApellido());
        dto.setDni(operador.getDni());
        dto.setEmail(operador.getEmail());
        dto.setActivo(operador.isActivo());
        dto.setTelefono(operador.getTelefono());
        return dto;
    }

    private Operador toEntity(OperadorDTO dto) {
        Operador operador = new Operador();
        operador.setId(dto.getId());
        operador.setNombre(dto.getNombre());
        operador.setApellido(dto.getApellido());
        operador.setDni(dto.getDni());
        operador.setEmail(dto.getEmail());
        operador.setActivo(dto.isActivo());
        operador.setTelefono(dto.getTelefono());
        return operador;
    }

    private void validarOperador(Operador operador) {
        if (operador.getNombre() == null || operador.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (operador.getApellido() == null || operador.getApellido().isBlank()) {
            throw new IllegalArgumentException("El apellido es obligatorio");
        }
        if (operador.getDni() == null) {
            throw new IllegalArgumentException("El DNI es obligatorio");
        }
        String dniStr = String.valueOf(operador.getDni());
        if (!dniStr.matches("^\\d{7,10}$")) {
            throw new IllegalArgumentException("El DNI debe tener entre 7 y 10 dígitos");
        }

        if (operador.getEmail() == null || operador.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        // Validación de teléfono: excluir ID actual en updates
        if (operador.getId() != null && operador.getId() > 0L) {
            // Solo validar si el teléfono cambió (opcional, para optimizar)
            Operador existente = repository.findById(operador.getId()).orElseThrow();
            if (!existente.getTelefono().equals(operador.getTelefono()) &&
                    repository.existsByTelefonoAndIdNot(operador.getTelefono(), operador.getId())) {
                throw new IllegalArgumentException("El teléfono ya está en uso por otro operador");
            }
        } else if (repository.existsByTelefono(operador.getTelefono())) {
            throw new IllegalArgumentException("El teléfono ya está en uso por otro operador");
        }
    }
}
