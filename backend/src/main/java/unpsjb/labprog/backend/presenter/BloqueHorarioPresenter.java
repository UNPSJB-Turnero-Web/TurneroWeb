package unpsjb.labprog.backend.presenter;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.business.service.BloqueHorarioService;
import unpsjb.labprog.backend.model.BloqueHorario;

@RestController
@RequestMapping("/bloque-horario")
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
    @DeleteMapping("/reset")
    public ResponseEntity<Object> resetBloques() {
        service.deleteAll();
        return ResponseEntity.ok("Todos los bloques horarios fueron eliminados.");
    }
}