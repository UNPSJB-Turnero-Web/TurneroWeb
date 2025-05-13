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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.MedicoService;
import unpsjb.labprog.backend.dto.MedicoDTO;

@RestController
@RequestMapping("medico")
public class MedicoPresenter {

    @Autowired
    MedicoService service;

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<MedicoDTO> medicos = service.findAll();
        return Response.ok(medicos, "Médicos recuperados correctamente");
    }

  @GetMapping("/{id}")
public ResponseEntity<MedicoDTO> getById(@PathVariable Long id) {
    return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody MedicoDTO medicoDTO) {
        MedicoDTO saved = service.save(medicoDTO);
        return Response.ok(saved, "Médico creado correctamente");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Long id, @RequestBody MedicoDTO medicoDTO) {
        medicoDTO.setId(id);
        MedicoDTO updated = service.save(medicoDTO);
        return Response.ok(updated, "Médico actualizado correctamente");
    }

    @GetMapping("/page")
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageResult = service.findByPage(page, size);
        return Response.ok(pageResult, "Médicos paginados recuperados correctamente");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return Response.ok("Médico " + id + " eliminado correctamente");
    }
}