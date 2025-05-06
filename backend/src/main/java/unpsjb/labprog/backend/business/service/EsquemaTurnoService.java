package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.model.EsquemaTurno;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EsquemaTurnoService {

    @Autowired
    private EsquemaTurnoRepository repository;

    public List<EsquemaTurno> findAll() {
        List<EsquemaTurno> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Optional<EsquemaTurno> findById(Long id) {
        return repository.findById(id);
    }

    public EsquemaTurno save(EsquemaTurno esquemaTurno) {
        // Validaciones para evitar duplicados
        if (esquemaTurno.getId() == null) {
            // 🚀 CREACIÓN
            if (repository.existsByNombre(esquemaTurno.getNombre())) {
                throw new IllegalStateException("Ya existe un esquema de turno con el nombre: " + esquemaTurno.getNombre());
            }
        } else {
            // 🛠️ MODIFICACIÓN
            EsquemaTurno existente = repository.findById(esquemaTurno.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el esquema de turno que se intenta modificar.");
            }

            // Verificar si el nuevo nombre ya está siendo usado por otro esquema
            if (!existente.getNombre().equalsIgnoreCase(esquemaTurno.getNombre()) &&
                repository.existsByNombre(esquemaTurno.getNombre())) {
                throw new IllegalStateException("Ya existe un esquema de turno con el nombre: " + esquemaTurno.getNombre());
            }
        }

        return repository.save(esquemaTurno);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}