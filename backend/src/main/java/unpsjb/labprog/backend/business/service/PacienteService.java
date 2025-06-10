package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Transactional
    public PacienteDTO saveOrUpdate(PacienteDTO dto) {
        Paciente paciente = toEntity(dto);
        validarPaciente(paciente);

        // Validaciones para evitar duplicados
        if (paciente.getId() == 0) {
            if (repository.existsByDni(paciente.getDni())) { 
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }
        } else {
            Paciente existente = repository.findById(paciente.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el paciente que se intenta modificar.");
            }

            if (!existente.getDni().equals(paciente.getDni()) && 
                    repository.existsByDni(paciente.getDni())) { 
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }
        }

        return toDTO(repository.save(paciente));
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
    private void validarPaciente(Paciente paciente) {
    if (paciente.getNombre() == null || paciente.getNombre().isBlank()) {
        throw new IllegalArgumentException("El nombre es obligatorio");
    }
    if (paciente.getNombre().length() > 50) {
        throw new IllegalArgumentException("El nombre no puede superar los 50 caracteres");
    }
    if (paciente.getApellido() == null || paciente.getApellido().isBlank()) {
        throw new IllegalArgumentException("El apellido es obligatorio");
    }
    if (paciente.getApellido().length() > 50) {
        throw new IllegalArgumentException("El apellido no puede superar los 50 caracteres");
    }
    if (paciente.getDni() == null) {
        throw new IllegalArgumentException("El DNI es obligatorio");
    }
    String dniStr = String.valueOf(paciente.getDni());
    if (!dniStr.matches("^\\d{7,10}$")) {
        throw new IllegalArgumentException("El DNI debe tener entre 7 y 10 dígitos");
    }
    if (paciente.getFechaNacimiento() == null) {
        throw new IllegalArgumentException("La fecha de nacimiento es obligatoria");
    }
}
}

