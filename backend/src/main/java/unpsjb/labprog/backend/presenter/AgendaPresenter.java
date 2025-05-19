package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.AgendaService;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.Turno;

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
    public ResponseEntity<Object> create(@RequestBody AgendaDTO dto) {
        Agenda saved = service.saveFromDTO(dto);
        return Response.ok(saved);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody AgendaDTO dto) {
        Agenda saved = service.saveFromDTO(dto);
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

    @RequestMapping(value = "/{id}/cancelar", method = RequestMethod.POST)
    public ResponseEntity<Object> cancelarAgenda(@PathVariable("id") int id) {
        try {
            service.cancelarAgendaYNotificarPacientes(id);
            return Response.ok("Agenda cancelada y pacientes notificados.");
        } catch (IllegalArgumentException e) {
            return Response.notFound();
        }
    }

    @RequestMapping(value = "/alternativas/{turnoId}", method = RequestMethod.GET)
    public ResponseEntity<Object> sugerirAlternativas(@PathVariable("turnoId") int turnoId) {
        // Busca el turno y llama al método del service
        Turno turno = service.findTurnoById(turnoId);
        if (turno == null) return Response.notFound();
        return Response.ok(service.sugerirAlternativas(turno));
    }

    @RequestMapping(value = "/consultorio/{consultorioId}", method = RequestMethod.GET)
    public ResponseEntity<Object> findByConsultorio(@PathVariable("consultorioId") Long consultorioId) {
        return Response.ok(service.findByConsultorio(consultorioId));
    }
}
