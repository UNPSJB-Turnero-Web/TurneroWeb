package unpsjb.labprog.backend.presenter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.CentroAtencionService;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;

@RestController
@RequestMapping("centrosAtencion")
public class CentroAtencionPresenter {

    @Autowired
    private CentroAtencionService service;

    @Autowired
    private ObjectMapper objectMapper;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        List<CentroAtencionDTO> dtos = service.findAll();
        List<Map<String, Object>> centrosMapeados = dtos.stream().map(c -> {
            // Map automático con ObjectMapper
            Map<String, Object> map = objectMapper.convertValue(c, Map.class);

            // Agregar el campo coordenadas combinando latitud y longitud
            if (c.getLatitud() != null && c.getLongitud() != null) {
                map.put("coordenadas", c.getLatitud() + "," + c.getLongitud());
            } else {
                map.put("coordenadas", null);
            }

            return map;
        }).toList();

        return Response.ok(centrosMapeados);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") int id) {
        Optional<CentroAtencionDTO> optionalCentro = service.findById(id);
        if (optionalCentro.isEmpty()) {
            return Response.notFound("Centro de atención id " + id + " no encontrado");
        }

        CentroAtencionDTO c = optionalCentro.get();
        Map<String, Object> map = objectMapper.convertValue(c, Map.class);
        if (c.getLatitud() != null && c.getLongitud() != null) {
            map.put("coordenadas", c.getLatitud() + "," + c.getLongitud());
        } else {
            map.put("coordenadas", null);
        }

        return Response.ok(map);
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageResult = service.findByPage(page, size);

        List<Map<String, Object>> centrosMapeados = pageResult.getContent().stream().map(c -> {
            Map<String, Object> map = objectMapper.convertValue(c, Map.class);
            if (c.getLatitud() != null && c.getLongitud() != null) {
                map.put("coordenadas", c.getLatitud() + "," + c.getLongitud());
            } else {
                map.put("coordenadas", null);
            }
            return map;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("content", centrosMapeados);
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalElements", pageResult.getTotalElements());
        response.put("currentPage", pageResult.getNumber());

        return Response.ok(response);
    }

    @RequestMapping(value = "/search/{term}", method = RequestMethod.GET)
    public ResponseEntity<Object> search(@PathVariable("term") String term) {
        return Response.ok(service.search(term));
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> create(@RequestBody JsonNode json) {
        try {
            // Convertir el JSON a DTO
            CentroAtencionDTO dto = objectMapper.treeToValue(json, CentroAtencionDTO.class);

            // Validaciones adicionales
            if (dto.getId() != 0) {
                return Response.error(dto, "El centro de atención no puede tener un ID definido al crearse.");
            }

            // Guardar el DTO
            CentroAtencionDTO saved = service.save(dto);
            return Response.ok(saved, "Centro de atención creado correctamente");

        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<Object> update(@RequestBody JsonNode json) {
        try {
            // Convertir el JSON a DTO
            CentroAtencionDTO dto = objectMapper.treeToValue(json, CentroAtencionDTO.class);

            if (dto.getId() <= 0) {
                return Response.error(dto, "Debe proporcionar un ID válido para actualizar.");
            }

            // Validar conflictos de nombre y dirección
            if (service.existsByNameAndDireccionAndIdNot(dto.getName(), dto.getDireccion(), dto.getId())) {
                return Response.dbError("Ya existe un centro de atención con ese nombre y dirección");
            }
            if (service.existsByDireccionAndIdNot(dto.getDireccion(), dto.getId())) {
                return Response.dbError("Ya existe un centro de atención con esa dirección");
            }

            // Validar coordenadas duplicadas
            if (service.existsByCoordenadasAndIdNot(dto.getLatitud(), dto.getLongitud(), dto.getId())) {
                return Response.error(null, "Las coordenadas ya están asociadas a otro centro de atención");
            }

            CentroAtencionDTO saved = service.save(dto);
            return Response.ok(saved, "Centro de atención modificado correctamente");

        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Object> delete(@PathVariable("id") Integer id) {
        try {
            service.delete(id);
            return Response.ok("Centro de atención " + id + " eliminado correctamente.");
        } catch (Exception e) {
            return Response.dbError(e.getMessage());
        }
    }

    @RequestMapping(value = "/reset", method = RequestMethod.DELETE)
    public ResponseEntity<Object> resetCentros() {
        service.findAll().forEach(c -> service.delete(c.getId()));
        return Response.ok("Reset completo.");
    }

}
