package unpsjb.labprog.backend.business;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.model.CentroAtencion;

@Service
public class CentroAtencionService {

    @Autowired
    CentroAtencionRepository repository;

    public List<CentroAtencion> findAll() {
        List<CentroAtencion> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        System.out.println("DEBUG: Centros actuales en base -> " + result);
        return result;
    }
    

    public CentroAtencion findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Page<CentroAtencion> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public List<CentroAtencion> search(String term) {
        return repository.search("%" + term.toUpperCase() + "%");
    }

    @Transactional
    public CentroAtencion save(CentroAtencion c) {
        if (c.getId() == 0) {
            // Validación sólo para creación
            if (repository.existsByNameAndDireccion(c.getName(), c.getDireccion())) {
                throw new IllegalStateException("Ya existe un centro de atención con ese nombre y dirección");
            }
            if (repository.existsByDireccion(c.getDireccion())) {
                throw new IllegalStateException("Ya existe un centro de atención con esa dirección");
            }
        }
        return repository.save(c);
    }


    @Transactional
    public void delete(int id) {
        repository.deleteById(id);
    }
}