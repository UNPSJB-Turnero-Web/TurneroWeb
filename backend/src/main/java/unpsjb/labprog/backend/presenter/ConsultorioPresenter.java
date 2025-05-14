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
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
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

    @GetMapping
    public ResponseEntity<Object> findAll() {
        List<ConsultorioDTO> consultorios = service.findAll();
        return Response.ok(consultorios, "Consultorios recuperados correctamente");
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageResult = service.findByPage(page, size);

        List<Map<String, Object>> consultoriosMapeados = pageResult.getContent().stream().map(c -> {
            Map<String, Object> map = objectMapper.convertValue(c, Map.class);
            if (c.getCentroAtencion() != null) {
                map.put("centroAtencion", c.getCentroAtencion().getName());
            } else {
                map.put("centroAtencion", null);
            }
            return map;
        }).toList();

        Map<String, Object> response = Map.of(
                "content", consultoriosMapeados,
                "totalPages", pageResult.getTotalPages(),
                "totalElements", pageResult.getTotalElements(),
                "currentPage", pageResult.getNumber()
        );

        return Response.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable int id) {
        return service.findById(id)
                .map(consultorio -> Response.ok(consultorio, "Consultorio encontrado"))
                .orElse(Response.notFound("Consultorio con id " + id + " no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody ConsultorioDTO consultorioDTO) {
        try {
            ConsultorioDTO saved = service.save(consultorioDTO);
            return Response.ok(saved, "Consultorio creado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al crear el consultorio: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/{centroNombre}", method = RequestMethod.POST)
    public ResponseEntity<Object> create(
            @PathVariable("centroNombre") String centroNombre,
            @RequestBody JsonNode json) {
        try {
            Consultorio consultorio = objectMapper.treeToValue(json, Consultorio.class);
            consultorio.setId(0); // Forzar creación
            CentroAtencion centro = new CentroAtencion();
            centro.setName(centroNombre);
            consultorio.setCentroAtencion(centro);

            // Convertir a DTO
            ConsultorioDTO dto = toDTO(consultorio);

            ConsultorioDTO saved = service.save(dto);
            return Response.ok(saved, "Consultorio creado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody ConsultorioDTO consultorioDTO) {
        try {
            if (consultorioDTO.getId() == 0 || consultorioDTO.getId() <= 0) {
                return Response.error(null, "Debe proporcionar un ID válido para actualizar");
            }
            ConsultorioDTO updated = service.save(consultorioDTO);
            return Response.ok(updated, "Consultorio actualizado correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar el consultorio: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable int id) {
        try {
            service.delete(id);
            return Response.ok(null, "Consultorio eliminado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar el consultorio: " + e.getMessage());
        }
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Object> resetConsultorios() {
        service.findAll().forEach(c -> service.delete(c.getId()));
        return Response.ok("Reset completo.");
    }

    private ConsultorioDTO toDTO(Consultorio c) {
        ConsultorioDTO dto = new ConsultorioDTO();
        dto.setId(c.getId());
        dto.setNumero(c.getNumero());
        dto.setName(c.getName());
        if (c.getCentroAtencion() != null) {
            CentroAtencionDTO cdto = new CentroAtencionDTO();
            cdto.setId(c.getCentroAtencion().getId());
            cdto.setName(c.getCentroAtencion().getName());
            dto.setCentroAtencion(cdto);
        }
        return dto;
    }

}
