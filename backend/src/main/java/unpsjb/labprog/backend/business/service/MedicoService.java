package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Autowired
    private MedicoRepository repository;

    @Autowired
    private EspecialidadRepository especialidadRepo;

    public List<MedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<MedicoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
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

        // Validar datos personales
        validarMedico(medico);

        // Validar especialidad
        if (medico.getEspecialidad() == null || medico.getEspecialidad().getNombre() == null || medico.getEspecialidad().getNombre().isBlank()) {
            throw new IllegalArgumentException("La especialidad es obligatoria");
        }
        // Validar existencia de especialidad (ignorando mayúsculas/minúsculas)
        var especialidad = especialidadRepo.findByNombreIgnoreCase(medico.getEspecialidad().getNombre());
        if (especialidad == null) {
            throw new IllegalArgumentException("La especialidad NO existe");
        }
        medico.setEspecialidad(especialidad);

        if (medico.getId() == null || medico.getId() == 0) {
            // CREACIÓN
            if (repository.existsByDni(medico.getDni())) {
                throw new IllegalArgumentException("El dni ya existe en el sistema");
            }
            if (repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalArgumentException("La Matrícula ya existe en el sistema");
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
            // Actualizar campos editables
            existente.setNombre(medico.getNombre());
            existente.setApellido(medico.getApellido());
            existente.setDni(medico.getDni());
            existente.setMatricula(medico.getMatricula());
            existente.setEspecialidad(especialidad);
            medico = existente;
        }

        return toDTO(repository.save(medico));
    }

    public Page<MedicoDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private MedicoDTO toDTO(Medico medico) {
        MedicoDTO dto = new MedicoDTO();
        dto.setId(medico.getId());
        dto.setNombre(medico.getNombre());
        dto.setApellido(medico.getApellido());
        dto.setDni(medico.getDni() != null ? String.valueOf(medico.getDni()) : null);
        dto.setMatricula(medico.getMatricula());
        if (medico.getEspecialidad() != null) {
            EspecialidadDTO esp = new EspecialidadDTO();
            esp.setId(medico.getEspecialidad().getId());
            esp.setNombre(medico.getEspecialidad().getNombre());
            esp.setDescripcion(medico.getEspecialidad().getDescripcion());
            dto.setEspecialidad(esp);
        }
        return dto;
    }

    private Medico toEntity(MedicoDTO dto) {
        Medico medico = new Medico();
        medico.setId(dto.getId());
        medico.setNombre(dto.getNombre());
        medico.setApellido(dto.getApellido());
        // Validar que el dni sea numérico antes de convertir
        if (dto.getDni() != null && dto.getDni().matches("\\d+")) {
            medico.setDni(Long.valueOf(dto.getDni()));
        } else {
            medico.setDni(null);
        }
        medico.setMatricula(dto.getMatricula());
        if (dto.getEspecialidad() != null) {
            Especialidad esp = new Especialidad();
            esp.setNombre(dto.getEspecialidad().getNombre());
            medico.setEspecialidad(esp);
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
