package unpsjb.labprog.backend.presenter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.service.AgendaService;
import unpsjb.labprog.backend.business.service.EsquemaTurnoService;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.dto.EsquemaTurnoDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.Turno;

@RestController
@RequestMapping("/agenda")
public class AgendaPresenter {

    @Autowired
    AgendaService service;

    @Autowired
    private EsquemaTurnoService esquemaTurnoService;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        return Response.ok(service.findAll());
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") Integer id) {
        Agenda agenda = service.findById(id);
        return (agenda != null)
                ? Response.ok(agenda)
                : Response.notFound();
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody AgendaDTO dto) {
        List<Agenda> saved = service.saveFromDTO(dto);
        return Response.ok(saved);
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody AgendaDTO dto) {
        List<Agenda> saved = service.saveFromDTO(dto);
        return Response.ok(saved);
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Response.ok(service.findByPage(page, size));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") Integer id) {
        service.delete(id);
        return Response.ok("Agenda " + id + " borrada.");
    }

    @RequestMapping(value = "/{id}/cancelar", method = RequestMethod.POST)
    public ResponseEntity<Object> cancelarAgenda(@PathVariable("id") Integer id) {
        try {
            service.cancelarAgendaYNotificarPacientes(id);
            return Response.ok("Agenda cancelada y pacientes notificados.");
        } catch (IllegalArgumentException e) {
            return Response.notFound();
        }
    }

    @RequestMapping(value = "/alternativas/{turnoId}", method = RequestMethod.GET)
    public ResponseEntity<Object> sugerirAlternativas(@PathVariable("turnoId") Integer turnoId) {
        // Busca el turno y llama al método del service
        Turno turno = service.findTurnoById(turnoId);
        if (turno == null)
            return Response.notFound();
        return Response.ok(service.sugerirAlternativas(turno));
    }

    @RequestMapping(value = "/consultorio/{consultorioId}", method = RequestMethod.GET)
    public ResponseEntity<Object> findByConsultorio(@PathVariable("consultorioId") Integer consultorioId) {
        return Response.ok(service.findByConsultorio(consultorioId));
    }

    @RequestMapping(value = "/esquema-turno/all", method = RequestMethod.GET)
    public ResponseEntity<Object> getAllEsquemasTurno() {
        try {
            List<EsquemaTurnoDTO> esquemas = esquemaTurnoService.findAll();
            return Response.ok(esquemas, "Todos los esquemas de turno obtenidos correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener los esquemas de turno: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/generar-desde-esquema/{esquemaTurnoId}", method = RequestMethod.POST)
    public ResponseEntity<List<Agenda>> generarAgenda(
            @PathVariable Integer esquemaTurnoId,
            @RequestParam int semanas) {
        EsquemaTurno esquema = esquemaTurnoRepository.findById(esquemaTurnoId)
                .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
        List<Agenda> agendas = service.generarAgendaDesdeEsquemaTurno(esquema, semanas);
        return ResponseEntity.ok(agendas);
    }

}
