package unpsjb.labprog.backend.presenter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.EmailService;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Controlador de prueba para el servicio de correo electrónico.
 * Solo para desarrollo y testing.
 */
@RestController
@RequestMapping("/api/email/test")
public class EmailTestController {

    @Autowired
    private EmailService emailService;

    /**
     * Endpoint para probar el envío de correo de texto plano.
     */
    @PostMapping("/text")
    public ResponseEntity<Object> sendTextEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String subject = request.get("subject");
            String body = request.get("body");

            emailService.sendTextEmail(to, subject, body);
            
            return Response.ok(null, "Correo de texto enviado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al enviar correo: " + e.getMessage());
        }
    }

    /**
     * Endpoint para probar el envío de correo HTML.
     */
    @PostMapping("/html")
    public ResponseEntity<Object> sendHtmlEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String subject = request.get("subject");
            String htmlBody = request.get("htmlBody");

            emailService.sendHtmlEmail(to, subject, htmlBody);
            
            return Response.ok(null, "Correo HTML enviado exitosamente");
        } catch (Exception e) {
            return Response.error(null, "Error al enviar correo HTML: " + e.getMessage());
        }
    }

    /**
     * Endpoint para probar el envío asíncrono de correo de texto.
     */
    @PostMapping("/text/async")
    public ResponseEntity<Object> sendTextEmailAsync(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String subject = request.get("subject");
            String body = request.get("body");

            CompletableFuture<Void> future = emailService.sendTextEmailAsync(to, subject, body);
            
            return Response.ok(null, "Correo de texto programado para envío asíncrono");
        } catch (Exception e) {
            return Response.error(null, "Error al enviar correo asíncrono: " + e.getMessage());
        }
    }

    /**
     * Endpoint para probar el correo de recuperación de contraseña.
     */
    @PostMapping("/password-reset")
    public ResponseEntity<Object> sendPasswordResetEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String resetLink = request.get("resetLink");

            CompletableFuture<Void> future = emailService.sendPasswordResetEmail(to, resetLink);
            
            return Response.ok(null, "Correo de recuperación de contraseña enviado");
        } catch (Exception e) {
            return Response.error(null, "Error al enviar correo de recuperación: " + e.getMessage());
        }
    }

    /**
     * Endpoint para probar el correo de activación de cuenta.
     */
    @PostMapping("/account-activation")
    public ResponseEntity<Object> sendAccountActivationEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String activationLink = request.get("activationLink");
            String userName = request.get("userName");

            CompletableFuture<Void> future = emailService.sendAccountActivationEmail(to, activationLink, userName);
            
            return Response.ok(null, "Correo de activación de cuenta enviado");
        } catch (Exception e) {
            return Response.error(null, "Error al enviar correo de activación: " + e.getMessage());
        }
    }

    /**
     * Endpoint para probar el correo de credenciales iniciales.
     */
    @PostMapping("/initial-credentials")
    public ResponseEntity<Object> sendInitialCredentialsEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String userName = request.get("userName");
            String temporaryPassword = request.get("temporaryPassword");

            CompletableFuture<Void> future = emailService.sendInitialCredentialsEmail(to, userName, temporaryPassword);
            
            return Response.ok(null, "Correo de credenciales iniciales enviado");
        } catch (Exception e) {
            return Response.error(null, "Error al enviar correo de credenciales: " + e.getMessage());
        }
    }
}
