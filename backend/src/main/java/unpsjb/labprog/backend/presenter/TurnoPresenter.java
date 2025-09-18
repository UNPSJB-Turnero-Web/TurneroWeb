package unpsjb.labprog.backend.presenter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

import jakarta.servlet.http.HttpServletRequest;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ExportService;
import unpsjb.labprog.backend.business.service.TurnoService;
import unpsjb.labprog.backend.config.JwtTokenProvider;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.dto.TurnoFilterDTO;
import unpsjb.labprog.backend.model.AuditLog;
import unpsjb.labprog.backend.model.EstadoTurno;

@RestController
@RequestMapping("turno")
public class TurnoPresenter {

    @Autowired
    private TurnoService service;

    @Autowired
    private ExportService exportService;

    // Método auxiliar para auditoría
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String getCurrentUser(HttpServletRequest request) {
        // Extraer JWT del header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtTokenProvider.extractUsername(token);
                if (username != null && !username.isEmpty()) {
                    return username;
                }
            } catch (Exception e) {
                // Token inválido o expirado, continuar con fallback
            }
        }
        // Fallback: header X-User-ID (para compatibilidad)
        String user = request.getHeader("X-User-ID");
        return user != null ? user : "ADMIN";
    }

    @GetMapping
    public ResponseEntity<Object> getAll() {
        List<TurnoDTO> turnos = service.findAll();
        return Response.ok(turnos, "Turnos recuperados correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(turno -> Response.ok(turno, "Turno recuperado correctamente"))
                .orElse(Response.notFound("Turno no encontrado"));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Object> getByPacienteId(@PathVariable Integer pacienteId) {
        List<TurnoDTO> turnos = service.findByPacienteId(pacienteId);
        return Response.ok(turnos, "Turnos del paciente recuperados correctamente");
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody TurnoDTO turnoDTO) {
        TurnoDTO saved = service.save(turnoDTO);
        return Response.ok(saved, "Turno creado correctamente");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Integer id, @RequestBody TurnoDTO turnoDTO) {
        turnoDTO.setId(id);
        TurnoDTO updated = service.save(turnoDTO);
        return Response.ok(updated, "Turno actualizado correctamente");
    }

     @GetMapping("/page")
    public ResponseEntity<Object> getByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageResult = service.findByPage(page, size);

            var response = Map.of(
                    "content", pageResult.getContent(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements(),
                    "number", pageResult.getNumber(),
                    "size", pageResult.getSize(),
                    "first", pageResult.isFirst(),
                    "last", pageResult.isLast(),
                    "numberOfElements", pageResult.getNumberOfElements());

            return Response.ok(response, "Staff médico paginado recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el staff médico paginado: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Integer id) {
        service.delete(id);
        return Response.ok(null, "Turno eliminado correctamente");
    }


    @PostMapping("/asignar")
    public ResponseEntity<Object> asignarTurno(@RequestBody TurnoDTO turnoDTO) {
        try {
            TurnoDTO savedTurno = service.save(turnoDTO);
            return Response.ok(savedTurno, "Turno asignado correctamente.");
        } catch (IllegalArgumentException e) {
            return Response.dbError(e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error al asignar el turno.");
        }
    }

    // ========== ENDPOINTS PARA CAMBIOS DE ESTADO ==========
    
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Object> cancelarTurno(@PathVariable Integer id, 
                                               @RequestBody Map<String, String> body,
                                               HttpServletRequest request) {
        try {
            String motivo = body.get("motivo");
            String user = body.get("usuario"); // Usar el usuario del body
            
            // Si no viene usuario en el body, usar el método anterior como fallback
            if (user == null || user.trim().isEmpty()) {
                user = getCurrentUser(request);
            }
            
            TurnoDTO turno = service.cancelarTurno(id, motivo, user);
            return Response.ok(turno, "Turno cancelado correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error interno del servidor: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Object> confirmarTurno(@PathVariable Integer id,
                                                @RequestBody(required = false) Map<String, String> body,
                                                HttpServletRequest request) {
        try {
            String user = null;
            
            // Intentar obtener usuario del body primero
            if (body != null) {
                user = body.get("usuario");
            }
            
            // Si no viene usuario en el body, usar el método anterior como fallback
            if (user == null || user.trim().isEmpty()) {
                user = getCurrentUser(request);
            }
            
            TurnoDTO turno = service.confirmarTurno(id, user);
            return Response.ok(turno, "Turno confirmado correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error interno del servidor: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<Object> completarTurno(@PathVariable Integer id,
                                                HttpServletRequest request) {
        try {
            String user = getCurrentUser(request);
            TurnoDTO turno = service.completarTurno(id, user);
            return Response.ok(turno, "Turno completado correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error interno del servidor: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reagendar")
    public ResponseEntity<Object> reagendarTurno(@PathVariable Integer id,
                                                @RequestBody Map<String, Object> body,
                                                HttpServletRequest request) {
        try {
            TurnoDTO nuevosDatos = new TurnoDTO();
            // Parsear los nuevos datos del turno desde el body
            if (body.containsKey("fecha")) {
                nuevosDatos.setFecha(java.time.LocalDate.parse((String) body.get("fecha")));
            }
            if (body.containsKey("horaInicio")) {
                nuevosDatos.setHoraInicio(java.time.LocalTime.parse((String) body.get("horaInicio")));
            }
            if (body.containsKey("horaFin")) {
                nuevosDatos.setHoraFin(java.time.LocalTime.parse((String) body.get("horaFin")));
            }
            
            String motivo = (String) body.get("motivo");
            String user = getCurrentUser(request);
            TurnoDTO turno = service.reagendarTurno(id, nuevosDatos, motivo, user);
            return Response.ok(turno, "Turno reagendado correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error interno del servidor: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Object> cambiarEstado(@PathVariable Integer id,
                                               @RequestBody Map<String, String> body,
                                               HttpServletRequest request) {
        try {
            String estadoStr = body.get("estado");
            String motivo = body.get("motivo");
            String user = body.get("usuario"); // Usar el usuario del body
            
            // Si no viene usuario en el body, usar el método anterior como fallback
            if (user == null || user.trim().isEmpty()) {
                user = getCurrentUser(request);
            }
            
            EstadoTurno newState = EstadoTurno.valueOf(estadoStr.toUpperCase());
            TurnoDTO turno = service.changeEstado(id, newState, motivo, user);
            return Response.ok(turno, "Estado del turno cambiado correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (IllegalStateException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error interno del servidor: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/estados-validos")
    public ResponseEntity<Object> getEstadosValidos(@PathVariable Integer id) {
        try {
            List<EstadoTurno> estados = service.getValidNextStates(id);
            return Response.ok(estados, "Estados válidos recuperados correctamente");
        } catch (IllegalArgumentException e) {
            return Response.error(null, e.getMessage());
        } catch (Exception e) {
            return Response.error(null, "Error interno del servidor: " + e.getMessage());
        }
    }

    // === ENDPOINTS DE AUDITORÍA ===
    
    @GetMapping("/{id}/audit")
    public ResponseEntity<Object> getTurnoAuditHistory(@PathVariable Integer id) {
        try {
            List<AuditLog> auditHistory = service.getTurnoAuditHistory(id);
            return Response.ok(auditHistory, "Historial de auditoría recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el historial de auditoría: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/audit/page")
    public ResponseEntity<Object> getTurnoAuditHistoryPaged(@PathVariable Integer id,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        try {
            Page<AuditLog> auditHistory = service.getTurnoAuditHistoryPaged(id, page, size);
            
            var response = Map.of(
                    "content", auditHistory.getContent(),
                    "totalPages", auditHistory.getTotalPages(),
                    "totalElements", auditHistory.getTotalElements(),
                    "number", auditHistory.getNumber(),
                    "size", auditHistory.getSize(),
                    "first", auditHistory.isFirst(),
                    "last", auditHistory.isLast(),
                    "numberOfElements", auditHistory.getNumberOfElements());

            return Response.ok(response, "Historial de auditoría paginado recuperado correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar el historial de auditoría: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/audit/verify")
    public ResponseEntity<Object> verifyTurnoAuditIntegrity(@PathVariable Integer id) {
        try {
            boolean isValid = service.verifyTurnoAuditIntegrity(id);
            return Response.ok(Map.of("isValid", isValid), 
                             isValid ? "La integridad del historial es válida" : 
                                     "Se detectaron inconsistencias en el historial");
        } catch (Exception e) {
            return Response.error(null, "Error al verificar la integridad del historial: " + e.getMessage());
        }
    }

    @GetMapping("/audit/statistics")
    public ResponseEntity<Object> getAuditStatistics() {
        try {
            List<Object[]> statistics = service.getAuditStatistics();
            return Response.ok(statistics, "Estadísticas de auditoría recuperadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar las estadísticas: " + e.getMessage());
        }
    }

    @GetMapping("/audit/recent")
    public ResponseEntity<Object> getRecentAuditLogs() {
        try {
            List<AuditLog> recentLogs = service.getRecentAuditLogs();
            return Response.ok(recentLogs, "Logs recientes recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al recuperar los logs recientes: " + e.getMessage());
        }
    }

    // === ENDPOINTS PARA CONSULTAS AVANZADAS ===

    @PostMapping("/search")
    public ResponseEntity<Object> searchWithFilters(@RequestBody TurnoFilterDTO filter) {
        try {
            if (filter.getExportFormat() != null && !filter.getExportFormat().isEmpty()) {
                // Es una solicitud de exportación
                List<TurnoDTO> turnos = service.findForExport(filter);
                return Response.ok(turnos, "Datos para exportación recuperados correctamente");
            } else {
                // Es una consulta paginada normal
                Page<TurnoDTO> turnos = service.findByAdvancedFilters(filter);
                Map<String, Object> response = Map.of(
                    "content", turnos.getContent(),
                    "totalElements", turnos.getTotalElements(),
                    "totalPages", turnos.getTotalPages(),
                    "size", turnos.getSize(),
                    "number", turnos.getNumber(),
                    "first", turnos.isFirst(),
                    "last", turnos.isLast(),
                    "numberOfElements", turnos.getNumberOfElements());
                
                return Response.ok(response, "Turnos filtrados recuperados correctamente");
            }
        } catch (Exception e) {
            return Response.error(null, "Error al buscar turnos: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchByText(
            @RequestParam(value = "q", required = false) String searchText,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "fecha") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "ASC") String sortDirection) {
        try {
            org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                "DESC".equalsIgnoreCase(sortDirection) ? 
                    org.springframework.data.domain.Sort.Direction.DESC : 
                    org.springframework.data.domain.Sort.Direction.ASC, 
                sortBy
            );
            
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size, sort);
                
            Page<TurnoDTO> turnos = service.findByTextSearch(searchText, pageable);
            
            Map<String, Object> response = Map.of(
                "content", turnos.getContent(),
                "totalElements", turnos.getTotalElements(),
                "totalPages", turnos.getTotalPages(),
                "size", turnos.getSize(),
                "number", turnos.getNumber(),
                "first", turnos.isFirst(),
                "last", turnos.isLast(),
                "numberOfElements", turnos.getNumberOfElements());
            
            return Response.ok(response, "Búsqueda por texto completada correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error en la búsqueda por texto: " + e.getMessage());
        }
    }

    @PostMapping("/filters/simple")
    public ResponseEntity<Object> searchWithSimpleFilters(@RequestBody TurnoFilterDTO filter) {
        try {
            List<TurnoDTO> turnos = service.findByFilters(filter);
            return Response.ok(turnos, "Turnos filtrados recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al aplicar filtros: " + e.getMessage());
        }
    }

    @GetMapping("/filtrar")
    public ResponseEntity<Object> filtrarTurnos(
            @RequestParam(value = "estado", required = false) String estado,
            @RequestParam(value = "fechaDesde", required = false) String fechaDesde,
            @RequestParam(value = "fechaHasta", required = false) String fechaHasta,
            @RequestParam(value = "especialidad", required = false) String especialidad,
            @RequestParam(value = "centro", required = false) Integer centroId,
            @RequestParam(value = "medico", required = false) Integer medicoId,
            @RequestParam(value = "paciente", required = false) Integer pacienteId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            TurnoFilterDTO filterDTO = new TurnoFilterDTO();
            if (estado != null) filterDTO.setEstado(estado);
            if (fechaDesde != null) filterDTO.setFechaDesde(java.time.LocalDate.parse(fechaDesde));
            if (fechaHasta != null) filterDTO.setFechaHasta(java.time.LocalDate.parse(fechaHasta));
            if (especialidad != null) filterDTO.setEspecialidad(especialidad);
            if (centroId != null) filterDTO.setCentroId(centroId);
            if (medicoId != null) filterDTO.setMedicoId(medicoId);
            if (pacienteId != null) filterDTO.setPacienteId(pacienteId);
            
            Page<TurnoDTO> result = service.findByFilters(filterDTO, page, size);
            
            Map<String, Object> response = Map.of(
                "turnos", result.getContent(),
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "first", result.isFirst(),
                "last", result.isLast()
            );
            
            return Response.ok(response, "Turnos filtrados recuperados correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al filtrar turnos: " + e.getMessage());
        }
    }
    
    /**
     * Exportar turnos a CSV
     */
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCSV(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) Integer pacienteId,
            @RequestParam(required = false) Integer staffMedicoId,
            @RequestParam(required = false) Integer centroId) {
        
        try {
            TurnoFilterDTO filter = new TurnoFilterDTO();
            filter.setEstado(estado);
            filter.setFechaDesde(fechaDesde != null ? LocalDate.parse(fechaDesde) : null);
            filter.setFechaHasta(fechaHasta != null ? LocalDate.parse(fechaHasta) : null);
            filter.setPacienteId(pacienteId);
            filter.setStaffMedicoId(staffMedicoId);
            filter.setCentroId(centroId);
            
            String csvContent = exportService.exportToCSV(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", "turnos.csv");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvContent);
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al exportar CSV: " + e.getMessage());
        }
    }
    
    /**
     * Exportar turnos a PDF
     */
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportToPDF(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) Integer pacienteId,
            @RequestParam(required = false) Integer staffMedicoId,
            @RequestParam(required = false) Integer centroId) {
        
        try {
            TurnoFilterDTO filter = new TurnoFilterDTO();
            filter.setEstado(estado);
            filter.setFechaDesde(fechaDesde != null ? LocalDate.parse(fechaDesde) : null);
            filter.setFechaHasta(fechaHasta != null ? LocalDate.parse(fechaHasta) : null);
            filter.setPacienteId(pacienteId);
            filter.setStaffMedicoId(staffMedicoId);
            filter.setCentroId(centroId);
            
            byte[] pdfContent = exportService.exportToPDF(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "turnos.pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error al exportar PDF: " + e.getMessage()).getBytes());
        }
    }
    
    /**
     * Exportar turnos a PDF usando POST con filtros en el cuerpo
     */
    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportToPDFPost(@RequestBody TurnoFilterDTO filter) {
        
        try {
            System.out.println("PDF Export POST - Filtros recibidos: " + filter);
            
            byte[] pdfContent = exportService.exportToPDF(filter);
            
            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error: PDF generado está vacío".getBytes());
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "turnos.pdf");
            headers.setContentLength(pdfContent.length);
            
            System.out.println("PDF Export POST - Generado correctamente, tamaño: " + pdfContent.length + " bytes");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);
                    
        } catch (Exception e) {
            System.err.println("PDF Export POST - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error al exportar PDF: " + e.getMessage()).getBytes());
        }
    }
}
