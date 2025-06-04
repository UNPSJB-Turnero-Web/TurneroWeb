package unpsjb.labprog.backend.presenter;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.TurnoService;
import unpsjb.labprog.backend.dto.TurnoDTO;

@RestController
@RequestMapping("turno")
public class TurnoPresenter {

    @Autowired
    private TurnoService service;

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<TurnoDTO> turnos = service.findAll();
        return Response.ok(turnos, "Turnos recuperados correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(turno -> Response.ok(turno, "Turno recuperado correctamente"))
                .orElse(Response.notFound("Turno no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody TurnoDTO turnoDTO) {
        TurnoDTO saved = service.save(turnoDTO);
        return Response.ok(saved, "Turno creado correctamente");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Integer id, @RequestBody TurnoDTO turnoDTO) {
        turnoDTO.setId(id);
        TurnoDTO updated = service.save(turnoDTO);
        return Response.ok(updated, "Turno actualizado correctamente");
    }

     @GetMapping("/page")
    public ResponseEntity<Object> getByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageResult = service.findByPage(page, size);

            var response = Map.of(
                    "content", pageResult.getContent(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements(),
                    "number", pageResult.getNumber(),
                    "size", pageResult.getSize(),
                    "first", pageResult.isFirst(),
                    "last", pageResult.isLast(),
                    "numberOfElements", pageResult.getNumberOfElements());

            return Response.ok(response, "Staff médico paginado recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el staff médico paginado: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Integer id) {
        service.delete(id);
        return Response.ok(null, "Turno eliminado correctamente");
    }


    @PostMapping("/asignar")
public ResponseEntity<Object> asignarTurno(@RequestBody TurnoDTO turnoDTO) {
    try {
        TurnoDTO savedTurno = service.save(turnoDTO);
        return Response.ok(savedTurno, "Turno asignado correctamente.");
    } catch (IllegalArgumentException e) {
        return Response.dbError(e.getMessage());
    } catch (Exception e) {
        return Response.error(null, "Error al asignar el turno.");
    }
}

   
}
