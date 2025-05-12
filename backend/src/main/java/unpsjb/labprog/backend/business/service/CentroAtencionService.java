package unpsjb.labprog.backend.business.service;

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
              // 1. Validaciones de campos obligatorios y formato
              if (c.getName() == null || c.getName().isBlank()) {
                throw new IllegalArgumentException("El nombre es requerido");
            }
            if (c.getDireccion() == null || c.getDireccion().isBlank()) {
                throw new IllegalArgumentException("La dirección es requerida");
            }
            if (c.getLocalidad() == null || c.getLocalidad().isBlank()) {
                throw new IllegalArgumentException("La localidad es requerida");
            }
            if (c.getProvincia() == null || c.getProvincia().isBlank()) {
                throw new IllegalArgumentException("La provincia es requerida");
            }
            if (c.getTelefono() == null || c.getTelefono().isBlank()) {
                throw new IllegalArgumentException("El teléfono es requerido");
            }
            if (!c.getTelefono().matches("\\d+")) {
                throw new IllegalArgumentException("El teléfono solo puede contener números.");
            }
    
            // 2. Validación de coordenadas (null y formato)
            if (c.getLatitud() == null || c.getLongitud() == null) {
                throw new IllegalArgumentException("Las coordenadas no pueden ser nulas.");
            }
            if (c.getLatitud() < -90 || c.getLatitud() > 90) {
                throw new IllegalArgumentException("La latitud debe estar entre -90 y 90.");
            }
            if (c.getLongitud() < -180 || c.getLongitud() > 180) {
                throw new IllegalArgumentException("La longitud debe estar entre -180 y 180.");
            }    
        
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

    public boolean existsByDireccionAndIdNot(String direccion, int id) {
        return repository.existsByDireccionAndIdNot(direccion, id);
    }

    public boolean existsByNameAndDireccionAndIdNot(String name, String direccion, int id) {
        return repository.existsByNameAndDireccionAndIdNot(name, direccion, id);
    }

    public boolean existsByCoordenadasAndIdNot(Double latitud, Double longitud, int id) {
        return repository.existsByCoordenadasAndIdNot(latitud, longitud, id);
    }
}