package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.model.StaffMedico;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StaffMedicoService {

    @Autowired
    private StaffMedicoRepository repository;

    public List<StaffMedico> findAll() {
        List<StaffMedico> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Optional<StaffMedico> findById(Long id) {
        return repository.findById(id);
    }

    public StaffMedico save(StaffMedico staffMedico) {
        // Validaciones para evitar duplicados
        if (staffMedico.getId() == null) {
            // 🚀 CREACIÓN
            if (repository.existsByMedicoAndCentro(staffMedico.getMedico(), staffMedico.getCentro())) {
                throw new IllegalStateException("Ya existe un registro de StaffMedico con el médico y centro especificados.");
            }
        } else {
            // 🛠️ MODIFICACIÓN
            StaffMedico existente = repository.findById(staffMedico.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el registro de StaffMedico que se intenta modificar.");
            }

            // Verificar si los nuevos datos ya están siendo usados por otro registro
            if (!existente.getMedico().equals(staffMedico.getMedico()) ||
                !existente.getCentro().equals(staffMedico.getCentro())) {
                if (repository.existsByMedicoAndCentro(staffMedico.getMedico(), staffMedico.getCentro())) {
                    throw new IllegalStateException("Ya existe un registro de StaffMedico con el médico y centro especificados.");
                }
            }
        }

        return repository.save(staffMedico);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}