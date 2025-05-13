package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.AgendaService;
import unpsjb.labprog.backend.model.Agenda;

@RestController
@RequestMapping("agenda")
public class AgendaPresenter {

    @Autowired
    AgendaService service;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        return Response.ok(service.findAll());
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") int id) {
        Agenda agenda = service.findById(id);
        return (agenda != null)
            ? Response.ok(agenda)
            : Response.notFound();
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody Agenda agenda) {
        Agenda saved = service.save(agenda);
        return Response.ok(saved);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody Agenda agenda) {
        Agenda saved = service.save(agenda);
        return Response.ok(saved);
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Response.ok(service.findByPage(page, size));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") int id) {
        service.delete(id);
        return Response.ok("Agenda " + id + " borrada.");
    }
}
