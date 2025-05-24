package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository repository;

    // Obtener todos los turnos como DTOs
    public List<TurnoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener un turno por ID como DTO
    public Optional<TurnoDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public TurnoDTO save(TurnoDTO dto) {

        Turno turno = toEntity(dto);

        validarTurno(turno);

        Turno saved = repository.save(turno);
        return toDTO(saved);
    }

    // Obtener turnos paginados como DTOs
    public Page<TurnoDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new IllegalStateException("No existe un turno con el ID: " + id);
        }
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    // Métodos de conversión entre entidad y DTO
    private TurnoDTO toDTO(Turno turno) {
        TurnoDTO dto = new TurnoDTO();
        dto.setId(turno.getId());
        dto.setFecha(turno.getFecha());
        dto.setHoraInicio(turno.getHoraInicio());
        dto.setHoraFin(turno.getHoraFin());
        dto.setPacienteId(turno.getPaciente().getId());
        dto.setStaffMedicoId(turno.getStaffMedico().getId());
        dto.setEstado(turno.getEstado().name());
        return dto;
    }

    private Turno toEntity(TurnoDTO dto) {
        Turno turno = new Turno();
        turno.setId(dto.getId());
        turno.setFecha(dto.getFecha());
        turno.setHoraInicio(dto.getHoraInicio());
        turno.setHoraFin(dto.getHoraFin());
        turno.setEstado(EstadoTurno.valueOf(dto.getEstado()));
        return turno;
    }

    private void validarTurno(Turno turno) {
        if (turno.getFecha() == null) {
            throw new IllegalArgumentException("La fecha del turno es obligatoria");
        }
        if (turno.getHoraInicio() == null) {
            throw new IllegalArgumentException("La hora de inicio es obligatoria");
        }
        if (turno.getHoraFin() == null) {
            throw new IllegalArgumentException("La hora de fin es obligatoria");
        }
        if (turno.getHoraFin().isBefore(turno.getHoraInicio())) {
            throw new IllegalArgumentException("La hora de fin no puede ser anterior a la hora de inicio");
        }
        if (turno.getPaciente() == null || turno.getPaciente().getId() == null) {
            throw new IllegalArgumentException("El paciente es obligatorio");
        }
        if (turno.getStaffMedico() == null || turno.getStaffMedico().getId() == null) {
            throw new IllegalArgumentException("El médico es obligatorio");
        }
        if (turno.getEstado() == null) {
            throw new IllegalArgumentException("El estado del turno es obligatorio");
        }
    }
}
