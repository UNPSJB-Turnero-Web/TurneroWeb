package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unpsjb.labprog.backend.business.service.BloqueHorarioService;
import unpsjb.labprog.backend.model.BloqueHorario;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bloque-horario")
public class BloqueHorarioPresenter {

    @Autowired
    private BloqueHorarioService service;

    @GetMapping
    public List<BloqueHorario> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloqueHorario> getById(@PathVariable Long id) {
        Optional<BloqueHorario> bloque = service.findById(id);
        return bloque.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/agenda/{agendaId}")
    public List<BloqueHorario> getByAgenda(@PathVariable Long agendaId) {
        return service.findByAgenda(agendaId);
    }

    @PostMapping
    public BloqueHorario create(@RequestBody BloqueHorario bloque) {
        return service.save(bloque);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BloqueHorario> update(@PathVariable Long id, @RequestBody BloqueHorario bloque) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        bloque.setId(id);
        return ResponseEntity.ok(service.save(bloque));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}