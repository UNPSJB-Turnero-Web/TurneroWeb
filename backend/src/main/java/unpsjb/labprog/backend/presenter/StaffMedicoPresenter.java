package unpsjb.labprog.backend.presenter;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.business.service.StaffMedicoService;
import unpsjb.labprog.backend.dto.StaffMedicoDTO;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.StaffMedico;

@RestController
@RequestMapping("/api/staff-medico")
public class StaffMedicoPresenter {

    @Autowired
    private StaffMedicoRepository repository;

    @Autowired
    private TurnoRepository turnoRepository;
    @Autowired
    private StaffMedicoService service;

    @GetMapping
    public List<StaffMedico> getAll() {
        List<StaffMedico> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffMedico> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody StaffMedicoDTO dto) {
        // Validar que el médico y el centro existen
        if (dto.getMedico() == null || dto.getCentro() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar médico y centro.");
        }
        // Verificar que no exista la asociación
        Medico medico = new Medico();
        medico.setId(dto.getMedico().getId());
        CentroAtencion centro = new CentroAtencion();
        centro.setId(dto.getCentro().getId());
        boolean exists = repository.existsByMedicoAndCentro(medico, centro);
        if (exists) {
            return ResponseEntity.badRequest().body("El médico ya está asociado a este centro.");
        }
        // Guardar
        service.save(dto);
        return ResponseEntity.ok("Médico asociado correctamente.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffMedico> update(@PathVariable Long id, @RequestBody StaffMedico updatedStaff) {
        return repository.findById(id)
                .map(existingStaff -> {
                    existingStaff.setCentro(updatedStaff.getCentro());
                    existingStaff.setMedico(updatedStaff.getMedico());
                    existingStaff.setDisponibilidad(updatedStaff.getDisponibilidad());
                    return ResponseEntity.ok(repository.save(existingStaff));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        // Verificar si hay turnos activos
        if (turnoRepository.existsByStaffMedicoIdAndActivoTrue(id)) {
            return ResponseEntity.badRequest().body("No se puede desasociar: hay turnos activos.");
        }
        service.deleteById(id);
        return ResponseEntity.ok("Médico desasociado correctamente.");
    }
}