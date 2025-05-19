package unpsjb.labprog.backend.business.service;

import java.util.List;

import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.Paciente;

@Service
public class NotificacionService {
    public void notificarCancelacion(Paciente paciente, Agenda agenda, List<Agenda> alternativas) {
        // Aquí iría la lógica real de notificación (email, SMS, etc.)
        System.out.println("Notificando a " + paciente.getNombre() + " sobre cancelación de agenda " + agenda.getId());
        // Puedes incluir sugerencias de alternativas en el mensaje
    }
}