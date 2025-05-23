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
import unpsjb.labprog.backend.dto.EsquemaTurnoDTO;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.StaffMedico;

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

    public Optional<EsquemaTurnoDTO> findById(Long id) {
        return esquemaTurnoRepository.findById(id).map(this::toDTO);
    }

    public Page<EsquemaTurnoDTO> findByPage(int page, int size) {
        return esquemaTurnoRepository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public EsquemaTurnoDTO saveOrUpdate(EsquemaTurnoDTO dto) {
        EsquemaTurno esquemaTurno = toEntity(dto);

        // --- VALIDACIÓN DE STAFF ---
        StaffMedico staff = esquemaTurno.getDisponibilidadMedico().getStaffMedico();
        
        if (staff == null) {
            throw new IllegalStateException("Debe asociar un staff médico al esquema de turno.");
        }

        // --- VALIDACIÓN DE DISPONIBILIDAD ---
        boolean disponible = staff.getDisponibilidades().stream()
            .anyMatch(disp -> disp.getDiaSemana() != null
                && disp.getDiaSemana().containsAll(esquemaTurno.getDiasSemana())
                && !esquemaTurno.getHoraInicio().isBefore(disp.getHoraInicio())
                && !esquemaTurno.getHoraFin().isAfter(disp.getHoraFin()));
        if (!disponible) {
            throw new IllegalStateException(
                    "El horario y días del esquema de turno no están dentro de la disponibilidad del médico.");
        }

        // --- VALIDACIÓN DE SUPERPOSICIÓN DE ESQUEMAS ---
        List<EsquemaTurno> existentes = esquemaTurnoRepository.findByDisponibilidadMedico_StaffMedico_Id(staff.getId());
        for (EsquemaTurno existente : existentes) {
            if (esquemaTurno.getId() != null && existente.getId().equals(esquemaTurno.getId())) {
                continue; // Ignorar el mismo esquema si es edición
            }
            for (String dia : esquemaTurno.getDiasSemana()) {
                if (existente.getDiasSemana().contains(dia)) {
                    boolean seSuperpone = !esquemaTurno.getHoraFin().isBefore(existente.getHoraInicio()) &&
                            !esquemaTurno.getHoraInicio().isAfter(existente.getHoraFin());
                    if (seSuperpone) {
                        throw new IllegalStateException(
                                "Ya existe un esquema de turno para el staff médico en el mismo día y horario.");
                    }
                }
            }
        }

        return toDTO(esquemaTurnoRepository.save(esquemaTurno));
    }

    @Transactional
    public void deleteById(Long id) {
        esquemaTurnoRepository.deleteById(id);
    }

    public void deleteAll() {
        esquemaTurnoRepository.deleteAll();
    }

    public List<EsquemaTurnoDTO> findByStaffMedico(Long staffMedicoId) {
        return esquemaTurnoRepository.findByDisponibilidadMedico_StaffMedico_Id(staffMedicoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private EsquemaTurnoDTO toDTO(EsquemaTurno esquema) {
        EsquemaTurnoDTO dto = new EsquemaTurnoDTO();
        dto.setCentroAtencionId((long) esquema.getCentroAtencion().getId());
        dto.setConsultorioId((long) esquema.getConsultorio().getId());
        dto.setId(esquema.getId());
        dto.setHoraInicio(esquema.getHoraInicio());
        dto.setHoraFin(esquema.getHoraFin());
        dto.setIntervalo(esquema.getIntervalo());
        dto.setDiasSemana(esquema.getDiasSemana());
        // Solo los IDs, no los objetos completos
        dto.setDisponibilidadMedicoId(
            esquema.getDisponibilidadMedico() != null ? esquema.getDisponibilidadMedico().getId() : null
        );
        dto.setStaffMedicoId(
            (esquema.getDisponibilidadMedico() != null && esquema.getDisponibilidadMedico().getStaffMedico() != null)
                ? esquema.getDisponibilidadMedico().getStaffMedico().getId()
                : null
        );
        return dto;
    }

    private EsquemaTurno toEntity(EsquemaTurnoDTO dto) {
        EsquemaTurno esquemaTurno = new EsquemaTurno();
        esquemaTurno.setId(dto.getId());
        esquemaTurno.setHoraInicio(dto.getHoraInicio());
        esquemaTurno.setHoraFin(dto.getHoraFin());
        esquemaTurno.setIntervalo(dto.getIntervalo());
        esquemaTurno.setDiasSemana(dto.getDiasSemana());
        // Buscar la disponibilidad por ID
        if (dto.getDisponibilidadMedicoId() != null) {
            esquemaTurno.setDisponibilidadMedico(
                disponibilidadMedicoRepository.findById(dto.getDisponibilidadMedicoId())
                    .orElse(null)
            );
        } else {
            esquemaTurno.setDisponibilidadMedico(null);
        }
        // Y para armar la entidad desde el DTO:
        esquemaTurno.setCentroAtencion(
            centroAtencionRepository.findById(dto.getCentroAtencionId().intValue())
                .orElseThrow(() -> new IllegalStateException("Centro no encontrado"))
        );
        esquemaTurno.setConsultorio(
            consultorioRepository.findById(dto.getConsultorioId().intValue())
                .orElseThrow(() -> new IllegalStateException("Consultorio no encontrado"))
        );
        return esquemaTurno;
    }
}
