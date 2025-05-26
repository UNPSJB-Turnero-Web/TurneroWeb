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
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;
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

    public Optional<EsquemaTurnoDTO> findById(Integer id) {
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
        StaffMedico staff = esquemaTurno.getStaffMedico();
        if (staff == null) {
            throw new IllegalStateException("Debe asociar un staff médico al esquema de turno.");
        }

        // --- VALIDACIÓN DE SUPERPOSICIÓN DE ESQUEMAS EN EL MISMO CONSULTORIO ---
        List<EsquemaTurno> existentes = esquemaTurnoRepository.findByStaffMedicoId(staff.getId());
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
                                "Ya existe un esquema de turno para el staff médico en el mismo día y horario en el consultorio.");
                    }
                }
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
        dto.setHoraInicio(esquema.getHoraInicio());
        dto.setHoraFin(esquema.getHoraFin());
        dto.setIntervalo(esquema.getIntervalo());
        dto.setDiasSemana(esquema.getDiasSemana());
        if (esquema.getStaffMedico() != null) {
            dto.setStaffMedicoId(esquema.getStaffMedico().getId());
        }
        return dto;
    }

    private EsquemaTurno toEntity(EsquemaTurnoDTO dto) {
        EsquemaTurno esquema = new EsquemaTurno();
        esquema.setId(dto.getId());
        esquema.setHoraInicio(dto.getHoraInicio());
        esquema.setHoraFin(dto.getHoraFin());
        esquema.setIntervalo(dto.getIntervalo());
        esquema.setDiasSemana(dto.getDiasSemana());

        if (dto.getStaffMedicoId() != null) {
            StaffMedico staff = staffMedicoRepository.findById(dto.getStaffMedicoId())
                    .orElseThrow(() -> new IllegalArgumentException("StaffMedico no encontrado con ID: " + dto.getStaffMedicoId()));
            esquema.setStaffMedico(staff);
        } else {
            throw new IllegalArgumentException("El campo staffMedicoId es obligatorio");
        }

        if (dto.getCentroId() != null) {
            CentroAtencion centro = centroAtencionRepository.findById(dto.getCentroId())
                    .orElseThrow(() -> new IllegalArgumentException("CentroAtencion no encontrado con ID: " + dto.getCentroId()));
            esquema.setCentroAtencion(centro);
        } else {
            throw new IllegalArgumentException("El campo centroId es obligatorio");
        }

        if (dto.getConsultorioId() != null) {
            Consultorio consultorio = consultorioRepository.findById(dto.getConsultorioId())
                    .orElseThrow(() -> new IllegalArgumentException("Consultorio no encontrado con ID: " + dto.getConsultorioId()));
            esquema.setConsultorio(consultorio);
        } else {
            throw new IllegalArgumentException("El campo consultorioId es obligatorio");
        }

        return esquema;
    }
}
