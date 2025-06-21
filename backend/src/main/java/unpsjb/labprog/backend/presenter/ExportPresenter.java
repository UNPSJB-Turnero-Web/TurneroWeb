package unpsjb.labprog.backend.presenter;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.ExportService;
import unpsjb.labprog.backend.dto.TurnoFilterDTO;

/**
 * Controlador REST para exportaciones de turnos
 */
@RestController
@RequestMapping("export")
public class ExportPresenter {

    @Autowired
    private ExportService exportService;

    @PostMapping("/turnos/csv")
    public ResponseEntity<String> exportTurnosToCSV(@RequestBody TurnoFilterDTO filter) {
        try {
            String csvContent = exportService.exportToCSV(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", "turnos_" + 
                java.time.LocalDate.now().toString() + ".csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csvContent);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error al generar CSV: " + e.getMessage());
        }
    }

    @PostMapping("/turnos/html")
    public ResponseEntity<String> exportTurnosToHTML(@RequestBody TurnoFilterDTO filter) {
        try {
            String htmlContent = exportService.exportToHTML(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_HTML);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(htmlContent);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error al generar HTML: " + e.getMessage());
        }
    }

    @PostMapping("/turnos/pdf")
    public ResponseEntity<String> exportTurnosToPDF(@RequestBody TurnoFilterDTO filter) {
        try {
            // Por ahora retornamos HTML que puede ser convertido a PDF en el frontend
            // o usando bibliotecas como wkhtmltopdf
            String htmlContent = exportService.exportToHTML(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_HTML);
            headers.set("X-Export-Type", "PDF");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(htmlContent);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error al generar reporte para PDF: " + e.getMessage());
        }
    }

    @PostMapping("/turnos/statistics")
    public ResponseEntity<Object> getExportStatistics(@RequestBody TurnoFilterDTO filter) {
        try {
            Map<String, Object> statistics = exportService.getExportStatistics(filter);
            return Response.ok(statistics, "Estadísticas de exportación generadas correctamente");
        } catch (Exception e) {
            return Response.error(null, "Error al generar estadísticas: " + e.getMessage());
        }
    }
}
