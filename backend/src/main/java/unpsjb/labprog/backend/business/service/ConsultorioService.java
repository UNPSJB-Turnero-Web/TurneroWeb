package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
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
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Page<ConsultorioDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public Optional<ConsultorioDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private ConsultorioDTO toDTO(Consultorio c) {
        ConsultorioDTO dto = new ConsultorioDTO();
        dto.setId(c.getId());
        dto.setNumero(c.getNumero());
        dto.setNombre(c.getNombre());
        if (c.getCentroAtencion() != null) {
            dto.setCentroId(c.getCentroAtencion().getId());
            dto.setNombreCentro(c.getCentroAtencion().getNombre());
        }
        return dto;
    }

    private Consultorio toEntity(ConsultorioDTO dto) {
        Consultorio consultorio = new Consultorio();
        consultorio.setId(dto.getId());
        consultorio.setNumero(dto.getNumero());
        consultorio.setNombre(dto.getNombre());
        if (dto.getCentroId() != null) {
            CentroAtencion centro = new CentroAtencion();
            centro.setId(dto.getCentroId());
            consultorio.setCentroAtencion(centro);
        }
        return consultorio;
    }

    public List<Consultorio> findByCentroAtencion(String centroNombre) {
        CentroAtencion centro = centroRepo.findByNombre(centroNombre);
        if (centro == null) {
            throw new IllegalStateException("Centro no encontrado");
        }
        return repository.findByCentroAtencion(centro);
    }

    public List<ConsultorioDTO> findByCentroAtencionId(Integer centroId) {
        return repository.findByCentroAtencionId(centroId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public Consultorio saveByCentroNombre(Consultorio consultorio, String centroNombre) {
        CentroAtencion centro = centroRepo.findByNombre(centroNombre);
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
                    .map(c -> Map.of("numero", c.getNumero(), "nombre_consultorio", c.getNombre()))
                    .toList();
            return ResponseEntity.ok(Map.of("status_code", 200, "data", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status_code", 500, "error", e.getMessage()));
        }
    }

    @Transactional
    public ConsultorioDTO saveOrUpdate(ConsultorioDTO dto) {
        Consultorio consultorio = toEntity(dto);

        // Validar datos
        validateConsultorio(consultorio);

        CentroAtencion centro = centroRepo.findById(consultorio.getCentroAtencion().getId())
                .orElseThrow(() -> new IllegalStateException("Centro de Atención no encontrado"));
        consultorio.setCentroAtencion(centro);

        if (consultorio.getId() == null || consultorio.getId() == 0) { // CREACIÓN
            if (repository.existsByNumeroAndCentroAtencion(consultorio.getNumero(), centro)) {
                throw new IllegalStateException("El número de consultorio ya está en uso");
            }
            if (repository.existsByNombreAndCentroAtencion(consultorio.getNombre(), centro)) {
                throw new IllegalStateException("El nombre del consultorio ya está en uso");
            }
        } else {
            // MODIFICACIÓN
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
                    throw new IllegalStateException("El nombre del consultorio ya está en uso");
                }
            }
            existente.setNumero(consultorio.getNumero());
            existente.setNombre(consultorio.getNombre());
            consultorio = existente;
        }

        return toDTO(repository.save(consultorio));
    }

    private void validateConsultorio(Consultorio consultorio) {
        String nombre = consultorio.getNombre();
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del consultorio es obligatorio");
        }
        if (consultorio.getNumero() == null) {
            throw new IllegalArgumentException("El número del consultorio es obligatorio");
        }
        if (consultorio.getNumero() <= 0) {
            throw new IllegalArgumentException("El número del consultorio debe ser positivo");
        }

        if (nombre.length() > 50) {
            throw new IllegalArgumentException("El nombre del consultorio no puede superar los 50 caracteres");
        }
        if (!nombre.matches("^[\\p{L}0-9\\sáéíóúÁÉÍÓÚüÜñÑ]+$")) {
            throw new IllegalArgumentException("El nombre del consultorio contiene caracteres no permitidos");
        }
        if (consultorio.getCentroAtencion() == null || consultorio.getCentroAtencion().getId() == 0) {
            throw new IllegalArgumentException("El centro de atención es obligatorio");
        }

    }
}
