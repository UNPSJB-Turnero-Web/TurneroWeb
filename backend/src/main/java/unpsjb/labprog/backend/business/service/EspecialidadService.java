package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.model.Especialidad;

@Service
public class EspecialidadService {

    @Autowired
    private EspecialidadRepository repository;

    public List<Especialidad> findAll() {
        return repository.findAll();
    }

    public Especialidad findById(int id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public Especialidad save(Especialidad esp) {
        System.out.println("DEBUG: Guardando especialidad: " + esp);

        // Validar campos obligatorios
        if (esp.getNombre() == null || esp.getNombre().isBlank()) {
            System.out.println("DEBUG: El nombre es obligatorio");
            throw new IllegalStateException("El nombre es obligatorio");
        }

        if (esp.getDescripcion() == null || esp.getDescripcion().isBlank()) {
            System.out.println("DEBUG: La descripción es obligatoria");
            throw new IllegalStateException("La descripción de la especialidad es obligatoria");
        }

        // Validar unicidad del nombre
        if (esp.getId() == 0) { // Creación
            if (repository.existsByNombreIgnoreCase(esp.getNombre())) {
                System.out.println("DEBUG: Conflicto de nombre en creación");
                throw new IllegalStateException("Ya existe una especialidad con ese nombre");
            }
        } else { // Actualización
            if (repository.existsByNombreIgnoreCase(esp.getNombre())) {
                System.out.println("DEBUG: Conflicto de nombre en actualización");
                throw new IllegalStateException("Ya existe una especialidad con ese nombre");
            }
        }

        // Guardar la especialidad
        System.out.println("DEBUG: Especialidad guardada correctamente");
        return repository.save(esp);
    }

    public Page<Especialidad> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public void delete(int id) {
        if (!repository.existsById(id)) {
            throw new IllegalStateException("No existe una especialidad con el ID: " + id);
        }

        // Si necesitas validar si la especialidad está asignada, descomenta y ajusta esta lógica:
        /*
        if (repository.estaAsignada(id)) {
            throw new IllegalStateException("No se puede eliminar una especialidad asignada");
        }
        */

        repository.deleteById(id);
    }

    @Transactional
    public void deleteAll() {
        repository.deleteAll();
    }
}
