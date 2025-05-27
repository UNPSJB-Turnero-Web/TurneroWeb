package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.DisponibilidadMedicoDTO.DiaHorarioDTO;
import unpsjb.labprog.backend.dto.EsquemaTurnoDTO;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.EsquemaTurno;

@Service
public class EsquemaTurnoService {

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @Autowired
    private DisponibilidadMedicoRepository disponibilidadMedicoRepository;

    @Autowired
    private StaffMedicoRepository staffMedicoRepository;

    @Autowired
    private CentroAtencionRepository centroAtencionRepository;

    @Autowired
    private ConsultorioRepository consultorioRepository;

    public List<EsquemaTurnoDTO> findAll() {
        return esquemaTurnoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<EsquemaTurnoDTO> findById(Integer id) {
        return esquemaTurnoRepository.findById(id).map(this::toDTO);
    }

    public Page<EsquemaTurnoDTO> findByPage(int page, int size) {
        return esquemaTurnoRepository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public EsquemaTurnoDTO saveOrUpdate(EsquemaTurnoDTO dto) {
        // Validar que los IDs requeridos no sean null
        if (dto.getDisponibilidadMedicoId() == null) {
            throw new IllegalArgumentException("El ID de DisponibilidadMedico no puede ser null.");
        }
        if (dto.getConsultorioId() == null) {
            throw new IllegalArgumentException("El ID de Consultorio no puede ser null.");
        }

        EsquemaTurno esquemaTurno = toEntity(dto);

        // Validación de superposición de esquemas en el mismo consultorio
        List<EsquemaTurno> existentes = esquemaTurnoRepository.findByStaffMedicoId(esquemaTurno.getStaffMedico().getId());
        for (EsquemaTurno existente : existentes) {
            if (esquemaTurno.getId() != null && existente.getId().equals(esquemaTurno.getId())) {
                continue; // Ignorar el mismo esquema si es edición
            }
            if (esquemaTurno.getDisponibilidadMedico().getId().equals(existente.getDisponibilidadMedico().getId())) {
                throw new IllegalStateException(
                        "Ya existe un esquema de turno para esta disponibilidad médica en el mismo consultorio.");
            }
        }

        return toDTO(esquemaTurnoRepository.save(esquemaTurno));
    }

    @Transactional
    public void deleteById(Integer id) {
        esquemaTurnoRepository.deleteById(id);
    }

    public void deleteAll() {
        esquemaTurnoRepository.deleteAll();
    }

    public List<EsquemaTurnoDTO> findByStaffMedico(Integer staffMedicoId) {
        return esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private EsquemaTurnoDTO toDTO(EsquemaTurno esquema) {
        EsquemaTurnoDTO dto = new EsquemaTurnoDTO();
        dto.setId(esquema.getId());
        dto.setIntervalo(esquema.getIntervalo());
        dto.setDisponibilidadMedicoId(esquema.getDisponibilidadMedico().getId());
        dto.setHorarios(esquema.getDisponibilidadMedico().getHorarios().stream().map(horario -> {
            DiaHorarioDTO diaHorarioDTO = new DiaHorarioDTO();
            diaHorarioDTO.setDia(horario.getDia());
            diaHorarioDTO.setHoraInicio(horario.getHoraInicio());
            diaHorarioDTO.setHoraFin(horario.getHoraFin());
            return diaHorarioDTO;
        }).collect(Collectors.toList()));
        dto.setStaffMedicoId(esquema.getStaffMedico().getId());
        dto.setCentroId(esquema.getCentroAtencion().getId());
        dto.setConsultorioId(esquema.getConsultorio().getId());
        return dto;
    }

    private EsquemaTurno toEntity(EsquemaTurnoDTO dto) {
        EsquemaTurno esquema = new EsquemaTurno();
        esquema.setId(dto.getId());
        esquema.setIntervalo(dto.getIntervalo());

        DisponibilidadMedico disponibilidad = disponibilidadMedicoRepository.findById(dto.getDisponibilidadMedicoId())
                .orElseThrow(() -> new IllegalArgumentException("DisponibilidadMedico no encontrada con ID: " + dto.getDisponibilidadMedicoId()));
        esquema.setDisponibilidadMedico(disponibilidad);

        esquema.setStaffMedico(disponibilidad.getStaffMedico());
        esquema.setCentroAtencion(centroAtencionRepository.findById(dto.getCentroId())
                .orElseThrow(() -> new IllegalArgumentException("CentroAtencion no encontrado con ID: " + dto.getCentroId())));
        esquema.setConsultorio(consultorioRepository.findById(dto.getConsultorioId())
                .orElseThrow(() -> new IllegalArgumentException("Consultorio no encontrado con ID: " + dto.getConsultorioId())));
        return esquema;
    }
}
