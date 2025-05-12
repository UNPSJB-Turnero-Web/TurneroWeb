package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.Turno;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository repository;

    public List<TurnoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<TurnoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public TurnoDTO save(TurnoDTO dto) {
        Turno turno = toEntity(dto);

        // Validaciones
        if (turno.getId() == null || turno.getId() == 0) {
            if (repository.existsByFechaAndHoraInicioAndCentroAtencion(
                    turno.getFecha(), turno.getHoraInicio(), turno.getCentroAtencion())) {
                throw new IllegalStateException("Ya existe un turno registrado en esta fecha y hora para este centro de atención");
            }
        } else {
            Turno existente = repository.findById(turno.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el turno que se intenta modificar");
            }
        }

        return toDTO(repository.save(turno));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Page<TurnoDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    private TurnoDTO toDTO(Turno turno) {
        TurnoDTO dto = new TurnoDTO();
        dto.setId(turno.getId());
        dto.setFecha(turno.getFecha());
        dto.setHoraInicio(turno.getHoraInicio());
        dto.setHoraFin(turno.getHoraFin());
        dto.setEstado(turno.getEstado().name());
        // Mapear relaciones (EsquemaTurno, Paciente, etc.)
        return dto;
    }

    private Turno toEntity(TurnoDTO dto) {
        Turno turno = new Turno();
        turno.setId(dto.getId());
        turno.setFecha(dto.getFecha());
        turno.setHoraInicio(dto.getHoraInicio());
        turno.setHoraFin(dto.getHoraFin());
        // Mapear relaciones (EsquemaTurno, Paciente, etc.)
        return turno;
    }
}
