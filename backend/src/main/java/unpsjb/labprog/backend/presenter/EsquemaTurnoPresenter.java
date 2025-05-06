package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.model.EsquemaTurno;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/esquema-turno")
public class EsquemaTurnoPresenter {

    @Autowired
    private EsquemaTurnoRepository repository;

    @GetMapping
    public List<EsquemaTurno> getAll() {
        List<EsquemaTurno> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<EsquemaTurno> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EsquemaTurno create(@RequestBody EsquemaTurno esquemaTurno) {
        return repository.save(esquemaTurno);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EsquemaTurno> update(@PathVariable Long id, @RequestBody EsquemaTurno updatedEsquema) {
        return repository.findById(id)
                .map(existingEsquema -> {
                    existingEsquema.setNombre(updatedEsquema.getNombre());
                    existingEsquema.setDescripcion(updatedEsquema.getDescripcion());
                    existingEsquema.setHoraInicio(updatedEsquema.getHoraInicio());
                    existingEsquema.setHoraFin(updatedEsquema.getHoraFin());
                    existingEsquema.setIntervalo(updatedEsquema.getIntervalo());
                    return ResponseEntity.ok(repository.save(existingEsquema));
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