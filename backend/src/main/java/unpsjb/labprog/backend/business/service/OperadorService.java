package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.OperadorRepository;
import unpsjb.labprog.backend.dto.OperadorDTO;
import unpsjb.labprog.backend.model.Operador;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class OperadorService {

    @Autowired
    private OperadorRepository repository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        if (operador.getId() == null) {
            if (repository.existsByDni(operador.getDni())) {
                throw new IllegalStateException("Ya existe un operador con el DNI: " + operador.getDni());
            }

            // Generar contraseña automática
            String password = generarPasswordAutomatica();
            String hashedPassword = passwordEncoder.encode(password);
            operador.setHashedPassword(hashedPassword);

            // Crear usuario en la tabla User
            registrationService.registrarOperador(
                operador.getEmail(),
                password,
                operador.getDni(),
                operador.getNombre(),
                operador.getApellido(),
                operador.getTelefono()
            );

            // Pseudofunción para enviar la contraseña por mail
            enviarPasswordPorMail(operador.getEmail(), password);

        } else {
            Operador existente = repository.findById(operador.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el operador que se intenta modificar.");
            }

            if (!existente.getDni().equals(operador.getDni()) &&
                    repository.existsByDni(operador.getDni())) {
                throw new IllegalStateException("Ya existe un operador con el DNI: " + operador.getDni());
            }
            // Mantener la contraseña anterior
            operador.setHashedPassword(existente.getHashedPassword());
        }

        return toDTO(repository.save(operador));
    }
    
    /**
     * Genera una contraseña automática segura para el operador
     */
    private String generarPasswordAutomatica() {
        // Puedes mejorar este generador según tus necesidades
        return java.util.UUID.randomUUID().toString().substring(0, 10);
    }

    /**
     * Pseudofunción para enviar la contraseña por mail al operador
     */
    private void enviarPasswordPorMail(String email, String password) {
        // TODO: Implementar el envío real de email
        System.out.println("[PSEUDO-ENVÍO] Se enviaría la contraseña '" + password + "' al correo: " + email);
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
        
        if (repository.existsByTelefono(operador.getTelefono())) {
            throw new IllegalArgumentException("El teléfono ya está en uso por otro operador");
        }
    }
}
