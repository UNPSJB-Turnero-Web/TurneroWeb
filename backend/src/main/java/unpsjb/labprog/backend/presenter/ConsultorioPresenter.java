package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.CentroAtencionService;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

import java.util.List;
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
            return ResponseEntity.notFound().build();
        }
        CentroAtencion centro = centroOpt.get();
        centro.agregarConsultorio(consultorio);
        consultorioService.save(consultorio);
        return ResponseEntity.ok("Consultorio agregado exitosamente.");
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
