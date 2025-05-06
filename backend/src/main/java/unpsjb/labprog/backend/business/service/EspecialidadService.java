package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.model.Especialidad;

@Service
public class EspecialidadService {

    @Autowired
    EspecialidadRepository repository;

    public List<Especialidad> findAll() {
        List<Especialidad> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Especialidad findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Especialidad save(Especialidad especialidad) {
        // Validaciones para evitar duplicados
        if (especialidad.getId() == 0) {
            // 🚀 CREACIÓN
            if (repository.existsByNombre(especialidad.getNombre())) {
                throw new IllegalStateException("Ya existe una especialidad con el nombre: " + especialidad.getNombre());
            }
        } else {
            // 🛠️ MODIFICACIÓN
            Especialidad existente = repository.findById(especialidad.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe la especialidad que se intenta modificar.");
            }

            // Verificar si el nuevo nombre ya está siendo usado por otra especialidad
            if (!existente.getNombre().equalsIgnoreCase(especialidad.getNombre()) &&
                repository.existsByNombre(especialidad.getNombre())) {
                throw new IllegalStateException("Ya existe una especialidad con el nombre: " + especialidad.getNombre());
            }
        }

        return repository.save(especialidad);
    }

    public Page<Especialidad> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
