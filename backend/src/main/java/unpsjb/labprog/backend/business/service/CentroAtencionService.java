package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
import unpsjb.labprog.backend.model.CentroAtencion;

@Service
public class CentroAtencionService {

    private final CentroAtencionRepository repository;

    public CentroAtencionService(CentroAtencionRepository repository) {
        this.repository = repository;
    }

    public List<CentroAtencionDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<CentroAtencionDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    public CentroAtencion findEntityById(Integer id) {
        return repository.findById(id).orElse(null);
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
    public CentroAtencionDTO saveOrUpdate(CentroAtencionDTO dto) {
        CentroAtencion centro = toEntity(dto);

        // Validar los campos obligatorios y formato
        validateCentroAtencion(centro);

        if (centro.getId() == null) {
            // 🚀 CREACIÓN
            if (repository.existsByNombreAndDireccion(centro.getNombre(), centro.getDireccion())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un centro de atención con ese nombre y dirección");

            }
            if (repository.existsByDireccion(centro.getDireccion())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un centro de atención con esa dirección");
            }
            if (repository.existsByNombre(centro.getNombre())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un centro de atención con ese nombre");
            }
        } else {
            // 🛠️ MODIFICACIÓN
            CentroAtencion existente = repository.findById(centro.getId()).orElse(null);
            if (existente == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe el centro que se intenta modificar");
            }

            if (repository.existsByNombreAndDireccionAndIdNot(centro.getNombre(), centro.getDireccion(),
                    centro.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un centro de atención con ese nombre y dirección");
            }
            if (repository.existsByDireccionAndIdNot(centro.getDireccion(), centro.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un centro de atención con esa dirección");
            }
            if (repository.existsByNombreAndIdNot(centro.getNombre(), centro.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un centro de atención con ese nombre");
            }
        }
        // Actualizar los datos
        centro.setNombre(dto.getNombre());
        centro.setDireccion(dto.getDireccion());
        centro.setLocalidad(dto.getLocalidad());
        centro.setProvincia(dto.getProvincia());
        centro.setTelefono(dto.getTelefono());
        centro.setLatitud(dto.getLatitud());
        centro.setLongitud(dto.getLongitud());

        repository.save(centro);

        // Guardar el centro y devolver el DTO
        return toDTO(repository.save(centro));
    }

    @Transactional
    public void save(CentroAtencion centro) {
        repository.save(centro);
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    public boolean existsByDireccionAndIdNot(String direccion, Integer id) {
        return repository.existsByDireccionAndIdNot(direccion, id);
    }

    public boolean existsByNombreAndDireccionAndIdNot(String nombre, String direccion, Integer id) {
        return repository.existsByNombreAndDireccionAndIdNot(nombre, direccion, id);
    }

    public boolean existsByCoordenadasAndIdNot(Double latitud, Double longitud, Integer id) {
        return repository.existsByCoordenadasAndIdNot(latitud, longitud, id);
    }

    private CentroAtencionDTO toDTO(CentroAtencion c) {
        CentroAtencionDTO dto = new CentroAtencionDTO();
        dto.setId(c.getId());
        dto.setNombre(c.getNombre());
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
        centro.setNombre(dto.getNombre());
        centro.setDireccion(dto.getDireccion());
        centro.setLocalidad(dto.getLocalidad());
        centro.setProvincia(dto.getProvincia());
        centro.setTelefono(dto.getTelefono());
        centro.setLatitud(dto.getLatitud());
        centro.setLongitud(dto.getLongitud());
        return centro;
    }

    private void validateCentroAtencion(CentroAtencion c) {
        if (c.getNombre() == null || c.getNombre().isBlank()) {
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
            throw new IllegalArgumentException("Las coordenadas son inválidas");
        }
        if (c.getLatitud() < -90 || c.getLatitud() > 90) {
            throw new IllegalArgumentException("Las coordenadas son inválidas");
        }
        if (c.getLongitud() < -180 || c.getLongitud() > 180) {
            throw new IllegalArgumentException("Las coordenadas son inválidas");
        }
    }

}