import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-paciente-dashboard',
  imports: [CommonModule],
  template: `
    <div class="patient-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>¡Bienvenido/a!</h1>
          <p>DNI: {{ patientDNI }}</p>
          <div class="user-actions">
            <button class="btn btn-logout" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <div class="action-card" (click)="viewAppointments()">
            <i class="fas fa-calendar-check"></i>
            <h3>Mis Turnos</h3>
            <p>Ver y gestionar tus citas médicas</p>
          </div>
          
        
          <div class="action-card" (click)="viewAgenda()">
            <i class="fas fa-calendar-alt"></i>
            <h3>Agenda de turnos</h3>
            <p>Ver horarios disponibles</p>
          </div>
          
          <div class="action-card" (click)="viewProfile()">
            <i class="fas fa-user-circle"></i>
            <h3>Mi Perfil</h3>
            <p>Ver y actualizar información personal</p>
          </div>
          
          <div class="action-card" (click)="viewHistory()">
            <i class="fas fa-history"></i>
            <h3>Historial</h3>
            <p>Consultar historial de consultas</p>
          </div>
        </div>
      </div>

      <!-- Recent Appointments -->
      <div class="recent-appointments">
        <h2>Próximos Turnos</h2>
        
        <!-- Loading state -->
        <div class="loading-state" *ngIf="isLoadingTurnos">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando turnos...</p>
        </div>
        
        <!-- Appointments list -->
        <div class="appointments-list" *ngIf="!isLoadingTurnos && proximosTurnos.length > 0">
          <div class="appointment-card" 
               *ngFor="let turno of proximosTurnos" 
               [class]="'upcoming ' + turno.status">
            <div class="appointment-date">
              <span class="day">{{ turno.day }}</span>
              <span class="month">{{ turno.month }}</span>
            </div>
            <div class="appointment-info">
              <h4>{{ turno.doctor }}</h4>
              <p>{{ turno.specialty }}</p>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i>
                {{ turno.location }}
              </p>
              <span class="time">{{ turno.time }}</span>
            </div>
            <div class="appointment-status">
              <span class="status" [class]="turno.status">
                {{ getStatusText(turno.status) }}
              </span>
            </div>
            <div class="appointment-actions" *ngIf="turno.status === 'programado' || turno.status === 'reagendado'">
              <button class="btn btn-confirm" (click)="confirmarTurno(turno)">
                <i class="fas fa-check"></i>
                Confirmar
              </button>
              <button class="btn btn-secondary" (click)="reprogramarTurno(turno)">
                <i class="fas fa-calendar-alt"></i>
                Reprogramar
              </button>
              <button class="btn btn-danger" (click)="cancelarTurno(turno)">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div class="empty-state" *ngIf="!isLoadingTurnos && proximosTurnos.length === 0">
          <i class="fas fa-calendar-times"></i>
          <h3>No tienes turnos programados</h3>
          <p>¡Programa tu primera cita médica!</p>
          <button class="btn btn-primary" (click)="scheduleAppointment()">
            Solicitar Turno
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .patient-dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .dashboard-header {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-section h1 {
      color: var(--pacientes-primary);
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    .welcome-section p {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0.5rem 0 0 0;
    }

    .user-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-logout {
      background: var(--action-delete);
      color: white;
    }

    .btn-logout:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--action-delete-shadow);
    }

    .btn-primary {
      background: var(--pacientes-gradient);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--pacientes-shadow);
    }

    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h2 {
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .action-card i {
      font-size: 3rem;
      color: var(--pacientes-primary);
      margin-bottom: 1rem;
    }

    .action-card h3 {
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .action-card p {
      color: #6c757d;
      margin: 0;
      line-height: 1.5;
    }

    .recent-appointments h2 {
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    }

    .loading-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--pacientes-primary);
    }

    .loading-state p {
      margin: 0;
      font-size: 1.1rem;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .appointment-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      position: relative;
      border-left: 6px solid transparent;
    }

    .appointment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.12);
    }

    .appointment-card.upcoming {
      border-left-color: #28a745;
      background: linear-gradient(135deg, #ffffff 0%, #f8fff8 100%);
    }

    .appointment-card.upcoming.programado {
      border-left-color: #ffc107;
      background: linear-gradient(135deg, #ffffff 0%, #fffef8 100%);
    }

    .appointment-card.upcoming.reagendado {
      border-left-color: #17a2b8;
      background: linear-gradient(135deg, #ffffff 0%, #f8feff 100%);
    }

    .appointment-card.upcoming.reagendado::before {
      content: "📅 REAGENDADO";
      position: absolute;
      top: 15px;
      right: 15px;
      background: #17a2b8;
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 1;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(23, 162, 184, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(23, 162, 184, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(23, 162, 184, 0);
      }
    }

    .appointment-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: var(--pacientes-gradient);
      color: white;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .appointment-date .day {
      font-size: 1.8rem;
      font-weight: 700;
      line-height: 1;
    }

    .appointment-date .month {
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0.9;
    }

    .appointment-info {
      flex: 1;
    }

    .appointment-info h4 {
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .appointment-info p {
      color: #6c757d;
      margin: 0 0 0.25rem 0;
    }

    .appointment-info .location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .appointment-info .time {
      color: var(--pacientes-primary);
      font-weight: 600;
      font-size: 0.95rem;
    }

    .appointment-status {
      display: flex;
      align-items: center;
    }

    .status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status.confirmed {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status.programado {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status.reagendado {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
      font-weight: 700;
      box-shadow: 0 2px 4px rgba(23, 162, 184, 0.2);
      position: relative;
    }

    .status.reagendado::before {
      content: "🔄 ";
      margin-right: 4px;
    }

    .status.confirmado {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status.cancelado {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .appointment-actions {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-confirm:hover {
      background: linear-gradient(135deg, #218838 0%, #1abc9c 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.5);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.5);
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.5);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      margin-bottom: 2rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .patient-dashboard {
        padding: 1rem;
      }
      
      .welcome-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .appointment-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .appointment-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .btn-confirm, .btn-secondary, .btn-danger {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
        min-width: auto;
      }
    }
  `
})
export class PacienteDashboardComponent implements OnInit {
  patientDNI: string = '';
  proximosTurnos: any[] = [];
  isLoadingTurnos = false;

