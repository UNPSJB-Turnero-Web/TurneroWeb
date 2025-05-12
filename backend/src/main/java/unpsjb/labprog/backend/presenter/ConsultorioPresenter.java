package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import java.util.List;

@RestController
@RequestMapping("consultorios")
public class ConsultorioPresenter {

    @Autowired
    private ConsultorioService service;

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<ConsultorioDTO> consultorios = service.findAll();
        return Response.ok(consultorios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable("id") int id) {
        ConsultorioDTO consultorio = service.findById(id);
        return Response.ok(consultorio);
    }
}
