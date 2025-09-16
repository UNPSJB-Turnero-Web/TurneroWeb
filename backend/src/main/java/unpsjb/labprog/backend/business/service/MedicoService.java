package unpsjb.labprog.backend.business.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.business.repository.MedicoRepository;
import unpsjb.labprog.backend.dto.EspecialidadDTO;
import unpsjb.labprog.backend.dto.MedicoDTO;
import unpsjb.labprog.backend.model.Especialidad;
import unpsjb.labprog.backend.model.Medico;

@Service
public class MedicoService {

    private static final Logger logger = LoggerFactory.getLogger(MedicoService.class);

    @Autowired
    private MedicoRepository repository;

    @Autowired
    private EspecialidadRepository especialidadRepo;

     @Autowired
    private RegistrationService registrationService;

    @Autowired
    private EmailService emailService;

    public List<MedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<MedicoDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    public Optional<MedicoDTO> findByMatricula(String matricula) {
        return repository.findByMatricula(matricula).map(this::toDTO);
    }
    
    public Optional<MedicoDTO> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDTO);
    }

   

    @Transactional
    public MedicoDTO saveOrUpdate(MedicoDTO dto) {
        // Validar DNI en el DTO antes de convertir a entidad
        if (dto.getDni() == null || dto.getDni().isBlank()) {
            throw new IllegalArgumentException("El dni es obligatorio");
        }
        if (!dto.getDni().matches("\\d+")) {
            throw new IllegalArgumentException("dni incorrecto, débe contener sólo números");
        }
        if (dto.getDni().length() < 7 || dto.getDni().length() > 9) {
            throw new IllegalArgumentException("El dni debe tener entre 7 y 9 dígitos");
        }

        Medico medico = toEntity(dto);
        validarMedico(medico);

        if (medico.getId() == null || medico.getId() == 0) {
            // CREACIÓN
            if (repository.existsByDni(medico.getDni())) {
                throw new IllegalArgumentException("El dni ya existe en el sistema");
            }
            if (repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalArgumentException("La Matrícula ya existe en el sistema");
            }
            if (repository.existsByEmail(medico.getEmail())) {
                throw new IllegalStateException("Ya existe un médico con el email: " + medico.getEmail());
            }

            // Obtener IDs de especialidades - verificar ambas formas
            Set<Integer> especialidadIds;
            if (dto.getEspecialidadIds() != null && !dto.getEspecialidadIds().isEmpty()) {
                // Usar especialidadIds si está presente
                especialidadIds = dto.getEspecialidadIds();
            } else if (dto.getEspecialidades() != null && !dto.getEspecialidades().isEmpty()) {
                // Extraer IDs de los objetos especialidades
                especialidadIds = dto.getEspecialidades().stream()
                    .map(EspecialidadDTO::getId)
                    .collect(Collectors.toSet());
            } else {
                throw new IllegalArgumentException("Debe proporcionar al menos una especialidad válida");
            }

            // Si es creado por ADMIN u OPERADOR (tiene performedBy), usar auditoría
            if (dto.getPerformedBy() != null && !dto.getPerformedBy().trim().isEmpty()) {
                // Generar contraseña automática
                String password = dto.getPassword();
                if (password == null || password.trim().isEmpty()) {
                    password = generarPasswordAutomatica();
                }

                // Obtener especialidades usando los IDs validados
                Set<Especialidad> especialidades = especialidadIds.stream()
                    .map(id -> especialidadRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Especialidad no encontrada: " + id)))
                    .collect(Collectors.toSet());

                // 1. Crear usuario en la tabla User con auditoría
                registrationService.registrarMedicoWithAudit(
                    medico.getEmail(),
                    password,
                    medico.getDni(),
                    medico.getNombre(),
                    medico.getApellido(),
                    medico.getTelefono(),
                    dto.getPerformedBy()
                );

                // 2. Crear entidad médico
                medico.setEspecialidades(especialidades);
                
                Medico medicoCreado = repository.save(medico);

                // 3. Enviar contraseña por mail
                enviarPasswordPorMail(medico.getEmail(), password);
                
                // Retornar el médico creado
                return toDTO(medicoCreado);
            } else {
                // Validar especialidades normalmente para registro directo
                if (medico.getEspecialidades() == null || medico.getEspecialidades().isEmpty()) {
                    throw new IllegalArgumentException("Debe proporcionar al menos una especialidad válida");
                }

                // Validar existencia de las especialidades
                Set<Especialidad> especialidadesValidadas = new HashSet<>();
                for (Especialidad esp : medico.getEspecialidades()) {
                    if (esp.getId() != null) {
                        Optional<Especialidad> especialidadOpt = especialidadRepo.findById(esp.getId());
                        if (especialidadOpt.isPresent()) {
                            especialidadesValidadas.add(especialidadOpt.get());
                        } else {
                            throw new IllegalArgumentException("La especialidad con ID " + esp.getId() + " NO existe");
                        }
                    } else if (esp.getNombre() != null && !esp.getNombre().isBlank()) {
                        Especialidad especialidad = especialidadRepo.findByNombreIgnoreCase(esp.getNombre());
                        if (especialidad != null) {
                            especialidadesValidadas.add(especialidad);
                        } else {
                            throw new IllegalArgumentException("La especialidad " + esp.getNombre() + " NO existe");
                        }
                    } else {
                        throw new IllegalArgumentException("Debe proporcionar especialidades válidas con ID o nombre");
                    }
                }
                medico.setEspecialidades(especialidadesValidadas);
            }
        } else {
            // MODIFICACIÓN
            Medico existente = repository.findById(medico.getId())
                    .orElseThrow(() -> new IllegalStateException("No existe el médico que se intenta modificar."));
            
            if (!existente.getDni().equals(medico.getDni()) && repository.existsByDni(medico.getDni())) {
                throw new IllegalArgumentException("El dni ya existe en el sistema");
            }
            if (!existente.getMatricula().equals(medico.getMatricula()) && repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalArgumentException("La Matrícula ya existe en el sistema");
            }
            if (!existente.getEmail().equals(medico.getEmail()) && repository.existsByEmail(medico.getEmail())) {
                throw new IllegalStateException("Ya existe un médico con el email: " + medico.getEmail());
            }

            // No manejamos contraseña en la entidad médico, solo en User

            // Actualizar campos editables
            existente.setNombre(medico.getNombre());
            existente.setApellido(medico.getApellido());
            existente.setDni(medico.getDni());
            existente.setEmail(medico.getEmail());
            existente.setTelefono(medico.getTelefono());
            existente.setEspecialidades(medico.getEspecialidades());
            existente.setMatricula(medico.getMatricula());
            // No manejamos contraseña en entidad médico
            medico = existente;
        }

        return toDTO(repository.save(medico));
    }

    /**
     * Genera una contraseña automática segura para el médico
     */
    private String generarPasswordAutomatica() {
        return java.util.UUID.randomUUID().toString().substring(0, 10);
    }

    /**
     * Envía la contraseña inicial por correo electrónico al médico
     */
    private void enviarPasswordPorMail(String email, String password) {
        try {
            // Obtener el nombre del médico desde el email o usar un nombre genérico
            String userName = email.split("@")[0];
            emailService.sendInitialCredentialsEmail(email, userName, password);
            logger.info("Credenciales iniciales enviadas por correo a médico: {}", email);
        } catch (Exception e) {
            logger.error("Error al enviar credenciales iniciales por correo a médico {}: {}", email, e.getMessage());
            // No lanzamos excepción para no interrumpir el flujo de creación del médico
        }
    }

    public Page<MedicoDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private MedicoDTO toDTO(Medico medico) {
        MedicoDTO dto = new MedicoDTO();
        dto.setId(medico.getId());
        dto.setNombre(medico.getNombre());
        dto.setApellido(medico.getApellido());
        dto.setDni(medico.getDni() != null ? String.valueOf(medico.getDni()) : null);
        dto.setEmail(medico.getEmail());
        dto.setTelefono(medico.getTelefono());
        dto.setMatricula(medico.getMatricula());

        // Mapear Especialidades (múltiples)
        if (medico.getEspecialidades() != null && !medico.getEspecialidades().isEmpty()) {
            Set<EspecialidadDTO> especialidadesDTO = medico.getEspecialidades().stream()
                    .map(esp -> {
                        EspecialidadDTO espDTO = new EspecialidadDTO();
                        espDTO.setId(esp.getId());
                        espDTO.setNombre(esp.getNombre());
                        espDTO.setDescripcion(esp.getDescripcion());
                        return espDTO;
                    })
                    .collect(Collectors.toSet());
            dto.setEspecialidades(especialidadesDTO);
        }

        return dto;
    }

    private Medico toEntity(MedicoDTO dto) {
        Medico medico = new Medico();
        medico.setId(dto.getId());
        medico.setNombre(dto.getNombre());
        medico.setApellido(dto.getApellido());
        if (dto.getDni() != null && dto.getDni().matches("\\d+")) {
            medico.setDni(Long.valueOf(dto.getDni()));
        } else {
            medico.setDni(null);
        }
        medico.setEmail(dto.getEmail());
        medico.setTelefono(dto.getTelefono());
        medico.setMatricula(dto.getMatricula());

        // Asignar Especialidades (múltiples)
        if (dto.getEspecialidades() != null && !dto.getEspecialidades().isEmpty()) {
            Set<Especialidad> especialidades = dto.getEspecialidades().stream()
                    .map(espDto -> {
                        Especialidad esp = new Especialidad();
                        esp.setId(espDto.getId());
                        esp.setNombre(espDto.getNombre());
                        esp.setDescripcion(espDto.getDescripcion());
                        return esp;
                    })
                    .collect(Collectors.toSet());
            medico.setEspecialidades(especialidades);
        }

        return medico;
    }

    private void validarMedico(Medico medico) {
        if (medico.getNombre() == null || medico.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (medico.getNombre().length() > 50) {
            throw new IllegalArgumentException("El nombre no puede superar los 50 caracteres");
        }
        if (medico.getApellido() == null || medico.getApellido().isBlank()) {
            throw new IllegalArgumentException("El apellido es obligatorio");
        }
        if (medico.getApellido().length() > 50) {
            throw new IllegalArgumentException("El apellido no puede superar los 50 caracteres");
        }
        if (medico.getMatricula() == null || medico.getMatricula().trim().isEmpty()) {
            throw new IllegalArgumentException("La matrícula es obligatoria");
        }
        if (medico.getMatricula().length() > 20) {
            throw new IllegalArgumentException("La matrícula no puede superar los 20 caracteres");
        }
    }
}
