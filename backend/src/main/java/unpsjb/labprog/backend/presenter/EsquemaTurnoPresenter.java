package unpsjb.labprog.backend.presenter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
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

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageResult = service.findByPage(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());

        return Response.ok(response);
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Object> resetEsquemas() {
        service.deleteAll();
        return ResponseEntity.ok("Todos los esquemas de turno fueron eliminados.");
    }

}