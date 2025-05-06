package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.business.service.ObraSocialService;
import unpsjb.labprog.backend.model.ObraSocial;

import java.util.List;

@RestController
@RequestMapping("/api/obra-social")
public class ObraSocialPresenter {

    @Autowired
    private ObraSocialService service;

    @GetMapping
    public List<ObraSocial> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObraSocial> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ObraSocial create(@RequestBody ObraSocial obraSocial) {
        return service.save(obraSocial);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObraSocial> update(@PathVariable Integer id, @RequestBody ObraSocial updatedObraSocial) {
        return service.findById(id)
                .map(existingObraSocial -> {
                    existingObraSocial.setNombre(updatedObraSocial.getNombre());
                    existingObraSocial.setCodigo(updatedObraSocial.getCodigo());
                    return ResponseEntity.ok(service.save(existingObraSocial));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (service.findById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}