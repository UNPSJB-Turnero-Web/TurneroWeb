package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.model.StaffMedico;

import java.util.List;
import java.util.Optional;

@Service
public class StaffMedicoService {

    @Autowired
    private StaffMedicoRepository repository;

    public List<StaffMedico> findAll() {
        return repository.findAll();
    }

    public Optional<StaffMedico> findById(Long id) {
        return repository.findById(id);
    }

    public StaffMedico save(StaffMedico staffMedico) {
        return repository.save(staffMedico);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}