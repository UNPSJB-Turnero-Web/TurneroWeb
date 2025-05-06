package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.model.ObraSocial;
import unpsjb.labprog.backend.business.repository.ObraSocialRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ObraSocialService {

    @Autowired
    private ObraSocialRepository repository;

    public List<ObraSocial> findAll() {
        List<ObraSocial> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Optional<ObraSocial> findById(Integer id) {
        return repository.findById(id);
    }

    public ObraSocial save(ObraSocial obraSocial) {
        // Validaciones para evitar duplicados
        if (obraSocial.getId() == null || obraSocial.getId() == 0) {
            // 🚀 CREACIÓN
            if (repository.existsByNombre(obraSocial.getNombre())) {
                throw new IllegalStateException("Ya existe una obra social con el nombre: " + obraSocial.getNombre());
            }
        } else {
            // 🛠️ MODIFICACIÓN
            ObraSocial existente = repository.findById(obraSocial.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe la obra social que se intenta modificar.");
            }

            // Verificar si el nuevo nombre ya está siendo usado por otra obra social
            if (!existente.getNombre().equalsIgnoreCase(obraSocial.getNombre()) &&
                repository.existsByNombre(obraSocial.getNombre())) {
                throw new IllegalStateException("Ya existe una obra social con el nombre: " + obraSocial.getNombre());
            }
        }

        return repository.save(obraSocial);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}