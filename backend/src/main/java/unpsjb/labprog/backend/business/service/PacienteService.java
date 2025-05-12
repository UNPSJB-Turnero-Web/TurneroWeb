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

    public Optional<PacienteDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public PacienteDTO save(PacienteDTO dto) {
        Paciente paciente = toEntity(dto);

        // Validaciones para evitar duplicados
        if (paciente.getId() == 0) {
            if (repository.existsByDni(paciente.getDNI())) { 
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDNI());
            }
        } else {
            Paciente existente = repository.findById(paciente.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el paciente que se intenta modificar.");
            }

            if (!existente.getDNI().equals(paciente.getDNI()) && 
                    repository.existsByDni(paciente.getDNI())) { 
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDNI());
            }
        }

        return toDTO(repository.save(paciente));
    }

    public Page<PacienteDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private PacienteDTO toDTO(Paciente paciente) {
        PacienteDTO dto = new PacienteDTO();
        dto.setId(paciente.getId());
        dto.setNombre(paciente.getNombre());
        dto.setApellido(paciente.getApellido());
        dto.setDNI(paciente.getDNI()); 
        dto.setFechaNacimiento(paciente.getFechaNacimiento());
        // Mapear la relación con ObraSocial
        if (paciente.getObraSocial() != null) {
            ObraSocialDTO obraSocialDTO = new ObraSocialDTO();
            obraSocialDTO.setId(paciente.getObraSocial().getId());
            obraSocialDTO.setNombre(paciente.getObraSocial().getNombre());
            obraSocialDTO.setCodigo(paciente.getObraSocial().getCodigo());
            dto.setObraSocial(obraSocialDTO);
        }
        return dto;
    }

    private Paciente toEntity(PacienteDTO dto) {
        Paciente paciente = new Paciente();
        paciente.setId(dto.getId());
        paciente.setNombre(dto.getNombre());
        paciente.setApellido(dto.getApellido());
        paciente.setDNI(dto.getDNI()); 
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        if (dto.getObraSocial() != null) {
            ObraSocial obraSocial = new ObraSocial();
            obraSocial.setId(dto.getObraSocial().getId());
            obraSocial.setNombre(dto.getObraSocial().getNombre());
            obraSocial.setCodigo(dto.getObraSocial().getCodigo());
            paciente.setObraSocial(obraSocial);
        }
        return paciente;
    }
}
