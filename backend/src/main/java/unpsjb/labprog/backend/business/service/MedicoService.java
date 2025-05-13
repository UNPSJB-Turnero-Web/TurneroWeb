package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.MedicoRepository;
import unpsjb.labprog.backend.dto.MedicoDTO;
import unpsjb.labprog.backend.model.Medico;

@Service
public class MedicoService {

    @Autowired
    private MedicoRepository repository;

    public List<MedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<MedicoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public MedicoDTO save(MedicoDTO dto) {
        Medico medico = toEntity(dto);

        if (medico.getId() == null || medico.getId() == 0) {
            if (repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalStateException("Ya existe un médico con la matrícula: " + medico.getMatricula());
            }
        } else {
            Medico existente = repository.findById(medico.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el médico que se intenta modificar.");
            }

            if (!existente.getMatricula().equalsIgnoreCase(medico.getMatricula()) &&
                repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalStateException("Ya existe un médico con la matrícula: " + medico.getMatricula());
            }
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
        dto.setMatricula(medico.getMatricula());
        // Mapear relaciones si es necesario
        return dto;
    }

    private Medico toEntity(MedicoDTO dto) {
        Medico medico = new Medico();
        medico.setId(dto.getId());
        medico.setNombre(dto.getNombre());
        medico.setApellido(dto.getApellido());
        medico.setMatricula(dto.getMatricula());
        // Mapear relaciones si es necesario
        return medico;
    }
}
