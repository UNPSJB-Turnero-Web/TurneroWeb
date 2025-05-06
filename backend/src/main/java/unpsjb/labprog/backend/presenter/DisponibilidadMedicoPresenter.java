package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.model.DisponibilidadMedico;

import java.util.List;

@RestController
@RequestMapping("/api/disponibilidad-medico")
public class DisponibilidadMedicoPresenter {

    @Autowired
    private DisponibilidadMedicoRepository repository;

    @GetMapping
    public List<DisponibilidadMedico> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisponibilidadMedico> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DisponibilidadMedico create(@RequestBody DisponibilidadMedico disponibilidad) {
        return repository.save(disponibilidad);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DisponibilidadMedico> update(@PathVariable Long id, @RequestBody DisponibilidadMedico updatedDisponibilidad) {
        return repository.findById(id)
                .map(existingDisponibilidad -> {
                    existingDisponibilidad.setDiaSemana(updatedDisponibilidad.getDiaSemana());
                    existingDisponibilidad.setHoraInicio(updatedDisponibilidad.getHoraInicio());
                    existingDisponibilidad.setHoraFin(updatedDisponibilidad.getHoraFin());
                    return ResponseEntity.ok(repository.save(existingDisponibilidad));
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