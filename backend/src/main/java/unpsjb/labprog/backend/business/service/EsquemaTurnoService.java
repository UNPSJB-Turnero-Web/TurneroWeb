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
        // Validación: Staff Médico
        if (dto.getStaffMedicoId() == null) {
            throw new IllegalArgumentException("El campo staffMedicoId es obligatorio.");
        }

        // Validación: Consultorio
        if (dto.getConsultorioId() == null) {
            throw new IllegalArgumentException("El campo consultorio es obligatorio.");
        }
        if (!consultorioRepository.existsById(dto.getConsultorioId())) {
            throw new IllegalArgumentException("El consultorio no existe.");
        }

        // Validación: Intervalo
        if (dto.getIntervalo() <= 0) {
            throw new IllegalArgumentException("El intervalo debe ser positivo.");
        }       

        // Validación: Horarios específicos del esquema de turno
        if (dto.getHorarios() == null || dto.getHorarios().isEmpty()) {
            throw new IllegalArgumentException("Los horarios son obligatorios.");
        }
        for (EsquemaTurnoDTO.DiaHorarioDTO horario : dto.getHorarios()) {
            if (horario.getHoraInicio().isAfter(horario.getHoraFin())) {
                throw new IllegalArgumentException("La hora de inicio no puede ser mayor a la hora de fin.");
            }
        }

        EsquemaTurno esquemaTurno = toEntity(dto);

        // Validación: Conflictos entre esquemas de turnos existentes
        List<EsquemaTurno> existentes = esquemaTurnoRepository.findByStaffMedicoId(esquemaTurno.getStaffMedico().getId());
        for (EsquemaTurno existente : existentes) {
            Integer nuevoId = esquemaTurno.getId();
            Integer existenteId = existente.getId();

            // Si ambos IDs son null, consideramos que son distintos (nuevo registro)
            boolean mismoId = (nuevoId != null && nuevoId.equals(existenteId));
            if (!mismoId && esquemaTurno.getDisponibilidadMedico().getId()
                    .equals(existente.getDisponibilidadMedico().getId())) {
                throw new IllegalStateException("Conflicto: Esquema ya existe.");
            }
        }

        // Validación: Disponibilidad del médico
        List<DisponibilidadMedico> disponibilidades = disponibilidadMedicoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
        for (EsquemaTurnoDTO.DiaHorarioDTO horario : dto.getHorarios()) {
            System.out.println("Validando horario: " + horario.getDia() + " " + horario.getHoraInicio() + " - " + horario.getHoraFin());
            for (DisponibilidadMedico disponibilidad : disponibilidades) {
                System.out.println("Disponibilidad: ");
                disponibilidad.getHorarios().forEach(diaHorario -> 
                    System.out.println("Día: " + diaHorario.getDia() + ", Inicio: " + diaHorario.getHoraInicio() + ", Fin: " + diaHorario.getHoraFin())
                );
            }

            boolean disponible = disponibilidades.stream().anyMatch(disponibilidad -> 
                disponibilidad.getHorarios().stream().anyMatch(diaHorario -> 
                    diaHorario.getDia().equalsIgnoreCase(horario.getDia()) &&
                    (horario.getHoraInicio().equals(diaHorario.getHoraInicio()) || !horario.getHoraInicio().isBefore(diaHorario.getHoraInicio())) &&
                    (horario.getHoraFin().equals(diaHorario.getHoraFin()) || !horario.getHoraFin().isAfter(diaHorario.getHoraFin()))
                )
            );

            if (!disponible) {
                throw new IllegalArgumentException("El médico no tiene disponibilidad para el día " + horario.getDia() +
                        " entre " + horario.getHoraInicio() + " y " + horario.getHoraFin() + ".");
            }
        }

        // Validación: Conflictos de horarios en el mismo consultorio
        List<EsquemaTurno> esquemasEnConsultorio = esquemaTurnoRepository.findByConsultorioId(dto.getConsultorioId());
        if (esquemasEnConsultorio.stream().anyMatch(existente ->
                !esquemaTurno.getId().equals(existente.getId()) &&
                hayConflictoDeHorarios(existente.getHorarios(), dto.getHorarios()))) {
            throw new IllegalStateException("Conflicto: Horarios en conflicto en el mismo consultorio.");
        }

        // Validación: Conflictos de horarios para el mismo médico en diferentes consultorios
        List<EsquemaTurno> esquemasDelMedico = esquemaTurnoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
        if (esquemasDelMedico.stream().anyMatch(existente ->
                !esquemaTurno.getId().equals(existente.getId()) &&
                hayConflictoDeHorarios(existente.getHorarios(), dto.getHorarios()))) {
            throw new IllegalStateException("Conflicto: El médico ya está asignado a otro consultorio en este horario.");
        }

        return toDTO(esquemaTurnoRepository.save(esquemaTurno));
    }

    private boolean hayConflictoDeHorarios(List<EsquemaTurno.Horario> horariosExistentes,
            List<EsquemaTurnoDTO.DiaHorarioDTO> nuevosHorarios) {
        return nuevosHorarios.stream()
                .anyMatch(nuevoHorario -> horariosExistentes.stream()
                        .anyMatch(horarioExistente -> nuevoHorario.getDia().equals(horarioExistente.getDia()) &&
                                nuevoHorario.getHoraInicio().isBefore(horarioExistente.getHoraFin()) &&
                                nuevoHorario.getHoraFin().isAfter(horarioExistente.getHoraInicio())));
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

        dto.setHorarios(esquema.getHorarios().stream().map(horario -> {
            EsquemaTurnoDTO.DiaHorarioDTO diaHorarioDTO = new EsquemaTurnoDTO.DiaHorarioDTO();
            diaHorarioDTO.setDia(horario.getDia());
            diaHorarioDTO.setHoraInicio(horario.getHoraInicio());
            diaHorarioDTO.setHoraFin(horario.getHoraFin());
            return diaHorarioDTO;
        }).collect(Collectors.toList()));

        // Mapear nombres
        dto.setStaffMedicoId(esquema.getStaffMedico().getId());
        dto.setNombreStaffMedico(esquema.getStaffMedico().getMedico().getNombre() + " " +
                esquema.getStaffMedico().getMedico().getApellido());

        dto.setCentroId(esquema.getCentroAtencion().getId());
        dto.setNombreCentro(esquema.getCentroAtencion().getNombre());

        dto.setConsultorioId(esquema.getConsultorio().getId());
        dto.setNombreConsultorio(esquema.getConsultorio().getNombre());

        return dto;
    }

    private EsquemaTurno toEntity(EsquemaTurnoDTO dto) {
        EsquemaTurno esquema = new EsquemaTurno();
        esquema.setId(dto.getId());
        esquema.setIntervalo(dto.getIntervalo());

        DisponibilidadMedico disponibilidad = disponibilidadMedicoRepository.findById(dto.getDisponibilidadMedicoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "DisponibilidadMedico no encontrada con ID: " + dto.getDisponibilidadMedicoId()));
        esquema.setDisponibilidadMedico(disponibilidad);

        esquema.setStaffMedico(disponibilidad.getStaffMedico());
        esquema.setCentroAtencion(centroAtencionRepository.findById(dto.getCentroId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "CentroAtencion no encontrado con ID: " + dto.getCentroId())));
        esquema.setConsultorio(consultorioRepository.findById(dto.getConsultorioId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Consultorio no encontrado con ID: " + dto.getConsultorioId())));

        esquema.setHorarios(dto.getHorarios().stream().map(horarioDTO -> {
            EsquemaTurno.Horario horario = new EsquemaTurno.Horario();
            horario.setDia((horarioDTO.getDia()).toString());
            horario.setHoraInicio(horarioDTO.getHoraInicio());
            horario.setHoraFin(horarioDTO.getHoraFin());
            return horario;
        }).collect(Collectors.toList()));

        return esquema;
    }
}
