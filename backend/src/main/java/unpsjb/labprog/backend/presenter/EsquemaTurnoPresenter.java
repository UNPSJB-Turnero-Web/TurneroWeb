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

import unpsjb.labprog.backend.business.service.EsquemaTurnoService;
import unpsjb.labprog.backend.dto.EsquemaTurnoDTO;

@RestController
@RequestMapping("/esquema-turno")
public class EsquemaTurnoPresenter {

    @Autowired
    private EsquemaTurnoService service;

    @GetMapping
    public ResponseEntity<List<EsquemaTurnoDTO>> getAll() {
        List<EsquemaTurnoDTO> esquemas = service.findAll();
        return ResponseEntity.ok(esquemas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EsquemaTurnoDTO> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/staff/{staffMedicoId}")
    public ResponseEntity<List<EsquemaTurnoDTO>> getByStaffMedico(@PathVariable Long staffMedicoId) {
        List<EsquemaTurnoDTO> esquemas = service.findByStaffMedico(staffMedicoId);
        return ResponseEntity.ok(esquemas);
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody EsquemaTurnoDTO esquemaTurnoDTO) {
        EsquemaTurnoDTO saved = service.saveOrUpdate(esquemaTurnoDTO);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Long id, @RequestBody EsquemaTurnoDTO esquemaTurnoDTO) {
        esquemaTurnoDTO.setId(id);
        EsquemaTurnoDTO updated = service.saveOrUpdate(esquemaTurnoDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/reset")
public ResponseEntity<Object> resetEsquemas() {
    service.deleteAll();
    return ResponseEntity.ok("Todos los esquemas de turno fueron eliminados.");
}

}