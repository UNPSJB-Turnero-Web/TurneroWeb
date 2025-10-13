package unpsjb.labprog.backend.presenter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.service.AgendaService;
import unpsjb.labprog.backend.business.service.ConfiguracionExcepcionalService;
import unpsjb.labprog.backend.dto.ConfiguracionExcepcionalDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.dto.TurnoPublicoDTO;
import unpsjb.labprog.backend.model.EsquemaTurno;

@RestController
@RequestMapping("/agenda")
public class AgendaPresenter {

    @Autowired
    private AgendaService agendaService;

    @Autowired
    private ConfiguracionExcepcionalService configuracionExcepcionalService;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    /**
     * Endpoint público para listar turnos disponibles.
     * NO requiere autenticación.
     * NO expone información sensible del paciente.
     * Genera slots dinámicamente desde esquemas de turno (igual que /eventos/todos)
     * y filtra solo los disponibles.
     * 
     * @param centroId ID opcional del centro de atención para filtrar
     * @param especialidad Nombre opcional de la especialidad para filtrar
     * @param staffMedicoId ID opcional del staff médico para filtrar
     * @param semanas Número de semanas a futuro para generar slots (por defecto 4)
     * @return Lista de turnos disponibles en formato público (sin datos del paciente)
     */
    @GetMapping("/publica")
    public ResponseEntity<Object> obtenerTurnosPublicosDisponibles(
            @RequestParam(name = "centroId", required = false) Integer centroId,
            @RequestParam(name = "especialidad", required = false) String especialidad,
            @RequestParam(name = "staffMedicoId", required = false) Integer staffMedicoId,
            @RequestParam(name = "semanas", required = false, defaultValue = "4") Integer semanas) {
        try {
            
            List<TurnoPublicoDTO> turnosPublicos = 
                agendaService.findTurnosPublicosDisponibles(centroId, especialidad, staffMedicoId, semanas);
            
            String mensaje = String.format("Turnos disponibles obtenidos correctamente (%d semanas)", semanas);
            
            return Response.ok(turnosPublicos, mensaje);
        } catch (Exception e) {
            return Response.error(null, "Error al obtener turnos públicos: " + e.getMessage());
        }
    }

    

