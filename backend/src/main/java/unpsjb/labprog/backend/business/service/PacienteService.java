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

import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.dto.ObraSocialDTO;
import unpsjb.labprog.backend.dto.PacienteDTO;
import unpsjb.labprog.backend.model.ObraSocial;
import unpsjb.labprog.backend.model.Paciente;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository repository;

    private static final Logger logger = LoggerFactory.getLogger(PacienteService.class);

    @Autowired
    private RegistrationService registrationService;



    @Autowired
    private EmailService emailService;

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
    public PacienteDTO saveOrUpdate(PacienteDTO dto) {
        Paciente paciente = toEntity(dto);
        // validarPaciente(paciente);

        // Validaciones para evitar duplicados
        if (paciente.getId() == null || paciente.getId() == 0) {
            // CREACIÓN
            if (repository.existsByDni(paciente.getDni())) {
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }
            // La verificación de email se hace en el RegistrationService

            // Si es creado por ADMIN/OPERADOR (tiene performedBy), usar auditoría
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
        }

        return toDTO(repository.save(paciente));
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

    @Transactional
    public void delete(Integer id) {
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


}
