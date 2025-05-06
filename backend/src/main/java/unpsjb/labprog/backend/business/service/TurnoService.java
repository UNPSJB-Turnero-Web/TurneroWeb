package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.model.Turno;

import java.util.List;
import java.util.Optional;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository repository;

    public List<Turno> findAll() {
        return (List<Turno>) repository.findAll();
    }

    public Optional<Turno> findById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Turno save(Turno turno) {
        if (turno.getId() == 0) {
            // 🚀 CREACIÓN
            if (repository.existsByFechaAndHoraAndCentroAtencion(turno.getFecha(), turno.getHoraInicio(), turno.getCentroAtencion())) {
                throw new IllegalStateException("Ya existe un turno registrado en esta fecha y hora para este centro de atención");
            }
        } else {
            // 🛠️ MODIFICACIÓN
            Turno existente = repository.findById(turno.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el turno que se intenta modificar");
            }

            // Verificar conflictos de horarios
            if (repository.existsByFechaAndHoraAndCentroAtencion(turno.getFecha(), turno.getHoraInicio(), turno.getCentroAtencion())) {
                throw new IllegalStateException("Ya existe un turno registrado en esta fecha y hora para este centro de atención");
            }
        }
        return repository.save(turno);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Page<Turno> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }
}
