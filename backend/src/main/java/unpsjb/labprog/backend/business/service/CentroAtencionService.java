package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.model.CentroAtencion;

@Service
public class CentroAtencionService {

    @Autowired
    private CentroAtencionRepository repository;

    public List<CentroAtencion> findAll() {
        return (List<CentroAtencion>) repository.findAll();
    }

    public Optional<CentroAtencion> findById(int id) {
        return repository.findById(id);
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
            // 🚀 CREACIÓN
            if (repository.existsByNameAndDireccion(c.getName(), c.getDireccion())) {
                throw new IllegalStateException("Ya existe un centro de atención con ese nombre y dirección");
            }
            if (repository.existsByName(c.getName())) {
                throw new IllegalStateException("Ya existe un centro de atención con ese nombre");
            }
            if (repository.existsByDireccion(c.getDireccion())) {
                throw new IllegalStateException("Ya existe un centro de atención con esa dirección");
            }
        } else {
            // 🛠️ MODIFICACIÓN
            CentroAtencion existente = repository.findById(c.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el centro que se intenta modificar");
            }

            // Verificar si quiere cambiar el nombre o dirección a uno ya usado por OTRO centro
            List<CentroAtencion> todos = findAll();
            for (CentroAtencion otro : todos) {
                if (otro.getId() != c.getId()) {
                    boolean mismoNombre = otro.getName().trim().equalsIgnoreCase(c.getName().trim());
                    boolean mismaDireccion = otro.getDireccion().trim().equalsIgnoreCase(c.getDireccion().trim());

                    if (mismoNombre && mismaDireccion) {
                        throw new IllegalStateException("Ya existe un centro de atención con ese nombre y dirección");
                    }

                    if (mismoNombre) {
                        throw new IllegalStateException("Ya existe un centro de atención con ese nombre");
                    }
                    if (mismaDireccion) {
                        throw new IllegalStateException("Ya existe un centro de atención con esa dirección");
                    }
                }
            }
        }
        return repository.save(c);
    }

    @Transactional
    public void delete(int id) {
        repository.deleteById(id);
    }
}