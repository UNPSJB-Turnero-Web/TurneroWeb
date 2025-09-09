package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.OperadorService;
import unpsjb.labprog.backend.dto.OperadorDTO;
import java.util.List;

@RestController
@RequestMapping("operadores")
public class OperadorController {

    @Autowired
    private OperadorService operadorService;

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<OperadorDTO> operadores = operadorService.findAll();
        return Response.ok(operadores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Long id) {
        return operadorService.findById(id)
                .map(Response::ok)
                .orElse(Response.notFound("Operador no encontrado"));
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<Object> getByDni(@PathVariable Long dni) {
        return operadorService.findByDni(dni)
                .map(Response::ok)
                .orElse(Response.notFound("Operador no encontrado"));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Object> getByEmail(@PathVariable String email) {
        return operadorService.findByEmail(email)
                .map(Response::ok)
                .orElse(Response.notFound("Operador no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody OperadorDTO dto) {
        try {
            OperadorDTO saved = operadorService.saveOrUpdate(dto);
            return Response.ok(saved, "Operador creado exitosamente");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al crear operador: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Long id, @RequestBody OperadorDTO dto) {
        try {
            dto.setId(id);
            OperadorDTO updated = operadorService.saveOrUpdate(dto);
            return Response.ok(updated, "Operador actualizado exitosamente");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al actualizar operador: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        try {
            operadorService.delete(id);
            return Response.ok(null, "Operador eliminado exitosamente");
        } catch (Exception e) {
            return Response.serverError("Error al eliminar operador: " + e.getMessage());
        }
    }

    @PatchMapping("/baja-logica/{id}")
    public ResponseEntity<Object> bajaLogica(@PathVariable Long id) {
        try {
            operadorService.deleteLogico(id);
            return Response.ok(null, "Operador dado de baja lógicamente");
        } catch (IllegalArgumentException e) {
            return Response.notFound(e.getMessage());
        } catch (Exception e) {
            return Response.serverError("Error al dar de baja operador: " + e.getMessage());
        }
    }
}
