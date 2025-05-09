package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.CentroAtencionService;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("consultorios")
public class ConsultorioPresenter {

    @Autowired
    private CentroAtencionService centroService;

    @Autowired
    private ConsultorioService consultorioService;

    @Autowired
    private ConsultorioService service;

    @PostMapping("/crear")
    public ResponseEntity<Object> crearConsultorio(
            @RequestParam String centroNombre,
            @RequestParam int numero,
            @RequestParam String nombre) {
        try {
            Consultorio c = service.create(centroNombre, numero, nombre);
            return Response.ok(c, "Consultorio creado exitosamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        }
    }

    @PostMapping("/agregar")
    public ResponseEntity<Object> agregarConsultorio(
            @RequestParam int centroId,
            @RequestBody Consultorio consultorio) {
        Optional<CentroAtencion> centroOpt = centroService.findById(centroId);
        if (centroOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("status_code", 404);
            response.put("status_text", "Centro de atención no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        CentroAtencion centro = centroOpt.get();
        centro.agregarConsultorio(consultorio);
        consultorioService.save(consultorio);

        Map<String, Object> response = new HashMap<>();
        response.put("status_code", 200);
        response.put("status_text", "Consultorio agregado exitosamente");
        response.put("data", consultorio);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/listar/{centroNombre}")
    public ResponseEntity<Object> listar(@PathVariable String centroNombre) {
        try {
            List<Consultorio> lista = service.findByCentroAtencion(centroNombre);
            return Response.ok(lista, "Listado de consultorios");
        } catch (Exception e) {
            return Response.notFound(e.getMessage());
        }
    }
}
