package unpsjb.labprog.backend.presenter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.service.AgendaService;
import unpsjb.labprog.backend.business.service.ConfiguracionExcepcionalService;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.Turno;
import unpsjb.labprog.backend.model.ConfiguracionExcepcional;

@RestController
@RequestMapping("/agenda")
public class AgendaPresenter {

    @Autowired
    private AgendaService agendaService;

    @Autowired
    private ConfiguracionExcepcionalService configuracionExcepcionalService;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Object> findAll() {
        return Response.ok(agendaService.findAll());
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Object> findById(@PathVariable("id") Integer id) {
        Agenda agenda = agendaService.findById(id);
        return (agenda != null)
                ? Response.ok(agenda)
                : Response.notFound();
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<Object> findByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Response.ok(agendaService.findByPage(page, size));
    }

    // @RequestMapping(value = "/{id}/cancelar", method = RequestMethod.POST)
    // public ResponseEntity<Object> cancelarAgenda(@PathVariable("id") Integer id) {
    //     try {
    //         service.cancelarAgendaYNotificarPacientes(id);
    //         return Response.ok("Agenda cancelada y pacientes notificados.");
    //     } catch (IllegalArgumentException e) {
    //         return Response.notFound();
    //     }
    // }

    @RequestMapping(value = "/alternativas/{turnoId}", method = RequestMethod.GET)
    public ResponseEntity<Object> sugerirAlternativas(@PathVariable("turnoId") Integer turnoId) {
        // Busca el turno y llama al método del service
        Turno turno = agendaService.findTurnoById(turnoId);
        if (turno == null)
            return Response.notFound();
        return Response.ok(agendaService.sugerirAlternativas(turno));
    }

    @RequestMapping(value = "/consultorio/{consultorioId}", method = RequestMethod.GET)
    public ResponseEntity<Object> findByConsultorio(@PathVariable("consultorioId") Integer consultorioId) {
        return Response.ok(agendaService.findByConsultorio(consultorioId));
    }

    @GetMapping("/eventos")
    public List<TurnoDTO> obtenerEventos(@RequestParam int esquemaTurnoId, @RequestParam int semanas) {
        EsquemaTurno esquemaTurno = agendaService.findEsquemaTurnoById(esquemaTurnoId);
        if (esquemaTurno == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Esquema de turno no encontrado");
        }

        return agendaService.generarEventosDesdeEsquemaTurno(esquemaTurno, semanas);
    }

    @GetMapping("/eventos/todos")
    public List<TurnoDTO> obtenerTodosLosEventos(@RequestParam int semanas) {
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findAll();
        List<TurnoDTO> todosLosEventos = new ArrayList<>();

        for (EsquemaTurno esquema : esquemas) {
            List<TurnoDTO> eventos = agendaService.generarEventosDesdeEsquemaTurno(esquema, semanas);
            todosLosEventos.addAll(eventos);
        }

        return todosLosEventos;
    }

 
    // Nuevos endpoints para gestión de días excepcionales y sanitización
    
    /**
     * Crear un día excepcional usando el nuevo sistema de configuraciones
     */
    @PostMapping("/dia-excepcional")
    public ResponseEntity<Object> crearDiaExcepcional(@RequestBody Map<String, Object> params) {
        try {
            LocalDate fecha = LocalDate.parse((String) params.get("fecha"));
            String tipoAgenda = (String) params.get("tipoAgenda");
            String descripcion = (String) params.get("descripcion");
            Integer esquemaTurnoId = params.get("esquemaTurnoId") != null ? 
                Integer.valueOf(params.get("esquemaTurnoId").toString()) : null;
            
            LocalTime horaInicio = null;
            LocalTime horaFin = null;
            Integer tiempoSanitizacion = null;
            
            if (params.get("horaInicio") != null) {
                horaInicio = LocalTime.parse((String) params.get("horaInicio"));
            }
            if (params.get("horaFin") != null) {
                horaFin = LocalTime.parse((String) params.get("horaFin"));
            }
            if (params.get("tiempoSanitizacion") != null) {
                tiempoSanitizacion = Integer.valueOf(params.get("tiempoSanitizacion").toString());
            }
            
            ConfiguracionExcepcional config = null;
            
            switch (tipoAgenda.toUpperCase()) {
                case "FERIADO":
                    config = configuracionExcepcionalService.crearFeriado(fecha, descripcion);
                    break;
                case "MANTENIMIENTO":
                    if (esquemaTurnoId == null) {
                        return Response.error(null, "EsquemaTurno es requerido para mantenimiento");
                    }
                    EsquemaTurno esquema = esquemaTurnoRepository.findById(esquemaTurnoId)
                            .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
                    config = configuracionExcepcionalService.crearMantenimiento(fecha, descripcion, 
                            esquema.getConsultorio().getId(), tiempoSanitizacion);
                    break;
                case "ATENCION_ESPECIAL":
                    if (esquemaTurnoId == null || horaInicio == null || horaFin == null) {
                        return Response.error(null, "EsquemaTurno, horaInicio y horaFin son requeridos para atención especial");
                    }
                    config = configuracionExcepcionalService.crearAtencionEspecial(fecha, descripcion, 
                            esquemaTurnoId, horaInicio, horaFin, tiempoSanitizacion);
                    break;
                default:
                    return Response.error(null, "Tipo de agenda no válido: " + tipoAgenda);
            }
            
            return Response.ok(config, "Día excepcional creado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al crear día excepcional: " + e.getMessage());
        }
    }
    
     
    @PutMapping("/esquema-turno/{esquemaTurnoId}/sanitizacion")
    public ResponseEntity<Object> configurarSanitizacion(
            @PathVariable Integer esquemaTurnoId,
            @RequestBody Map<String, Integer> params) {
        try {
            Integer tiempoSanitizacion = params.get("tiempoSanitizacion");
            agendaService.configurarSanitizacion(esquemaTurnoId, tiempoSanitizacion);
            return Response.ok(null, "Configuración de sanitización actualizada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al configurar sanitización: " + e.getMessage());
        }
    }
    
    @GetMapping("/dias-excepcionales")
    public ResponseEntity<Object> obtenerDiasExcepcionales(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin,
            @RequestParam(required = false) Integer centroId) {
        try {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            
            List<ConfiguracionExcepcional> configuraciones;
            if (centroId != null) {
                configuraciones = configuracionExcepcionalService.obtenerConfiguracionesPorCentro(inicio, fin, centroId);
            } else {
                configuraciones = configuracionExcepcionalService.obtenerConfiguracionesPorRango(inicio, fin);
            }
            
            // Convertir ConfiguracionExcepcional a AgendaDTO.DiaExcepcionalDTO para compatibilidad con frontend
            List<AgendaDTO.DiaExcepcionalDTO> resultado = configuraciones.stream()
                .map(this::convertirConfiguracionADTO)
                .collect(Collectors.toList());
            
            return Response.ok(resultado, "Días excepcionales obtenidos correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener días excepcionales: " + e.getMessage());
        }
    }
    
    @GetMapping("/validar-disponibilidad")
    public ResponseEntity<Object> validarDisponibilidad(
            @RequestParam String fecha,
            @RequestParam String horaInicio,
            @RequestParam Integer consultorioId,
            @RequestParam Integer staffMedicoId) {
        try {
            LocalDate fechaLocal = LocalDate.parse(fecha);
            LocalTime horaLocal = LocalTime.parse(horaInicio);
            
            boolean disponible = agendaService.validarDisponibilidad(fechaLocal, horaLocal, consultorioId, staffMedicoId);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("disponible", disponible);
            if (!disponible) {
                resultado.put("motivo", "Slot no disponible - verificar feriados, mantenimiento o turnos existentes");
            }
            
            return Response.ok(resultado, "Validación completada");
        } catch (Exception e) {
            return Response.error(null, "Error al validar disponibilidad: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/dia-excepcional/{configId}")
    public ResponseEntity<Object> eliminarDiaExcepcional(@PathVariable Integer configId) {
        try {
            configuracionExcepcionalService.eliminarConfiguracion(configId);
            return Response.ok(null, "Día excepcional eliminado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al eliminar día excepcional: " + e.getMessage());
        }
    }
    
    @GetMapping("/slots-disponibles/{staffMedicoId}")
    public ResponseEntity<Object> obtenerSlotsDisponiblesPorMedico(
            @PathVariable Integer staffMedicoId,
            @RequestParam(defaultValue = "4") int semanas) {
        try {
            List<TurnoDTO> slots = agendaService.obtenerSlotsDisponiblesPorMedico(staffMedicoId, semanas);
            return Response.ok(slots, "Slots disponibles obtenidos correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al obtener slots disponibles: " + e.getMessage());
        }
    }

    /**
     * Convierte ConfiguracionExcepcional a DTO para compatibilidad con frontend
     */
    private AgendaDTO.DiaExcepcionalDTO convertirConfiguracionADTO(ConfiguracionExcepcional config) {
        AgendaDTO.DiaExcepcionalDTO dto = new AgendaDTO.DiaExcepcionalDTO();
        dto.setId(config.getId());
        dto.setFecha(config.getFecha().toString()); // Formato ISO yyyy-MM-dd
        dto.setTipoAgenda(config.getTipo().toString());
        dto.setDescripcion(config.getDescripcion());
        
        if (config.getHoraInicio() != null) {
            dto.setApertura(config.getHoraInicio().toString()); // Formato HH:mm
        }
        if (config.getHoraFin() != null) {
            dto.setCierre(config.getHoraFin().toString()); // Formato HH:mm
        }
        
        // Mapear información del centro, consultorio y esquema de turno si existen
        if (config.getCentroAtencion() != null) {
            dto.setCentroId(config.getCentroAtencion().getId());
            dto.setCentroNombre(config.getCentroAtencion().getNombre());
        }
        
        if (config.getConsultorio() != null) {
            dto.setConsultorioId(config.getConsultorio().getId());
            dto.setConsultorioNombre(config.getConsultorio().getNombre());
        }
        
        if (config.getEsquemaTurno() != null && config.getEsquemaTurno().getStaffMedico() != null) {
            dto.setMedicoId(config.getEsquemaTurno().getStaffMedico().getMedico().getId());
            dto.setMedicoNombre(config.getEsquemaTurno().getStaffMedico().getMedico().getNombre());
            dto.setMedicoApellido(config.getEsquemaTurno().getStaffMedico().getMedico().getApellido());
            
            if (config.getEsquemaTurno().getStaffMedico().getMedico().getEspecialidad() != null) {
                dto.setEspecialidad(config.getEsquemaTurno().getStaffMedico().getMedico().getEspecialidad().getNombre());
            }
        }
        
        return dto;
    }

}
