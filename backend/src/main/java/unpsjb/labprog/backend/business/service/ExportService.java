package unpsjb.labprog.backend.business.service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.dto.TurnoFilterDTO;

/**
 * Servicio para exportación de datos de turnos en diferentes formatos
 */
@Service
public class ExportService {

    @Autowired
    private TurnoService turnoService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    /**
     * Exporta turnos a formato CSV
     */
    public String exportToCSV(TurnoFilterDTO filter) {
        List<TurnoDTO> turnos = turnoService.findForExport(filter);
        
        StringWriter stringWriter = new StringWriter();
        try (PrintWriter writer = new PrintWriter(stringWriter)) {
            // Escribir encabezados
            writer.println("ID,Fecha,Hora Inicio,Hora Fin,Estado,Paciente,Medico,Especialidad,Centro,Consultorio,Ultima Modificacion,Usuario Modificacion,Total Modificaciones");
            
            // Escribir datos
            for (TurnoDTO turno : turnos) {
                writer.printf("%d,%s,%s,%s,%s,\"%s %s\",\"%s %s\",%s,%s,%s,%s,%s,%d%n",
                    turno.getId(),
                    turno.getFecha().format(DATE_FORMATTER),
                    turno.getHoraInicio().format(TIME_FORMATTER),
                    turno.getHoraFin().format(TIME_FORMATTER),
                    turno.getEstado(),
                    escapeCSV(turno.getNombrePaciente()),
                    escapeCSV(turno.getApellidoPaciente()),
                    escapeCSV(turno.getStaffMedicoNombre()),
                    escapeCSV(turno.getStaffMedicoApellido()),
                    escapeCSV(turno.getEspecialidadStaffMedico()),
                    escapeCSV(turno.getNombreCentro()),
                    escapeCSV(turno.getConsultorioNombre()),
                    turno.getFechaUltimaModificacion() != null ? 
                        turno.getFechaUltimaModificacion().format(DATETIME_FORMATTER) : "",
                    escapeCSV(turno.getUltimoUsuarioModificacion()),
                    (turno.getTotalModificaciones() != null ? turno.getTotalModificaciones() : Integer.valueOf(0))
                );
            }
        }
        return stringWriter.toString();
    }

    /**
     * Genera un reporte HTML básico para convertir a PDF
     */
    public String exportToHTML(TurnoFilterDTO filter) {
        List<TurnoDTO> turnos = turnoService.findForExport(filter);
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>Reporte de Turnos</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; }");
        html.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }");
        html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append("th { background-color: #f2f2f2; font-weight: bold; }");
        html.append("tr:nth-child(even) { background-color: #f9f9f9; }");
        html.append(".header { text-align: center; margin-bottom: 30px; }");
        html.append(".summary { margin-bottom: 20px; }");
        html.append("</style>");
        html.append("</head><body>");
        
        // Encabezado del reporte
        html.append("<div class='header'>");
        html.append("<h1>Reporte de Turnos Médicos</h1>");
        html.append("<p>Generado el: ").append(java.time.LocalDateTime.now().format(DATETIME_FORMATTER)).append("</p>");
        html.append("</div>");
        
        // Resumen
        html.append("<div class='summary'>");
        html.append("<h3>Resumen</h3>");
        html.append("<p>Total de turnos: <strong>").append(turnos.size()).append("</strong></p>");
        
        // Estadísticas por estado
        java.util.Map<String, Long> estadoCount = turnos.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                TurnoDTO::getEstado, 
                java.util.stream.Collectors.counting()));
        
        for (java.util.Map.Entry<String, Long> entry : estadoCount.entrySet()) {
            html.append("<p>").append(entry.getKey()).append(": <strong>")
                .append(entry.getValue()).append("</strong></p>");
        }
        html.append("</div>");
        
        // Tabla de datos
        html.append("<table>");
        html.append("<thead><tr>");
        html.append("<th>ID</th><th>Fecha</th><th>Hora</th><th>Estado</th>");
        html.append("<th>Paciente</th><th>Médico</th><th>Especialidad</th>");
        html.append("<th>Centro</th><th>Consultorio</th>");
        html.append("<th>Modificaciones</th>");
        html.append("</tr></thead>");
        html.append("<tbody>");
        
        for (TurnoDTO turno : turnos) {
            html.append("<tr>");
            html.append("<td>").append(turno.getId()).append("</td>");
            html.append("<td>").append(turno.getFecha().format(DATE_FORMATTER)).append("</td>");
            html.append("<td>").append(turno.getHoraInicio().format(TIME_FORMATTER))
                .append(" - ").append(turno.getHoraFin().format(TIME_FORMATTER)).append("</td>");
            html.append("<td>").append(escapeHTML(turno.getEstado())).append("</td>");
            html.append("<td>").append(escapeHTML(turno.getNombrePaciente()))
                .append(" ").append(escapeHTML(turno.getApellidoPaciente())).append("</td>");
            html.append("<td>").append(escapeHTML(turno.getStaffMedicoNombre()))
                .append(" ").append(escapeHTML(turno.getStaffMedicoApellido())).append("</td>");
            html.append("<td>").append(escapeHTML(turno.getEspecialidadStaffMedico())).append("</td>");
            html.append("<td>").append(escapeHTML(turno.getNombreCentro())).append("</td>");
            html.append("<td>").append(escapeHTML(turno.getConsultorioNombre())).append("</td>");
            html.append("<td>").append(turno.getTotalModificaciones() != null ? 
                turno.getTotalModificaciones() : Integer.valueOf(0)).append("</td>");
            html.append("</tr>");
        }
        
        html.append("</tbody></table>");
        html.append("</body></html>");
        
        return html.toString();
    }

    /**
     * Obtiene estadísticas de exportación
     */
    public java.util.Map<String, Object> getExportStatistics(TurnoFilterDTO filter) {
        List<TurnoDTO> turnos = turnoService.findForExport(filter);
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalTurnos", turnos.size());
        
        // Estadísticas por estado
        java.util.Map<String, Long> estadoCount = turnos.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                TurnoDTO::getEstado, 
                java.util.stream.Collectors.counting()));
        stats.put("porEstado", estadoCount);
        
        // Estadísticas por centro
        java.util.Map<String, Long> centroCount = turnos.stream()
            .filter(t -> t.getNombreCentro() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                TurnoDTO::getNombreCentro, 
                java.util.stream.Collectors.counting()));
        stats.put("porCentro", centroCount);
        
        // Estadísticas por especialidad
        java.util.Map<String, Long> especialidadCount = turnos.stream()
            .filter(t -> t.getEspecialidadStaffMedico() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                TurnoDTO::getEspecialidadStaffMedico, 
                java.util.stream.Collectors.counting()));
        stats.put("porEspecialidad", especialidadCount);
        
        // Turnos con modificaciones
        long turnosModificados = turnos.stream()
            .filter(t -> t.getTotalModificaciones() != null && t.getTotalModificaciones() > 0)
            .count();
        stats.put("turnosModificados", turnosModificados);
        
        return stats;
    }

    /**
     * Escapa caracteres especiales para CSV
     */
    private String escapeCSV(String value) {
        if (value == null) return "";
        
        // Si contiene comas, comillas o saltos de línea, envolver en comillas
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            // Escapar comillas dobles duplicándolas
            value = value.replace("\"", "\"\"");
            return "\"" + value + "\"";
        }
        return value;
    }

    /**
     * Escapa caracteres especiales para HTML
     */
    private String escapeHTML(String value) {
        if (value == null) return "";
        
        return value.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;");
    }
}
