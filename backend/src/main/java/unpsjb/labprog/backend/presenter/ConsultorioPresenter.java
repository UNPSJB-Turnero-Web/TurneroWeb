package unpsjb.labprog.backend.presenter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

@RestController
@RequestMapping("consultorios")
public class ConsultorioPresenter {

    @Autowired
    private ConsultorioService service;
    @Autowired
    private ObjectMapper objectMapper;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        List<ConsultorioDTO> consultorios = service.findAll();
        return Response.ok(consultorios);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") Long id) {
        var opt = service.findById(id);
        if (opt.isEmpty()) {
            return Response.notFound("Consultorio id " + id + " no encontrado");
        }
        return Response.ok(opt.get());
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody JsonNode json) {
        try {
            Consultorio consultorio = objectMapper.treeToValue(json, Consultorio.class);

            // Validación: No debe tener ID
            if (consultorio.getId() != 0) {
                return Response.error(consultorio,
                        "Está intentando crear un consultorio. Este no puede tener un id definido.");
            }

            // Validaciones obligatorias
            if (consultorio.getNumero() <= 0) {
                return Response.error(null, "El número del consultorio es requerido y debe ser mayor a 0.");
            }
            if (consultorio.getNombre() == null || consultorio.getNombre().isBlank()) {
                return Response.error(null, "El nombre del consultorio es requerido.");
            }
            if (consultorio.getCentroAtencion() == null 
                || consultorio.getCentroAtencion().getId() <= 0) {
                return Response.error(null, "Debe asociar el consultorio a un Centro de Atención válido.");
            }

            Consultorio saved = service.save(consultorio);
            return Response.ok(saved, "Consultorio creado");

        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @RequestMapping(value = "/{centroNombre}", method = RequestMethod.POST)
    public ResponseEntity<Object> create(
            @PathVariable("centroNombre") String centroNombre,
            @RequestBody JsonNode json) {
        try {
            Consultorio consultorio = objectMapper.treeToValue(json, Consultorio.class);
            consultorio.setId(null); // Forzar creación
            CentroAtencion centro = new CentroAtencion();
            centro.setName(centroNombre);
            consultorio.setCentroAtencion(centro);

            Consultorio saved = service.saveByCentroNombre(consultorio, centroNombre);
            return Response.ok(saved, "Consultorio creado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody JsonNode json) {
        try {
            Consultorio consultorio = objectMapper.treeToValue(json, Consultorio.class);

            if (consultorio.getId() == null || consultorio.getId() <= 0) {
                return Response.error(consultorio, "Debe tener un id válido (> 0) para actualizar.");
            }
            if (consultorio.getNumero() == null || consultorio.getNumero() <= 0) {
                return Response.error(null, "El número del consultorio es requerido y debe ser mayor a 0.");
            }
            if (consultorio.getNombre() == null || consultorio.getNombre().isBlank()) {
                return Response.error(null, "El nombre del consultorio es requerido.");
            }
            if (consultorio.getCentroAtencion() == null 
                || consultorio.getCentroAtencion().getId() <= 0) {
                return Response.error(null, "Debe asociar el consultorio a un Centro de Atención válido.");
            }

            Consultorio saved = service.save(consultorio);
            return Response.ok(saved, "Consultorio modificado correctamente");

        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") Long id) {
        try {
            service.delete(id);
            return Response.ok("Consultorio " + id + " borrado con éxito.");
        } catch (Exception e) {
            return Response.dbError(e.getMessage());
        }
    }
    
}
