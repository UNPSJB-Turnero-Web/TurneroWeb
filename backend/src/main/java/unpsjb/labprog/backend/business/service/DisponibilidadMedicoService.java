package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.model.DisponibilidadMedico;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DisponibilidadMedicoService {

    @Autowired
    private DisponibilidadMedicoRepository repository;

    public List<DisponibilidadMedico> findAll() {
        List<DisponibilidadMedico> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Optional<DisponibilidadMedico> findById(Long id) {
        return repository.findById(id);
    }

    public DisponibilidadMedico save(DisponibilidadMedico disponibilidadMedico) {
        // Validaciones para evitar duplicados
        if (disponibilidadMedico.getId() == null) {
            // 🚀 CREACIÓN
            if (repository.existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
                    disponibilidadMedico.getStaffMedico(),
                    disponibilidadMedico.getDiaSemana(),
                    disponibilidadMedico.getHoraInicio(),
                    disponibilidadMedico.getHoraFin())) {
                throw new IllegalStateException("Ya existe una disponibilidad para este staff médico en el mismo día y horario.");
            }
        } else {
            // 🛠️ MODIFICACIÓN
            DisponibilidadMedico existente = repository.findById(disponibilidadMedico.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe la disponibilidad que se intenta modificar.");
            }

            // Verificar si los nuevos datos ya están siendo usados por otro registro
            if (repository.existsByStaffMedicoAndDiaSemanaAndHoraInicioAndHoraFin(
                    disponibilidadMedico.getStaffMedico(),
                    disponibilidadMedico.getDiaSemana(),
                    disponibilidadMedico.getHoraInicio(),
                    disponibilidadMedico.getHoraFin())) {
                throw new IllegalStateException("Ya existe una disponibilidad para este staff médico en el mismo día y horario.");
            }
        }

        return repository.save(disponibilidadMedico);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}