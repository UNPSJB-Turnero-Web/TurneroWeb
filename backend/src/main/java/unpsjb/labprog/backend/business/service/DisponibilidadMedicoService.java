package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.dto.DisponibilidadMedicoDTO;
import unpsjb.labprog.backend.model.DisponibilidadMedico;

@Service
public class DisponibilidadMedicoService {

    @Autowired
    private DisponibilidadMedicoRepository repository;

    public List<DisponibilidadMedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<DisponibilidadMedicoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public DisponibilidadMedicoDTO save(DisponibilidadMedicoDTO dto) {
        DisponibilidadMedico disponibilidadMedico = toEntity(dto);

        // Validaciones para evitar duplicados
        if (disponibilidadMedico.getId() == null) {
            if (repository.existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
                    disponibilidadMedico.getStaffMedico(),
                    disponibilidadMedico.getDiaSemana(),
                    disponibilidadMedico.getHoraInicio(),
                    disponibilidadMedico.getHoraFin())) {
                throw new IllegalStateException("Ya existe una disponibilidad para este staff médico en el mismo día y horario.");
            }
        } else {
            DisponibilidadMedico existente = repository.findById(disponibilidadMedico.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe la disponibilidad que se intenta modificar.");
            }

            if (repository.existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
                    disponibilidadMedico.getStaffMedico(),
                    disponibilidadMedico.getDiaSemana(),
                    disponibilidadMedico.getHoraInicio(),
                    disponibilidadMedico.getHoraFin())) {
                throw new IllegalStateException("Ya existe una disponibilidad para este staff médico en el mismo día y horario.");
            }
        }

        return toDTO(repository.save(disponibilidadMedico));
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private DisponibilidadMedicoDTO toDTO(DisponibilidadMedico disponibilidad) {
        DisponibilidadMedicoDTO dto = new DisponibilidadMedicoDTO();
        dto.setId(disponibilidad.getId());
        dto.setDiaSemana(disponibilidad.getDiaSemana());
        dto.setHoraInicio(disponibilidad.getHoraInicio());
        dto.setHoraFin(disponibilidad.getHoraFin());
        // Mapear relaciones si es necesario
        return dto;
    }

    private DisponibilidadMedico toEntity(DisponibilidadMedicoDTO dto) {
        DisponibilidadMedico disponibilidad = new DisponibilidadMedico();
        disponibilidad.setId(dto.getId());
        disponibilidad.setDiaSemana(dto.getDiaSemana());
        disponibilidad.setHoraInicio(dto.getHoraInicio());
        disponibilidad.setHoraFin(dto.getHoraFin());
        // Mapear relaciones si es necesario
        return disponibilidad;
    }
}