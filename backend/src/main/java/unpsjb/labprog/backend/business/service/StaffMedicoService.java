package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.StaffMedicoDTO;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.StaffMedico;

@Service
public class StaffMedicoService {

    @Autowired
    private StaffMedicoRepository repository;

    public List<StaffMedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<StaffMedicoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional
    public StaffMedicoDTO save(StaffMedicoDTO dto) {
        if (dto.getMedico() == null || dto.getMedico().getId() <= 0) {
            throw new IllegalArgumentException("Debe seleccionar un médico válido.");
        }
        if (dto.getCentro() == null || dto.getCentro().getId() <= 0) {
            throw new IllegalArgumentException("Debe seleccionar un centro de atención válido.");
        }
        // Validar que no exista la asociación
        Medico medico = new Medico();
        medico.setId(dto.getMedico().getId());
        CentroAtencion centro = new CentroAtencion();
        centro.setId(dto.getCentro().getId());
        if (repository.existsByMedicoAndCentro(medico, centro)) {
            throw new IllegalArgumentException("El médico ya está asociado a este centro.");
        }
        // (Opcional) Validar especialidad si es requerida
        if (dto.getEspecialidad() == null || dto.getEspecialidad().getId() <= 0) {
            throw new IllegalArgumentException("Debe seleccionar una especialidad válida.");
        }
        // Guardar
        StaffMedico staffMedico = toEntity(dto);

        return toDTO(repository.save(staffMedico));
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private StaffMedicoDTO toDTO(StaffMedico staff) {
        StaffMedicoDTO dto = new StaffMedicoDTO();
        dto.setId(staff.getId());
     
        return dto;
    }

    private StaffMedico toEntity(StaffMedicoDTO dto) {
        StaffMedico staff = new StaffMedico();
        staff.setId(dto.getId());

        return staff;
    }

}