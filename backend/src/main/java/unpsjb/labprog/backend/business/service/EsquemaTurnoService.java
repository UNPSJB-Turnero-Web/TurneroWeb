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
        if (dto.getHorarios() == null || dto.getHorarios().isEmpty()) {
            throw new IllegalArgumentException("Los días son obligatorios");
        }

        for (DiaHorarioDTO horario : dto.getHorarios()) {
            if (horario.getHoraInicio().isAfter(horario.getHoraFin())) {
                throw new IllegalArgumentException("Hora de inicio no puede ser mayor a hora de fin");
            }
        }

        if (dto.getIntervalo() <= 0) {
            throw new IllegalArgumentException("El intervalo debe ser positivo");
        }

        EsquemaTurno esquemaTurno = toEntity(dto);

        // Validar conflictos de esquemas
        List<EsquemaTurno> existentes = esquemaTurnoRepository.findByStaffMedicoId(esquemaTurno.getStaffMedico().getId());
        for (EsquemaTurno existente : existentes) {
            if (!esquemaTurno.getId().equals(existente.getId()) &&
                esquemaTurno.getDisponibilidadMedico().getId().equals(existente.getDisponibilidadMedico().getId())) {
                throw new IllegalStateException("Conflicto: Esquema ya existe");
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
