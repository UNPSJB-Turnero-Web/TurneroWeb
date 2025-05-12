package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
import unpsjb.labprog.backend.model.CentroAtencion;

@Service
public class CentroAtencionService {

    @Autowired
    private CentroAtencionRepository repository;

    public List<CentroAtencionDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<CentroAtencionDTO> findById(int id) {
        return repository.findById(id).map(this::toDTO);
    }

    public Page<CentroAtencionDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public List<CentroAtencionDTO> search(String term) {
        return repository.search("%" + term.toUpperCase() + "%").stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public CentroAtencionDTO save(CentroAtencionDTO dto) {
        CentroAtencion centro = toEntity(dto);

        // Validaciones de campos obligatorios y formato
        validateCentroAtencion(centro);

        // Validaciones de creación o modificación
        if (centro.getId() == 0) {
            // 🚀 CREACIÓN
            if (repository.existsByNameAndDireccion(centro.getName(), centro.getDireccion())) {
                throw new IllegalStateException("Ya existe un centro de atención con ese nombre y dirección");
            }
        } else {
            // 🛠️ MODIFICACIÓN
            CentroAtencion existente = repository.findById(centro.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el centro que se intenta modificar");
            }

            if (repository.existsByNameAndDireccionAndIdNot(centro.getName(), centro.getDireccion(), centro.getId())) {
                throw new IllegalStateException("Ya existe un centro de atención con ese nombre y dirección");
            }
        }

        return toDTO(repository.save(centro));
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

    private CentroAtencionDTO toDTO(CentroAtencion c) {
        CentroAtencionDTO dto = new CentroAtencionDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDireccion(c.getDireccion());
        dto.setLocalidad(c.getLocalidad());
        dto.setProvincia(c.getProvincia());
        dto.setTelefono(c.getTelefono());
        dto.setLatitud(c.getLatitud());
        dto.setLongitud(c.getLongitud());
        return dto;
    }

    private CentroAtencion toEntity(CentroAtencionDTO dto) {
        CentroAtencion centro = new CentroAtencion();
        centro.setId(dto.getId());
        centro.setName(dto.getName());
        centro.setDireccion(dto.getDireccion());
        centro.setLocalidad(dto.getLocalidad());
        centro.setProvincia(dto.getProvincia());
        centro.setTelefono(dto.getTelefono());
        centro.setLatitud(dto.getLatitud());
        centro.setLongitud(dto.getLongitud());
        return centro;
    }

    private void validateCentroAtencion(CentroAtencion c) {
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
        if (c.getLatitud() == null || c.getLongitud() == null) {
            throw new IllegalArgumentException("Las coordenadas no pueden ser nulas.");
        }
        if (c.getLatitud() < -90 || c.getLatitud() > 90) {
            throw new IllegalArgumentException("La latitud debe estar entre -90 y 90.");
        }
        if (c.getLongitud() < -180 || c.getLongitud() > 180) {
            throw new IllegalArgumentException("La longitud debe estar entre -180 y 180.");
        }
    }
}