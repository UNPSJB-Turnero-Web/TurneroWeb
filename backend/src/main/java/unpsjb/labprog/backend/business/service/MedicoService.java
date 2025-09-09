package unpsjb.labprog.backend.business.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private MedicoRepository repository;

    @Autowired
    private EspecialidadRepository especialidadRepo;

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

    @Autowired
    private RegistrationService registrationService;

    @Autowired 
    private PasswordEncoder passwordEncoder;

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

            // Validar Especialidades
            if (dto.getEspecialidadIds() == null || dto.getEspecialidadIds().isEmpty()) {
                throw new IllegalArgumentException("Debe proporcionar al menos una especialidad válida");
            }

            // Si es creado por ADMIN (tiene performedBy), usar auditoría
            if (dto.getPerformedBy() != null && !dto.getPerformedBy().trim().isEmpty()) {
                // Generar contraseña automática
                String password = dto.getPassword();
                if (password == null || password.trim().isEmpty()) {
                    password = generarPasswordAutomatica();
                }

                // Obtener especialidades
                Set<Especialidad> especialidades = dto.getEspecialidadIds().stream()
                    .map(id -> especialidadRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Especialidad no encontrada: " + id)))
                    .collect(Collectors.toSet());

                // Crear usuario en la tabla User con auditoría (esto YA crea el médico)
                Medico medicoCreado = registrationService.registrarMedicoWithAudit(
                    medico.getEmail(),
                    password,
                    medico.getDni(),
                    medico.getNombre(),
                    medico.getApellido(),
                    medico.getTelefono(),
                    medico.getMatricula(),
                    especialidades,
                    dto.getPerformedBy()
                );

                // Enviar contraseña por mail
                enviarPasswordPorMail(medico.getEmail(), password);
                
                // Retornar el médico creado directamente
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

            // Mantener la contraseña anterior si no se proporciona una nueva
            if (medico.getHashedPassword() == null) {
                medico.setHashedPassword(existente.getHashedPassword());
            }

            // Actualizar campos editables
            existente.setNombre(medico.getNombre());
            existente.setApellido(medico.getApellido());
            existente.setDni(medico.getDni());
            existente.setEmail(medico.getEmail());
            existente.setTelefono(medico.getTelefono());
            existente.setEspecialidades(medico.getEspecialidades());
            existente.setMatricula(medico.getMatricula());
            if (medico.getHashedPassword() != null) {
                existente.setHashedPassword(medico.getHashedPassword());
            }
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
     * Pseudofunción para enviar la contraseña por mail al médico
     */
    private void enviarPasswordPorMail(String email, String password) {
        System.out.println("[PSEUDO-ENVÍO] Se enviaría la contraseña '" + password + "' al correo: " + email);
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
