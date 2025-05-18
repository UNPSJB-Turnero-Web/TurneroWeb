package unpsjb.labprog.backend.presenter;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import unpsjb.labprog.backend.business.service.StaffMedicoService;
import unpsjb.labprog.backend.dto.StaffMedicoDTO;

@RestController
@RequestMapping("staff-medico")
public class StaffMedicoPresenter {

    @Autowired
    private StaffMedicoService service;

    // Listar todos los staff médicos (con DTO y respuesta estructurada)
    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<StaffMedicoDTO> lista = service.findAll();
        return Response.ok(lista, "Staff médico recuperado correctamente");
    }

    // Obtener staff médico por ID
    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Long id) {
        Optional<StaffMedicoDTO> dtoOpt = service.findById(id);
        if (!dtoOpt.isPresent()) {
            return Response.notFound("No se encontró el staff médico con id " + id);
        }
        return Response.ok(dtoOpt.get(), "Staff médico recuperado correctamente");
    }

    @GetMapping("/centrosAtencion/{centroId}/staffMedico")
    public ResponseEntity<Object> getStaffMedicoByCentro(@PathVariable Long centroId) {
        List<StaffMedicoDTO> staff = service.findByCentroId(centroId);
        return Response.ok(staff, "Staff médico recuperado correctamente");
    }

    // Listar médicos con paginación
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

    // Asociar médico a centro
    @PostMapping
    public ResponseEntity<Object> create(@RequestBody StaffMedicoDTO dto) {
        try {
            StaffMedicoDTO saved = service.saveOrUpdate(dto);
            return Response.ok(saved, "Médico asociado correctamente al centro");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Long id, @RequestBody StaffMedicoDTO dto) {
        try {
            dto.setId(id);
            StaffMedicoDTO updated = service.saveOrUpdate(dto);
            return Response.ok(updated, "Staff médico editado exitosamente");
        } catch (IllegalStateException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error inesperado: " + e.getMessage());
        }
    }

    // Eliminar asociación
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return Response.ok(null, "Asociación eliminada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar la asociación: " + e.getMessage());
        }
    }

    // Listar médicos asociados a un centro
    @GetMapping("/centro/{centroId}")
    public ResponseEntity<Object> getByCentro(@PathVariable Long centroId) {
        try {
            List<StaffMedicoDTO> lista = service.findByCentroId(centroId);
            return Response.ok(lista, "Médicos asociados recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar médicos asociados: " + e.getMessage());
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

    // Otros endpoints según necesidad...
}