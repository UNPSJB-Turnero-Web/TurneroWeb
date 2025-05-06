package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.model.Consultorio;

import java.util.List;

@RestController
@RequestMapping("consultorios")
public class ConsultorioPresenter {

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