  constructor(
    private router: Router,
    private turnoService: TurnoService
  ) {
    this.patientDNI = localStorage.getItem('patientDNI') || '';
  }

  ngOnInit() {
    this.cargarProximosTurnos();
  }

  cargarProximosTurnos() {
    // Primero intentar obtener el ID del paciente de diferentes formas
    let pacienteId = localStorage.getItem('pacienteId');
    
    if (!pacienteId) {
      // Si no hay pacienteId, intentar obtenerlo de patientData
      const patientDataStr = localStorage.getItem('patientData');
      if (patientDataStr) {
        try {
          const patientData = JSON.parse(patientDataStr);
          pacienteId = patientData.id?.toString();
          // Guardarlo para futuras consultas
          if (pacienteId) {
            localStorage.setItem('pacienteId', pacienteId);
          }
        } catch (e) {
          console.error('Error parsing patient data:', e);
        }
      }
    }

    if (!pacienteId) {
      console.error('No se encontró ID del paciente en localStorage');
      console.log('localStorage contents:', {
        pacienteId: localStorage.getItem('pacienteId'),
        patientData: localStorage.getItem('patientData'),
        userRole: localStorage.getItem('userRole'),
        patientDNI: localStorage.getItem('patientDNI')
      });
      return;
    }

    this.isLoadingTurnos = true;
    console.log('Cargando próximos turnos para paciente ID:', pacienteId);
    
    this.turnoService.getByPacienteId(parseInt(pacienteId)).subscribe({
      next: (dataPackage: DataPackage<Turno[]>) => {
        console.log('Turnos recibidos en dashboard:', dataPackage);
        const turnos = dataPackage.data || [];
        
        // Filtrar solo los próximos turnos (fecha >= hoy y estado confirmado o PRO)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        this.proximosTurnos = turnos
          .filter(turno => {
            const fechaTurno = new Date(turno.fecha);
            fechaTurno.setHours(0, 0, 0, 0);
            return fechaTurno >= hoy && 
                   (turno.estado?.toLowerCase() === 'confirmado' || 
                    turno.estado?.toLowerCase() === 'programado' ||
                    turno.estado?.toLowerCase() === 'reagendado');
          })
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 3) // Mostrar solo los próximos 3
          .map(turno => this.convertirTurnoParaDashboard(turno));
        
        this.isLoadingTurnos = false;
      },
      error: (error) => {
        console.error('Error cargando próximos turnos:', error);
        this.isLoadingTurnos = false;
      }
    });
  }

  private convertirTurnoParaDashboard(turno: Turno): any {
    const fecha = new Date(turno.fecha);
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    return {
      id: turno.id,
      day: fecha.getDate().toString().padStart(2, '0'),
      month: meses[fecha.getMonth()],
      time: turno.horaInicio,
      doctor: `${turno.staffMedicoNombre} ${turno.staffMedicoApellido}`,
      specialty: turno.especialidadStaffMedico,
      location: turno.nombreCentro,
      status: turno.estado?.toLowerCase() || 'programado'
    };
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmado': 'Confirmado',
      'programado': 'Programado',
      'reagendado': 'Reagendado',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  confirmarTurno(turno: any) {
    const confirmMessage = `¿Deseas confirmar este turno?\n\nFecha: ${turno.day}/${turno.month}\nHora: ${turno.time}\nMédico: ${turno.doctor}`;
    
    if (confirm(confirmMessage)) {
      this.turnoService.confirmar(turno.id).subscribe({
        next: (response) => {
          console.log('Turno confirmado exitosamente:', response);
          // Actualizar el estado localmente
          turno.status = 'confirmado';
          // Mostrar mensaje de éxito
          alert('Turno confirmado exitosamente. Te esperamos en la fecha y hora programada.');
          // Recargar próximos turnos para reflejar el cambio
          this.cargarProximosTurnos();
        },
        error: (error) => {
          console.error('Error confirmando el turno:', error);
          alert('No se pudo confirmar el turno. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  reprogramarTurno(turno: any) {
    this.router.navigate(['/paciente-reagendar-turno', turno.id]);
  }

  cancelarTurno(turno: any) {
    const cancelMessage = `¿Estás seguro de que deseas cancelar este turno?\n\nFecha: ${turno.day}/${turno.month}\nHora: ${turno.time}\nMédico: ${turno.doctor}`;
    
    if (confirm(cancelMessage)) {
      this.turnoService.cancelar(turno.id).subscribe({
        next: (response) => {
          console.log('Turno cancelado exitosamente:', response);
          alert('Turno cancelado exitosamente.');
          // Recargar próximos turnos para reflejar el cambio
          this.cargarProximosTurnos();
        },
        error: (error) => {
          console.error('Error cancelando el turno:', error);
          alert('No se pudo cancelar el turno. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('patientDNI');
    this.router.navigate(['/']);
  }

  viewAppointments() {
    this.router.navigate(['/paciente-turnos']);
  }

  scheduleAppointment() {
    this.router.navigate(['/paciente-solicitar-turno']);
  }

  viewAgenda() {
    this.router.navigate(['/paciente-agenda']);
  }

  viewProfile() {
    // Navigate to profile
    console.log('Ver perfil');
  }

  viewHistory() {
    // Navigate to history
    console.log('Ver historial');
  }
}
