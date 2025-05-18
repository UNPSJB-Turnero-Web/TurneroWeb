package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.business.repository.MedicoRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.CentroAtencionDTO;
import unpsjb.labprog.backend.dto.DisponibilidadMedicoDTO;
import unpsjb.labprog.backend.dto.EspecialidadDTO;
import unpsjb.labprog.backend.dto.MedicoDTO;
import unpsjb.labprog.backend.dto.StaffMedicoDTO;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.Especialidad;
import unpsjb.labprog.backend.model.Medico;
import unpsjb.labprog.backend.model.StaffMedico;

@Service
public class StaffMedicoService {

    @Autowired
    private StaffMedicoRepository repository;
    @Autowired
    private MedicoRepository medicoRepository;
    @Autowired
    private CentroAtencionRepository centroRepository;
    @Autowired
    private EspecialidadRepository especialidadRepository;

    public List<StaffMedicoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<StaffMedicoDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }
    public List<StaffMedicoDTO> findByCentroId(Long centroId) {
        return repository.findByCentroId(centroId).stream()
                .map(this::toDTO)
                .toList();
    }   
        // Obtener especialidades paginadas como DTOs
    public Page<StaffMedicoDTO> findByPage(int page, int size) {
        Page<StaffMedico> pageResult = repository.findAll(PageRequest.of(page, size));
        return pageResult.map(this::toDTO);
    }


    @Transactional
    public StaffMedicoDTO saveOrUpdate(StaffMedicoDTO dto) {
        StaffMedico staffMedico = toEntity(dto);

        // Validar datos
        validarStaffMedico(staffMedico);

        // Validar unicidad de la asociación médico-centro-especialidad
        if (staffMedico.getId() == null || staffMedico.getId() == 0) { // Creación
            if (repository.existsByMedicoAndCentroAndEspecialidad(
                    staffMedico.getMedico(), staffMedico.getCentro(), staffMedico.getEspecialidad())) {
                throw new IllegalStateException("El médico ya está asociado a este centro con esa especialidad");
            }
        } else { // Actualización
            StaffMedico existente = repository.findByMedicoAndCentroAndEspecialidad(
                    staffMedico.getMedico(), staffMedico.getCentro(), staffMedico.getEspecialidad());
            if (existente != null && !existente.getId().equals(staffMedico.getId())) {
                throw new IllegalStateException("El médico ya está asociado a este centro con esa especialidad");
            }
        }

        StaffMedico saved = repository.save(staffMedico);
        return toDTO(saved);
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
      @Transactional
    public void deleteAll() {
        repository.deleteAll();
    }


    private StaffMedicoDTO toDTO(StaffMedico staff) {
        StaffMedicoDTO dto = new StaffMedicoDTO();
        dto.setId(staff.getId());
        dto.setCentro(toCentroAtencionDTO(staff.getCentro()));
        dto.setMedico(toMedicoDTO(staff.getMedico()));
        dto.setEspecialidad(toEspecialidadDTO(staff.getEspecialidad()));
        dto.setDisponibilidad(toDisponibilidadDTOList(staff.getDisponibilidad()));
        return dto;
    }

    private StaffMedico toEntity(StaffMedicoDTO dto) {
        StaffMedico staff = new StaffMedico();
        staff.setId(dto.getId());

        // Buscar médico por DNI y matrícula
        Long dni = Long.valueOf(dto.getMedico().getDni());
        Optional<Medico> medicoOpt = medicoRepository.findByDni(dni);
        if (medicoOpt.isEmpty()) {
            throw new IllegalStateException("Médico no existe con el dni indicado");
        }
        Medico medico = medicoOpt.get();
        if (!medico.getMatricula().equals(dto.getMedico().getMatricula())) {
            throw new IllegalStateException("Médico no existe con la matrícula indicada");
        }
        staff.setMedico(medico);

        // Buscar centro por nombre
        CentroAtencion centro = centroRepository.findByName(dto.getCentro().getName());
        if (centro == null) {
            throw new IllegalStateException("Centro de atención no existe con el nombre indicado");
        }
        staff.setCentro(centro);

        // Buscar especialidad por nombre
        Especialidad especialidad = especialidadRepository.findByNombreIgnoreCase(dto.getEspecialidad().getNombre());
        if (especialidad == null) {
            throw new IllegalStateException("La especialidad del médico no se encuentra disponible para el centro de salud");
        }
        staff.setEspecialidad(especialidad);

        return staff;
    }

    private void validarStaffMedico(StaffMedico staff) {
        if (staff.getMedico() == null || staff.getMedico().getId() <= 0) {
            throw new IllegalStateException("Debe seleccionar un médico válido.");
        }
        if (staff.getCentro() == null || staff.getCentro().getId() <= 0) {
            throw new IllegalStateException("Debe seleccionar un centro de atención válido.");
        }
        if (staff.getEspecialidad() == null || staff.getEspecialidad().getId() <= 0) {
            throw new IllegalStateException("Debe seleccionar una especialidad válida.");
        }
        // Podés agregar más validaciones según tu modelo
    }

    private CentroAtencionDTO toCentroAtencionDTO(CentroAtencion centro) {
        if (centro == null) return null;
        CentroAtencionDTO dto = new CentroAtencionDTO();
        dto.setId(centro.getId());
        dto.setName(centro.getName());
        // agrega otros campos si es necesario
        return dto;
    }

    private MedicoDTO toMedicoDTO(Medico medico) {
        if (medico == null) return null;
        MedicoDTO dto = new MedicoDTO();
        dto.setId(medico.getId());
        dto.setNombre(medico.getNombre());
        dto.setApellido(medico.getApellido());
        dto.setDni(String.valueOf(medico.getDni())); // <-- conversión aquí
        dto.setMatricula(medico.getMatricula());
        // agrega otros campos si es necesario
        return dto;
    }

    private EspecialidadDTO toEspecialidadDTO(Especialidad especialidad) {
        if (especialidad == null) return null;
        EspecialidadDTO dto = new EspecialidadDTO();
        dto.setId(especialidad.getId());
        dto.setNombre(especialidad.getNombre());
        // agrega otros campos si es necesario
        return dto;
    }

    private List<DisponibilidadMedicoDTO> toDisponibilidadDTOList(List<DisponibilidadMedico> lista) {
        if (lista == null) return null;
        return lista.stream().map(d -> {
            DisponibilidadMedicoDTO dto = new DisponibilidadMedicoDTO();
            dto.setId(d.getId());
            // agrega otros campos si es necesario
            return dto;
        }).toList();
    }
}