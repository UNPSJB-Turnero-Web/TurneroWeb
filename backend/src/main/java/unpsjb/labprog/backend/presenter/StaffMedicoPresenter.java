package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.model.StaffMedico;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/staff-medico")
public class StaffMedicoPresenter {

    @Autowired
    private StaffMedicoRepository repository;

    @GetMapping
    public List<StaffMedico> getAll() {
        List<StaffMedico> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffMedico> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public StaffMedico create(@RequestBody StaffMedico staffMedico) {
        return repository.save(staffMedico);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffMedico> update(@PathVariable Long id, @RequestBody StaffMedico updatedStaff) {
        return repository.findById(id)
                .map(existingStaff -> {
                    existingStaff.setCentro(updatedStaff.getCentro());
                    existingStaff.setMedico(updatedStaff.getMedico());
                    existingStaff.setDisponibilidad(updatedStaff.getDisponibilidad());
                    return ResponseEntity.ok(repository.save(existingStaff));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}