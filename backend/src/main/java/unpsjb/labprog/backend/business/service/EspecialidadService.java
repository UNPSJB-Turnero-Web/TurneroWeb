package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.dto.EspecialidadDTO;
import unpsjb.labprog.backend.model.Especialidad;

@Service
public class EspecialidadService {

    @Autowired
    private EspecialidadRepository repository;

    // Método para obtener todas las especialidades como DTOs
    public List<EspecialidadDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Método para obtener una especialidad por ID como DTO
    public EspecialidadDTO findById(int id) {
        Especialidad especialidad = repository.findById(id).orElse(null);
        return especialidad != null ? toDTO(especialidad) : null;
    }

    @Transactional
    public EspecialidadDTO save(EspecialidadDTO dto) {
        Especialidad especialidad = toEntity(dto);

        System.out.println("DEBUG: Guardando especialidad: " + especialidad);

        // Validar campos obligatorios
        if (especialidad.getNombre() == null || especialidad.getNombre().isBlank()) {
            System.out.println("DEBUG: El nombre es obligatorio");
            throw new IllegalStateException("El nombre es obligatorio");
        }

        if (especialidad.getDescripcion() == null || especialidad.getDescripcion().isBlank()) {
            System.out.println("DEBUG: La descripción es obligatoria");
            throw new IllegalStateException("La descripción de la especialidad es obligatoria");
        }

        // Validar unicidad del nombre
        if (especialidad.getId() == 0) { // Creación
            if (repository.existsByNombreIgnoreCase(especialidad.getNombre())) {
                System.out.println("DEBUG: Conflicto de nombre en creación");
                throw new IllegalStateException("Ya existe una especialidad con ese nombre");
            }
        } else { // Actualización
            if (repository.existsByNombreIgnoreCase(especialidad.getNombre())) {
                System.out.println("DEBUG: Conflicto de nombre en actualización");
                throw new IllegalStateException("Ya existe una especialidad con ese nombre");
            }
        }

        // Guardar la especialidad
        Especialidad saved = repository.save(especialidad);
        System.out.println("DEBUG: Especialidad guardada correctamente");
        return toDTO(saved);
    }

    // Método para obtener especialidades paginadas como DTOs
    public Page<EspecialidadDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
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

    // Métodos de conversión entre entidad y DTO
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
}
