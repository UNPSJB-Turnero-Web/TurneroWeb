package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.dto.EsquemaTurnoDTO;
import unpsjb.labprog.backend.model.EsquemaTurno;

@Service
public class EsquemaTurnoService {

    @Autowired
    private EsquemaTurnoRepository repository;

    public List<EsquemaTurnoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<EsquemaTurnoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public EsquemaTurnoDTO save(EsquemaTurnoDTO dto) {
        EsquemaTurno esquemaTurno = toEntity(dto);

        // Validaciones para evitar duplicados
        if (esquemaTurno.getId() == null) {
            if (repository.existsByNombre(esquemaTurno.getNombre())) {
                throw new IllegalStateException("Ya existe un esquema de turno con el nombre: " + esquemaTurno.getNombre());
            }
        } else {
            EsquemaTurno existente = repository.findById(esquemaTurno.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el esquema de turno que se intenta modificar.");
            }

            if (!existente.getNombre().equalsIgnoreCase(esquemaTurno.getNombre()) &&
                repository.existsByNombre(esquemaTurno.getNombre())) {
                throw new IllegalStateException("Ya existe un esquema de turno con el nombre: " + esquemaTurno.getNombre());
            }
        }

        return toDTO(repository.save(esquemaTurno));
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private EsquemaTurnoDTO toDTO(EsquemaTurno esquema) {
        EsquemaTurnoDTO dto = new EsquemaTurnoDTO();
        dto.setId(esquema.getId());
        dto.setNombre(esquema.getNombre());
        dto.setDescripcion(esquema.getDescripcion());
        dto.setHoraInicio(esquema.getHoraInicio());
        dto.setHoraFin(esquema.getHoraFin());
        dto.setIntervalo(esquema.getIntervalo());
        return dto;
    }

    private EsquemaTurno toEntity(EsquemaTurnoDTO dto) {
        EsquemaTurno esquema = new EsquemaTurno();
        esquema.setId(dto.getId());
        esquema.setNombre(dto.getNombre());
        esquema.setDescripcion(dto.getDescripcion());
        esquema.setHoraInicio(dto.getHoraInicio());
        esquema.setHoraFin(dto.getHoraFin());
        esquema.setIntervalo(dto.getIntervalo());
        return esquema;
    }
}