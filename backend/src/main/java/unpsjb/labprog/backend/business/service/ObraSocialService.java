package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.ObraSocialRepository;
import unpsjb.labprog.backend.dto.ObraSocialDTO;
import unpsjb.labprog.backend.model.ObraSocial;

@Service
public class ObraSocialService {

    @Autowired
    private ObraSocialRepository repository;

    public List<ObraSocialDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ObraSocialDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    public Optional<ObraSocial> findEntityById(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public ObraSocialDTO saveOrUpdate(ObraSocialDTO dto) {
        ObraSocial obraSocial = toEntity(dto);
    validarObraSocial(obraSocial);

        // Validaciones para evitar duplicados
        if (obraSocial.getId() == null || obraSocial.getId() == 0) {
            if (repository.existsByNombre(obraSocial.getNombre())) {
                throw new IllegalStateException("Ya existe una obra social con el nombre: " + obraSocial.getNombre());
            }
        } else {
            ObraSocial existente = repository.findById(obraSocial.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe la obra social que se intenta modificar.");
            }

            if (!existente.getNombre().equalsIgnoreCase(obraSocial.getNombre()) &&
                repository.existsByNombre(obraSocial.getNombre())) {
                throw new IllegalStateException("Ya existe una obra social con el nombre: " + obraSocial.getNombre());
            }
        }

        return toDTO(repository.save(obraSocial));
    }

    @Transactional
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    public Page<ObraSocialDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    /**
     * Búsqueda paginada avanzada con filtros combinados y ordenamiento dinámico
     * @param page Número de página (0-indexed)
     * @param size Cantidad de elementos por página
     * @param nombre Filtro por nombre de la obra social (opcional)
     * @param codigo Filtro por código de la obra social (opcional)
     * @param sortBy Campo por el cual ordenar (por defecto: nombre)
     * @param sortDir Dirección del ordenamiento: asc|desc (por defecto: asc)
     * @return Página de obras sociales filtradas y ordenadas como DTOs
     */
    public Page<ObraSocialDTO> findByPage(int page, int size, String nombre, String codigo, 
                                         String sortBy, String sortDir) {
        // Configurar ordenamiento
        String field = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy.trim() : "nombre";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? 
                                   Sort.Direction.DESC : Sort.Direction.ASC;
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, field));
        
        // Normalizar filtros
        String nombreFilter = (nombre != null && !nombre.trim().isEmpty()) ? nombre.trim() : null;
        String codigoFilter = (codigo != null && !codigo.trim().isEmpty()) ? codigo.trim() : null;
        
        // Ejecutar búsqueda con filtros
        return repository.findByFiltros(nombreFilter, codigoFilter, pageRequest)
                .map(this::toDTO);
    }

    private ObraSocialDTO toDTO(ObraSocial obraSocial) {
        ObraSocialDTO dto = new ObraSocialDTO();
        dto.setId(obraSocial.getId());
        dto.setNombre(obraSocial.getNombre());
        dto.setCodigo(obraSocial.getCodigo());
        dto.setDescripcion(obraSocial.getDescripcion()); // Campo agregado
        return dto;
    }

    private ObraSocial toEntity(ObraSocialDTO dto) {
        ObraSocial obraSocial = new ObraSocial();
        obraSocial.setId(dto.getId());
        obraSocial.setNombre(dto.getNombre());
        obraSocial.setCodigo(dto.getCodigo());
        obraSocial.setDescripcion(dto.getDescripcion()); // Campo agregado
        return obraSocial;
    }

    private void validarObraSocial(ObraSocial obraSocial) {
    if (obraSocial.getNombre() == null || obraSocial.getNombre().isBlank()) {
        throw new IllegalArgumentException("El nombre de la obra social es obligatorio");
    }
    if (obraSocial.getNombre().length() > 50) {
        throw new IllegalArgumentException("El nombre no puede superar los 50 caracteres");
    }
    if (obraSocial.getCodigo() == null || obraSocial.getCodigo().isBlank()) {
        throw new IllegalArgumentException("El código de la obra social es obligatorio");
    }
    if (!obraSocial.getCodigo().matches("^[A-Za-z0-9]+$")) {
        throw new IllegalArgumentException("El código solo puede contener letras y números");
    }
    if (obraSocial.getCodigo().length() > 20) {
        throw new IllegalArgumentException("El código no puede superar los 20 caracteres");
    }
}
}