    @GetMapping("/eventos/todos")
    public List<TurnoDTO> obtenerTodosLosEventos(
            @RequestParam int semanas,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) Integer staffMedicoId,
            @RequestParam(required = false) Integer centroId) {
        
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findAll();
        List<TurnoDTO> todosLosEventos = new ArrayList<>();

        for (EsquemaTurno esquema : esquemas) {
            // Skip schemes with null consultorio to prevent errors
            if (esquema.getConsultorio() == null) {
                System.err.println("⚠️ Skipping EsquemaTurno ID " + esquema.getId() + 
                                 " - consultorio is null. Please check database integrity.");
                continue;
            }
            
            // FILTRAR POR CENTRO DE ATENCIÓN
            if (centroId != null && esquema.getConsultorio().getCentroAtencion() != null) {
                if (!esquema.getConsultorio().getCentroAtencion().getId().equals(centroId)) {
                    continue; // Skip este esquema si no coincide el centro
                }
            }
            
            // FILTRAR POR STAFF MÉDICO
            if (staffMedicoId != null && esquema.getStaffMedico() != null) {
                if (!esquema.getStaffMedico().getId().equals(staffMedicoId)) {
                    continue; // Skip este esquema si no coincide el médico
                }
            }
            
            // FILTRAR POR ESPECIALIDAD
            if (especialidad != null && !especialidad.isEmpty() && 
                esquema.getStaffMedico() != null && 
                esquema.getStaffMedico().getEspecialidad() != null) {
                
                String especialidadEsquema = esquema.getStaffMedico().getEspecialidad().getNombre();
                if (!especialidadEsquema.equalsIgnoreCase(especialidad.trim())) {
                    continue; // Skip este esquema si no coincide la especialidad
                }
            }
            
            try {
                List<TurnoDTO> eventos = agendaService.generarEventosDesdeEsquemaTurno(esquema, semanas);
                todosLosEventos.addAll(eventos);
            } catch (Exception e) {
                System.err.println("❌ Error processing EsquemaTurno ID " + esquema.getId() + ": " + e.getMessage());
                // Continue processing other schemas instead of failing completely
                continue;
            }
        }

        System.out.println("✅ [AgendaPresenter] Total eventos generados después de filtros: " + todosLosEventos.size());
        return todosLosEventos;
    }

 
    // Nuevos endpoints para gestión de días excepcionales y sanitización
    
    /**
     * Crear un día excepcional usando el nuevo sistema de configuraciones con DTO
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
            Integer duracion = null;
            
            if (params.get("horaInicio") != null) {
                horaInicio = LocalTime.parse((String) params.get("horaInicio"));
            }
            if (params.get("horaFin") != null) {
                horaFin = LocalTime.parse((String) params.get("horaFin"));
            }
            if (params.get("duracion") != null) {
                duracion = Integer.valueOf(params.get("duracion").toString());
            }
            
            ConfiguracionExcepcionalDTO configDTO = null;
            
            switch (tipoAgenda.toUpperCase()) {
                case "FERIADO":
                    configDTO = configuracionExcepcionalService.crearFeriadoDTO(fecha, descripcion);
                    break;
                case "MANTENIMIENTO":
                    if (esquemaTurnoId == null) {
                        return Response.error(null, "EsquemaTurno es requerido para mantenimiento");
                    }
                    EsquemaTurno esquema = esquemaTurnoRepository.findById(esquemaTurnoId)
                            .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
                    configDTO = configuracionExcepcionalService.crearMantenimientoDTO(fecha, descripcion, 
                            esquema.getConsultorio().getId(), horaInicio, duracion);
                    break;
                case "ATENCION_ESPECIAL":
                    if (esquemaTurnoId == null || horaInicio == null || horaFin == null) {
                        return Response.error(null, "EsquemaTurno, horaInicio y horaFin son requeridos para atención especial");
                    }
                    configDTO = configuracionExcepcionalService.crearAtencionEspecialDTO(fecha, descripcion, 
                            esquemaTurnoId, horaInicio, horaFin, duracion);
                    break;
                default:
                    return Response.error(null, "Tipo de agenda no válido: " + tipoAgenda);
            }
            
            return Response.ok(configDTO, "Día excepcional creado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al crear día excepcional: " + e.getMessage());
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
            
            List<ConfiguracionExcepcionalDTO> configuraciones;
            if (centroId != null) {
                configuraciones = configuracionExcepcionalService.obtenerConfiguracionesPorCentroDTO(inicio, fin, centroId);
            } else {
                configuraciones = configuracionExcepcionalService.obtenerConfiguracionesPorRangoDTO(inicio, fin);
            }
            
            return Response.ok(configuraciones, "Días excepcionales obtenidos correctamente");
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
     * Actualizar un día excepcional existente usando el nuevo sistema de configuraciones con DTO
     */
    @PutMapping("/dia-excepcional/{configId}")
    public ResponseEntity<Object> actualizarDiaExcepcional(@PathVariable Integer configId, @RequestBody Map<String, Object> params) {
        try {
            LocalDate fecha = LocalDate.parse((String) params.get("fecha"));
            String tipoAgenda = (String) params.get("tipoAgenda");
            String descripcion = (String) params.get("descripcion");
            Integer esquemaTurnoId = params.get("esquemaTurnoId") != null ? 
                Integer.valueOf(params.get("esquemaTurnoId").toString()) : null;
            
            LocalTime horaInicio = null;
            LocalTime horaFin = null;
            Integer duracion = null;
            
            if (params.get("horaInicio") != null) {
                horaInicio = LocalTime.parse((String) params.get("horaInicio"));
            }
            if (params.get("horaFin") != null) {
                horaFin = LocalTime.parse((String) params.get("horaFin"));
            }
            if (params.get("duracion") != null) {
                duracion = Integer.valueOf(params.get("duracion").toString());
            }
            
            ConfiguracionExcepcionalDTO configDTO = configuracionExcepcionalService.saveOrUpdateDTO(
                new ConfiguracionExcepcionalDTO(configId, fecha, tipoAgenda, descripcion, horaInicio, horaFin, 
                duracion, true, null, null, null, null, esquemaTurnoId, null, null, null, null, null, null, null, null));
            
            return Response.ok(configDTO, "Día excepcional actualizado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al actualizar día excepcional: " + e.getMessage());
        }
    }

}
