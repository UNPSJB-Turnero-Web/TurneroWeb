package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.TurnoService;
import unpsjb.labprog.backend.model.Turno;

import java.util.Optional;

@RestController
@RequestMapping("turno")
public class TurnoPresenter {

    @Autowired
    private TurnoService service;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        return Response.ok(service.findAll());
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") Long id) {
        Optional<Turno> turnoOpt = service.findById(id);
        if (turnoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return Response.ok(turnoOpt.get());
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody Turno turno) {
        Turno saved = service.save(turno);
        return Response.ok(saved);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody Turno turno) {
        Turno saved = service.save(turno);
        return Response.ok(saved);
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Response.ok(service.findByPage(page, size));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") Long id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.delete(id);
        return Response.ok("Turno " + id + " borrado.");
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Object> confirmarTurno(@PathVariable Long id) {
        Optional<Turno> turnoOpt = service.findById(id);
        if (turnoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Turno turno = turnoOpt.get();
        try {
            turno.confirmarTurno();
            service.save(turno);
            return ResponseEntity.ok("Turno confirmado exitosamente.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Object> cancelarTurno(@PathVariable Long id) {
        Optional<Turno> turnoOpt = service.findById(id);
        if (turnoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Turno turno = turnoOpt.get();
        try {
            turno.cancelarTurno();
            service.save(turno);
            return ResponseEntity.ok("Turno cancelado exitosamente.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
