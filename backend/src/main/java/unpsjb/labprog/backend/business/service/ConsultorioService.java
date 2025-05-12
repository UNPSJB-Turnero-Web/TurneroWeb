package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

@Service
public class ConsultorioService {

    @Autowired
    private ConsultorioRepository repository;

    @Autowired
    private CentroAtencionRepository centroRepo;

    public List<ConsultorioDTO> findAll() {
        // Traemos todas las entidades y las convertimos a DTO antes de retornarlas
        return repository.findAll().stream()
                         .map(this::toDTO)
                         .toList();
      }
    
      private ConsultorioDTO toDTO(Consultorio c) {
        ConsultorioDTO dto = new ConsultorioDTO();
        dto.setId(c.getId());
        dto.setNumero(c.getNumero());
        dto.setNombre(c.getNombre());
        // Mapeo del Centro de Atención
        CentroAtencion centro = c.getCentroAtencion();
        CentroAtencionDTO centroDto = new CentroAtencionDTO();
        centroDto.setId(centro.getId());
        centroDto.setName(centro.getName());
        centroDto.setDireccion(centro.getDireccion());
        centroDto.setLocalidad(centro.getLocalidad());
        centroDto.setProvincia(centro.getProvincia());
        centroDto.setTelefono(centro.getTelefono());
        centroDto.setLatitud(centro.getLatitud());
        centroDto.setLongitud(centro.getLongitud());
        // (si necesitás staff, también los mapeás aquí)
        dto.setCentroAtencion(centroDto);
    
        return dto;
      }
    // cambia de int a Long
    public Optional<ConsultorioDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    public List<Consultorio> findByCentroAtencion(String centroNombre) {
        CentroAtencion centro = centroRepo.findByName(centroNombre);
        if (centro == null) {
            throw new IllegalStateException("Centro no encontrado");
        }
        return repository.findByCentroAtencion(centro);
    }

    @Transactional
    public Consultorio save(Consultorio consultorio) {
        CentroAtencion centro = centroRepo.findById(consultorio.getCentroAtencion().getId())
                .orElseThrow(() -> new IllegalStateException("Centro de Atención no encontrado"));

        if (consultorio.getId() == null) {
            // CREACIÓN
            if (repository.existsByNumeroAndCentroAtencion(consultorio.getNumero(), centro)) {
                throw new IllegalStateException("El número de consultorio ya está registrado");
            }
            if (repository.existsByNombreAndCentroAtencion(consultorio.getNombre(), centro)) {
                throw new IllegalStateException("El nombre del consultorio ya está registrado");
            }
        } else {
            // EDICIÓN
            Consultorio existente = repository.findById(consultorio.getId())
                    .orElseThrow(() -> new IllegalStateException("Consultorio no encontrado"));
            if (!existente.getCentroAtencion().equals(centro)) {
                throw new IllegalStateException("No se puede cambiar el Centro de Atención del consultorio");
            }
            if (!existente.getNumero().equals(consultorio.getNumero())) {
                if (repository.existsByNumeroAndCentroAtencion(consultorio.getNumero(), centro)) {
                    throw new IllegalStateException("El número de consultorio ya está en uso");
                }
            }
            if (!existente.getNombre().equals(consultorio.getNombre())) {
                if (repository.existsByNombreAndCentroAtencion(consultorio.getNombre(), centro)) {
                    throw new IllegalStateException("El nombre del consultorio ya está registrado");
                }
            }
        }

        consultorio.setCentroAtencion(centro);
        return repository.save(consultorio);
    }

    @Transactional
    // cambia de int a Long
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public Consultorio saveByCentroNombre(Consultorio consultorio, String centroNombre) {
        CentroAtencion centro = centroRepo.findByName(centroNombre);
        if (centro == null) {
            throw new IllegalStateException("Centro de Atención no encontrado");
        }
        if (repository.existsByNumeroAndCentroAtencion(consultorio.getNumero(), centro)) {
            throw new IllegalStateException("El número de consultorio ya está en uso");
        }
        consultorio.setCentroAtencion(centro);
        return repository.save(consultorio);
    }

    @RequestMapping(value = "/{centroNombre}/listar", method = RequestMethod.GET)
    public ResponseEntity<Object> listarPorCentro(@PathVariable("centroNombre") String centroNombre) {
        try {
            List<Consultorio> consultorios = findByCentroAtencion(centroNombre);
            var data = consultorios.stream()
                .map(c -> Map.of("numero", c.getNumero(), "nombre", c.getNombre()))
                .toList();
            return ResponseEntity.ok(Map.of("status_code", 200, "data", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status_code", 500, "error", e.getMessage()));
        }
    }
}
