package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
import unpsjb.labprog.backend.dto.EspecialidadDTO;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Especialidad;

@Service
public class EspecialidadService {

    @Autowired
    private EspecialidadRepository repository;
    @Autowired
    private CentroAtencionRepository centroAtencionRepository;
    @Autowired
    private CentroAtencionService centroAtencionService;

    public List<EspecialidadDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EspecialidadDTO findById(Integer id) {
        Especialidad especialidad = repository.findById(id).orElse(null);
        return especialidad != null ? toDTO(especialidad) : null;
    }

    public List<EspecialidadDTO> findByCentroAtencionId(Integer centroId) {
        List<Especialidad> especialidades = centroAtencionRepository.findEspecialidadesByCentroId(centroId);
        return especialidades.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EspecialidadDTO> findEspecialidadesNoAsociadas(Integer centroId) {
        List<Especialidad> todas = repository.findAll();
        List<Especialidad> asociadas = centroAtencionRepository.findEspecialidadesByCentroId(centroId);
        todas.removeAll(asociadas);
        return todas.stream().map(this::toDTO).toList();
    }

    public List<Map<String, Object>> findEspecialidadesAgrupadasPorCentro() {
        List<Map<String, Object>> resultado = new ArrayList<>();
        List<CentroAtencionDTO> centros = centroAtencionService.findAll();
        for (CentroAtencionDTO centro : centros) {
            List<EspecialidadDTO> especialidades = findByCentroAtencionId(centro.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("centro_de_atencion", centro.getNombre());
            entry.put("especialidades", especialidades.stream().map(EspecialidadDTO::getNombre).toList());
            resultado.add(entry);
        }
        return resultado;
    }

    @Transactional
    public EspecialidadDTO saveOrUpdate(EspecialidadDTO dto) {
        Especialidad especialidad = toEntity(dto);

        validarEspecialidad(especialidad);

        if (especialidad.getId() == null || especialidad.getId() == 0) { // Creación
            if (repository.existsByNombreIgnoreCase(especialidad.getNombre())) {
                throw new IllegalStateException("Ya existe una especialidad con ese nombre");
            }
        } else { // Actualización
            Especialidad existente = repository.findByNombreIgnoreCase(especialidad.getNombre());
            if (existente != null && !existente.getId().equals(especialidad.getId())) {
                throw new IllegalStateException("Ya existe una especialidad con ese nombre");
            }
        }

        Especialidad saved = repository.save(especialidad);
        return toDTO(saved);
    }

    private void validarEspecialidad(Especialidad especialidad) {
        if (especialidad.getNombre() == null || especialidad.getNombre().isBlank()) {
            throw new IllegalStateException("El nombre es obligatorio");
        }
        if (especialidad.getNombre().length() > 50) {
            throw new IllegalStateException("El nombre no puede superar los 50 caracteres");
        }
        if (especialidad.getDescripcion() == null || especialidad.getDescripcion().isBlank()) {
            throw new IllegalStateException("La descripción de la especialidad es obligatoria");
        }
        if (especialidad.getDescripcion().length() > 200) {
            throw new IllegalStateException("La descripción no puede superar los 200 caracteres");
        }
    }

    public Page<EspecialidadDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new IllegalStateException("No existe una especialidad con el ID: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public void deleteAll() {
        repository.deleteAll();
    }

    @Transactional
    public void desasociarEspecialidadDeCentro(Integer especialidadId, Integer centroId) {
        CentroAtencion centro = centroAtencionService.findEntityById(centroId);
        Especialidad especialidad = repository.findById(especialidadId)
                .orElseThrow(() -> new IllegalStateException("No existe la especialidad con id " + especialidadId));
        if (centro == null)
            throw new IllegalStateException("No existe el centro con id " + centroId);

        if (!centro.getEspecialidades().contains(especialidad)) {
            throw new IllegalStateException("La especialidad no está asociada a este centro");
        }
        centro.getEspecialidades().remove(especialidad);

        centroAtencionService.save(centro);
    }

    private EspecialidadDTO toDTO(Especialidad especialidad) {
        EspecialidadDTO dto = new EspecialidadDTO();
        dto.setId(especialidad.getId());
        dto.setNombre(especialidad.getNombre());
        dto.setDescripcion(especialidad.getDescripcion());
        return dto;
    }

    private Especialidad toEntity(EspecialidadDTO dto) {
        Especialidad especialidad = new Especialidad();
        especialidad.setId(dto.getId());
        especialidad.setNombre(dto.getNombre());
        especialidad.setDescripcion(dto.getDescripcion());
        return especialidad;
    }

    @Transactional
    public EspecialidadDTO asociarEspecialidadACentro(Integer especialidadId, Integer centroId) {
        Especialidad especialidad = repository.findById(especialidadId)
                .orElseThrow(() -> new IllegalStateException("No existe la especialidad con id " + especialidadId));

        CentroAtencion centro = centroAtencionService.findEntityById(centroId);
        if (centro == null) 
            throw new IllegalStateException("No existe el centro con id " + centroId);
        

        if (centroAtencionRepository.existsEspecialidadInCentro(centroId, especialidadId)) {
            throw new IllegalStateException("La especialidad ya está asociada a este centro");
        }

        centro.getEspecialidades().add(especialidad);

        centroAtencionService.save(centro);

        return toDTO(especialidad);
    }
}
