package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.model.EstadoTurno;

import unpsjb.labprog.backend.model.Turno;

@Service
public class RecordatorioService {

    @Autowired
    private ConfiguracionService configuracionService;
    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private EmailService emailService;

    // === MÉTODOS PRINCIPALES ===

    @Scheduled(cron = "0 0 * * * ?") // Cada hora, pero filtra por hora config
    @Transactional
    public void enviarRecordatoriosPendientes() {
        if (!configuracionService.isHabilitadosRecordatorios())
            return;

        LocalTime horaEnvio = configuracionService.getHoraEnvioRecordatorios();
        if (!LocalTime.now().isAfter(horaEnvio) || !LocalTime.now().isBefore(horaEnvio.plusMinutes(5)))
            return; // Ventana de 5 min

        int diasRecordatorio = configuracionService.getDiasRecordatorioConfirmacion();
        LocalDate fechaObjetivo = LocalDate.now().plusDays(diasRecordatorio);

        List<Turno> turnos = turnoRepository.findByEstadoInAndFecha(
                Arrays.asList(EstadoTurno.PROGRAMADO, EstadoTurno.REAGENDADO), fechaObjetivo);

        for (Turno turno : turnos) {
            try {
                enviarRecordatorio(turno, "RECORDATORIO");
            } catch (Exception e) {
                System.err.println("Error al enviar recordatorio para turno " + turno.getId() + ": " + e.getMessage());
            }
        }
    }

    private boolean enviarRecordatorio(Turno turno, String tipo) {
        try {
            String email = turno.getPaciente().getEmail();
            String patientName = turno.getPaciente().getNombre() + " " + turno.getPaciente().getApellido();
            String reminderDetails = construirDetallesRecordatorio(turno); // Usa el método de RecordatorioService

            emailService.sendAppointmentReminderEmail(email, patientName, reminderDetails);
            return true;
        } catch (Exception e) {
            System.err.println("Error al enviar recordatorio para turno " + turno.getId() + ": " + e.getMessage());
            return false;
        }
    }

    // === MÉTODOS DE CONSULTA ===

    // === MÉTODOS DE GESTIÓN DE ESTADO ===

    // === ESTADÍSTICAS ===

    // === REINTENTO DE RECORDATORIOS FALLIDOS ===

    // Método auxiliar para detalles (adáptalo de
    // TurnoService.construirDetallesRecordatorioEmail)
    private String construirDetallesRecordatorio(Turno turno) {
        StringBuilder detalles = new StringBuilder();

        detalles.append("<p><strong>Fecha y Hora del Turno:</strong> ").append(turno.getFecha()).append(" a las ")
                .append(turno.getHoraInicio()).append("</p>");
        detalles.append("<p><strong>Centro Médico:</strong> ")
                .append(turno.getConsultorio() != null && turno.getConsultorio().getCentroAtencion() != null
                        ? turno.getConsultorio().getCentroAtencion().getNombre()
                        : "No disponible")
                .append("</p>");
        detalles.append("<p><strong>Consultorio:</strong> ")
                .append(turno.getConsultorio() != null ? turno.getConsultorio().getNombre() : "No disponible")
                .append("</p>");
        detalles.append("<p><strong>Especialidad:</strong> ")
                .append(turno.getStaffMedico() != null && turno.getStaffMedico().getEspecialidad() != null
                        ? turno.getStaffMedico().getEspecialidad().getNombre()
                        : "No disponible")
                .append("</p>");
        detalles.append("<p><strong>Profesional:</strong> ")
                .append(turno.getStaffMedico() != null && turno.getStaffMedico().getMedico() != null
                        ? turno.getStaffMedico().getMedico().getNombre() + " "
                                + turno.getStaffMedico().getMedico().getApellido()
                        : "No disponible")
                .append("</p>");

        return detalles.toString();
    }

}
