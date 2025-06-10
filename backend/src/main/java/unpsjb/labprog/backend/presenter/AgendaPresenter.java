package unpsjb.labprog.backend.presenter;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.service.AgendaService;
import unpsjb.labprog.backend.business.service.EsquemaTurnoService;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.Turno;

@RestController
@RequestMapping("/agenda")
public class AgendaPresenter {

    @Autowired
    AgendaService service;

    @Autowired
    private AgendaService agendaService;

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

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Response.ok(service.findByPage(page, size));
    }

    // @RequestMapping(value = "/{id}/cancelar", method = RequestMethod.POST)
    // public ResponseEntity<Object> cancelarAgenda(@PathVariable("id") Integer id) {
    //     try {
    //         service.cancelarAgendaYNotificarPacientes(id);
    //         return Response.ok("Agenda cancelada y pacientes notificados.");
    //     } catch (IllegalArgumentException e) {
    //         return Response.notFound();
    //     }
    // }

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

    @GetMapping("/eventos")
    public List<TurnoDTO> obtenerEventos(@RequestParam int esquemaTurnoId, @RequestParam int semanas) {
        EsquemaTurno esquemaTurno = agendaService.findEsquemaTurnoById(esquemaTurnoId);
        if (esquemaTurno == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Esquema de turno no encontrado");
        }

        return agendaService.generarEventosDesdeEsquemaTurno(esquemaTurno, semanas);
    }

    @GetMapping("/eventos/todos")
    public List<TurnoDTO> obtenerTodosLosEventos(@RequestParam int semanas) {
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findAll();
        List<TurnoDTO> todosLosEventos = new ArrayList<>();

        for (EsquemaTurno esquema : esquemas) {
            List<TurnoDTO> eventos = agendaService.generarEventosDesdeEsquemaTurno(esquema, semanas);
            todosLosEventos.addAll(eventos);
        }

        return todosLosEventos;
    }

    @GetMapping("/slots-disponibles/{staffMedicoId}")
    public ResponseEntity<Object> obtenerSlotsDisponiblesPorMedico(
            @PathVariable Integer staffMedicoId,
            @RequestParam(defaultValue = "4") int semanas) {
        try {
            List<TurnoDTO> slotsDisponibles = agendaService.obtenerSlotsDisponiblesPorMedico(staffMedicoId, semanas);
            return Response.ok(slotsDisponibles, "Slots disponibles obtenidos correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener slots disponibles: " + e.getMessage());
        }
    }

}
