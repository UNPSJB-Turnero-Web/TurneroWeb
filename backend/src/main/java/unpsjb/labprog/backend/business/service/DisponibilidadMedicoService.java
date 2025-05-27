package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.DisponibilidadMedicoDTO;
import unpsjb.labprog.backend.model.DisponibilidadMedico;

@Service
public class DisponibilidadMedicoService {

    @Autowired
    private DisponibilidadMedicoRepository repository;

    @Autowired
    private StaffMedicoRepository staffMedicoRepository;

    public List<DisponibilidadMedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<DisponibilidadMedicoDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    public Page<DisponibilidadMedicoDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public DisponibilidadMedicoDTO saveOrUpdate(DisponibilidadMedicoDTO dto) {
        DisponibilidadMedico disponibilidadMedico = toEntity(dto);

        if (disponibilidadMedico.getId() == null || disponibilidadMedico.getId() == 0) {
            // Caso de nueva disponibilidad
            for (DisponibilidadMedico.DiaHorario horario : disponibilidadMedico.getHorarios()) {
                if (repository.existsByStaffMedicoAndHorariosDiaAndHorariosHoraInicioAndHorariosHoraFin(
                        disponibilidadMedico.getStaffMedico(),
                        horario.getDia(),
                        horario.getHoraInicio(),
                        horario.getHoraFin())) {
                    throw new IllegalStateException(
                            "Ya existe una disponibilidad para este staff médico en el mismo día y horario.");
                }
            }
        } else {
            // Caso de actualización
            DisponibilidadMedico existente = repository.findById(disponibilidadMedico.getId())
                    .orElseThrow(() -> new IllegalStateException("No existe la disponibilidad que se intenta modificar."));

            for (DisponibilidadMedico.DiaHorario horario : disponibilidadMedico.getHorarios()) {
                // Excluir la propia disponibilidad de la verificación
                if (repository.existsByStaffMedicoAndHorariosDiaAndHorariosHoraInicioAndHorariosHoraFinExcludingId(
                        disponibilidadMedico.getStaffMedico(),
                        horario.getDia(),
                        horario.getHoraInicio(),
                        horario.getHoraFin(),
                        disponibilidadMedico.getId())) {
                    throw new IllegalStateException(
                            "Ya existe una disponibilidad para este staff médico en el mismo día y horario.");
                }
            }
        }

        return toDTO(repository.save(disponibilidadMedico));
    }

    @Transactional
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    private DisponibilidadMedicoDTO toDTO(DisponibilidadMedico disponibilidad) {
        DisponibilidadMedicoDTO dto = new DisponibilidadMedicoDTO();
        dto.setId(disponibilidad.getId());
        dto.setStaffMedicoId(disponibilidad.getStaffMedico().getId());
        dto.setHorarios(disponibilidad.getHorarios().stream().map(horario -> {
            DisponibilidadMedicoDTO.DiaHorarioDTO horarioDTO = new DisponibilidadMedicoDTO.DiaHorarioDTO();
            horarioDTO.setDia(horario.getDia());
            horarioDTO.setHoraInicio(horario.getHoraInicio());
            horarioDTO.setHoraFin(horario.getHoraFin());
            return horarioDTO;
        }).collect(Collectors.toList()));
        return dto;
    }

    private DisponibilidadMedico toEntity(DisponibilidadMedicoDTO dto) {
        DisponibilidadMedico disponibilidad = new DisponibilidadMedico();
        disponibilidad.setId(dto.getId());
        disponibilidad.setStaffMedico(
                staffMedicoRepository.findById(dto.getStaffMedicoId())
                        .orElseThrow(() -> new IllegalArgumentException("StaffMedico no encontrado con ID: " + dto.getStaffMedicoId())));
        disponibilidad.setHorarios(dto.getHorarios().stream().map(horarioDTO -> {
            DisponibilidadMedico.DiaHorario horario = new DisponibilidadMedico.DiaHorario();
            horario.setDia(horarioDTO.getDia());
            horario.setHoraInicio(horarioDTO.getHoraInicio());
            horario.setHoraFin(horarioDTO.getHoraFin());
            return horario;
        }).collect(Collectors.toList()));
        return disponibilidad;
    }
}