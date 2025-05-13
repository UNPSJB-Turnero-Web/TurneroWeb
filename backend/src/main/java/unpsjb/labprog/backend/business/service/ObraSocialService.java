package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
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

    @Transactional
    public ObraSocialDTO save(ObraSocialDTO dto) {
        ObraSocial obraSocial = toEntity(dto);

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

    private ObraSocialDTO toDTO(ObraSocial obraSocial) {
        ObraSocialDTO dto = new ObraSocialDTO();
        dto.setId(obraSocial.getId());
        dto.setNombre(obraSocial.getNombre());
        dto.setCodigo(obraSocial.getCodigo());
        return dto;
    }

    private ObraSocial toEntity(ObraSocialDTO dto) {
        ObraSocial obraSocial = new ObraSocial();
        obraSocial.setId(dto.getId());
        obraSocial.setNombre(dto.getNombre());
        obraSocial.setCodigo(dto.getCodigo());
        return obraSocial;
    }
}