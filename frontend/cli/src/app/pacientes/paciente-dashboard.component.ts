import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
          
          <div class="action-card" (click)="scheduleAppointment()">
            <i class="fas fa-plus-circle"></i>
            <h3>Solicitar Turno</h3>
            <p>Reservar una nueva cita médica</p>
          </div>
          
          <div class="action-card" (click)="viewAgenda()">
            <i class="fas fa-calendar-alt"></i>
            <h3>Agenda Médica</h3>
            <p>Ver horarios disponibles por especialidad</p>
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
        <div class="appointments-list">
          <div class="appointment-card upcoming">
            <div class="appointment-date">
              <span class="day">15</span>
              <span class="month">JUN</span>
            </div>
            <div class="appointment-info">
              <h4>Dr. Juan Pérez</h4>
              <p>Cardiología</p>
              <span class="time">10:30 AM</span>
            </div>
            <div class="appointment-status">
              <span class="status confirmed">Confirmado</span>
            </div>
          </div>
          
          <div class="appointment-card">
            <div class="appointment-date">
              <span class="day">22</span>
              <span class="month">JUN</span>
            </div>
            <div class="appointment-info">
              <h4>Dra. María García</h4>
              <p>Dermatología</p>
              <span class="time">3:00 PM</span>
            </div>
            <div class="appointment-status">
              <span class="status pending">Pendiente</span>
            </div>
          </div>
        </div>
        
        <div class="empty-state" *ngIf="false">
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
    }

    .appointment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.12);
    }

    .appointment-card.upcoming {
      border-left: 4px solid var(--pacientes-primary);
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
    }

    .status.pending {
      background: #fff3cd;
      color: #856404;
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
    }
  `
})
export class PacienteDashboardComponent {
  patientDNI: string = '';

  constructor(private router: Router) {
    this.patientDNI = localStorage.getItem('patientDNI') || '';
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
