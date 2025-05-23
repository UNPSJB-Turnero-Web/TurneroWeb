package unpsjb.labprog.backend.presenter;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ConsultorioService;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
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

    @GetMapping("/page")
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
                "currentPage", pageResult.getNumber());

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
            ConsultorioDTO saved = service.saveOrUpdate(consultorioDTO); 
            return Response.ok(saved, "Consultorio creado correctamente");
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                return Response.dbError(e.getReason());
            }
            return Response.error(null, e.getReason());
        } catch (IllegalArgumentException e) {
            return Response.dbError(e.getMessage());
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al crear el consultorio: " + e.getMessage());
        }
    }

    @GetMapping("/centrosAtencion/{centroId}/consultorios")
    public ResponseEntity<Object> getConsultoriosByCentro(@PathVariable int centroId) {
        List<ConsultorioDTO> consultorios = service.findByCentroAtencionId((long) centroId);
        return Response.ok(consultorios, "Consultorios recuperados correctamente");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable int id, @RequestBody ConsultorioDTO consultorioDTO) {
        try {
            consultorioDTO.setId(id);
            ConsultorioDTO updated = service.saveOrUpdate(consultorioDTO); 
            return Response.ok(updated, "Consultorio actualizado correctamente");
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                return Response.dbError(e.getReason());
            }
            return Response.error(null, e.getReason());
        } catch (IllegalArgumentException e) {
            return Response.dbError(e.getMessage());
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar el consultorio: " + e.getMessage());
        }
    }

    @PostMapping("/centro/{centroId}")
    public ResponseEntity<Object> createInCentro(@PathVariable int centroId, @RequestBody ConsultorioDTO consultorioDTO) {
        try {
            CentroAtencionDTO centro = new CentroAtencionDTO();
            centro.setId(centroId);
            consultorioDTO.setCentroAtencion(centro);

            ConsultorioDTO saved = service.saveOrUpdate(consultorioDTO);
            return Response.ok(saved, "Consultorio creado correctamente");
        } catch (IllegalArgumentException e) {
            return Response.dbError(e.getMessage());
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al crear el consultorio: " + e.getMessage());
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
