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
import unpsjb.labprog.backend.business.service.EspecialidadService;
import unpsjb.labprog.backend.dto.EspecialidadDTO;

@RestController
@RequestMapping("especialidades")
public class EspecialidadPresenter {

    @Autowired
    EspecialidadService service;

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<EspecialidadDTO> especialidades = service.findAll();
        return Response.ok(especialidades, "Especialidades recuperadas correctamente");
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
                    "currentPage", pageResult.getNumber());

            return Response.ok(response, "Especialidades paginadas recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las especialidades paginadas: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable int id) {
        try {
            EspecialidadDTO dto = service.findById(id);
            if (dto == null) {
                return Response.notFound("No se encontró la especialidad con id " + id);
            }
            return Response.ok(dto, "Especialidad recuperada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar la especialidad: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody EspecialidadDTO dto) {
        try {
            EspecialidadDTO saved = service.saveOrUpdate(dto);
            return Response.ok(saved, "Especialidad creada correctamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable int id, @RequestBody EspecialidadDTO dto) {
        try {
            dto.setId(id);
            EspecialidadDTO updated = service.saveOrUpdate(dto);
            return Response.ok(updated, "Especialidad editada exitosamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable int id) {
        try {
            service.delete(id);
            return Response.ok(null, "Especialidad eliminada exitosamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Object> reset() {
        try {
            service.deleteAll();
            return Response.ok(null, "Base de datos de especialidades reseteada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al resetear la base de datos: " + e.getMessage());
        }
    }

    // Get especialidades no asociadas a un centro de atencion
    @GetMapping("/centrosAtencion/{centroId}/especialidades/disponibles")
    public ResponseEntity<Object> getEspecialidadesNoAsociadas(@PathVariable int centroId) {
        try {
            List<EspecialidadDTO> disponibles = service.findEspecialidadesNoAsociadas(centroId);
            return Response.ok(disponibles, "Especialidades no asociadas recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar especialidades no asociadas: " + e.getMessage());
        }
    }

    // get especialidades asociadas a un centro de atencion
    @GetMapping("/centrosAtencion/{centroId}/especialidades")
    public ResponseEntity<Object> getByCentroAtencion(@PathVariable int centroId) {
        try {
            List<EspecialidadDTO> especialidades = service.findByCentroAtencionId(centroId);
            return Response.ok(especialidades, "Especialidades asociadas recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar especialidades asociadas: " + e.getMessage());
        }
    }

    // get especialidades agrupadas por centro de atencion
    @GetMapping("/centrosAtencion/especialidades")
    public ResponseEntity<Object> getEspecialidadesAgrupadasPorCentro() {
        try {
            List<Map<String, Object>> agrupado = service.findEspecialidadesAgrupadasPorCentro();
            return Response.ok(agrupado, "especialidades asociadas a centros recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar especialidades agrupadas: " + e.getMessage());
        }
    }

    @PostMapping("/centrosAtencion/{centroId}/especialidades/{especialidadId}")
    public ResponseEntity<Object> asociarEspecialidadExistenteACentro(
            @PathVariable int centroId,
            @PathVariable int especialidadId) {
        try {
            EspecialidadDTO result = service.asociarEspecialidadACentro(especialidadId, centroId);
            return Response.ok(result, "Especialidad asociada correctamente al centro");
        } catch (Exception e) {
            return Response.error(null, "Error al asociar especialidad al centro: " + e.getMessage());
        }
    }

    @DeleteMapping("/centrosAtencion/{centroId}/especialidades/{especialidadId}")
    public ResponseEntity<Object> desasociarEspecialidadDeCentro(
            @PathVariable int centroId,
            @PathVariable int especialidadId) {
        try {
            service.desasociarEspecialidadDeCentro(especialidadId, centroId);
            return Response.ok(null, "Especialidad desasociada correctamente del centro");
        } catch (Exception e) {
            return Response.error(null, "No se pudo desasociar la especialidad: " + e.getMessage());
        }
    }
}