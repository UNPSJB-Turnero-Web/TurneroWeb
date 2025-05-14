package unpsjb.labprog.backend.presenter;

import java.util.List;

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

import unpsjb.labprog.backend.business.service.ObraSocialService;
import unpsjb.labprog.backend.dto.ObraSocialDTO;

@RestController
@RequestMapping("/api/obra-social")
public class ObraSocialPresenter {

    @Autowired
    private ObraSocialService service;

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<ObraSocialDTO> obrasSociales = service.findAll();
        return ResponseEntity.ok(obrasSociales);
    }

    @GetMapping("/{id}")
public ResponseEntity<ObraSocialDTO> getById(@PathVariable int id) {
    return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}


    @PostMapping
    public ResponseEntity<Object> create(@RequestBody ObraSocialDTO obraSocialDTO) {
        ObraSocialDTO saved = service.saveOrUpdate(obraSocialDTO);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Integer id, @RequestBody ObraSocialDTO updatedObraSocial) {
        updatedObraSocial.setId(id);
        ObraSocialDTO saved = service.saveOrUpdate(updatedObraSocial);
        return ResponseEntity.ok(saved);
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