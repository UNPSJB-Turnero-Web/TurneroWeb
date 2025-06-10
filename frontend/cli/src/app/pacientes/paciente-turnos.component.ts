import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-turnos',
  imports: [CommonModule],
  template: `
    <div class="paciente-turnos">
      <!-- Header -->
      <div class="page-header">
        <button class="btn btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
        <h1>Mis Turnos</h1>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'upcoming'"
            (click)="setFilter('upcoming')"
          >
            Próximos
          </button>
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'past'"
            (click)="setFilter('past')"
          >
            Pasados
          </button>
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'all'"
            (click)="setFilter('all')"
          >
            Todos
          </button>
        </div>
      </div>

      <!-- Appointments List -->
      <div class="appointments-container">
        <div class="appointment-card" *ngFor="let turno of filteredTurnos" [class]="turno.status">
          <div class="appointment-header">
            <div class="appointment-date">
              <span class="day">{{ turno.day }}</span>
              <span class="month">{{ turno.month }}</span>
            </div>
            <div class="appointment-time">
              <i class="fas fa-clock"></i>
              {{ turno.time }}
            </div>
          </div>
          
          <div class="appointment-body">
            <div class="doctor-info">
              <h3>{{ turno.doctor }}</h3>
              <p class="specialty">{{ turno.specialty }}</p>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i>
                {{ turno.location }}
              </p>
            </div>
            
            <div class="appointment-status">
              <span class="status-badge" [class]="turno.status">
                {{ getStatusText(turno.status) }}
              </span>
            </div>
          </div>
          
          <div class="appointment-actions" *ngIf="turno.status !== 'completed' && turno.status !== 'cancelled'">
            <button class="btn btn-secondary" (click)="reschedule(turno)">
              <i class="fas fa-calendar-alt"></i>
              Reprogramar
            </button>
            <button class="btn btn-danger" (click)="cancel(turno)">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredTurnos.length === 0">
          <i class="fas fa-calendar-times"></i>
          <h3>No hay turnos {{ getEmptyStateText() }}</h3>
          <p>{{ getEmptyStateDescription() }}</p>
          <button class="btn btn-primary" (click)="scheduleNew()">
            <i class="fas fa-plus"></i>
            Solicitar Turno
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .paciente-turnos {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      color: var(--pacientes-primary);
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
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
      text-decoration: none;
    }

    .btn-back {
      background: #f8f9fa;
      color: #6c757d;
      border: 2px solid #e9ecef;
    }

    .btn-back:hover {
      background: #e9ecef;
      color: #495057;
    }

    .btn-primary {
      background: var(--pacientes-gradient);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--pacientes-shadow);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: var(--action-delete);
      color: white;
    }

    .btn-danger:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px var(--action-delete-shadow);
    }

    .filters-section {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #6c757d;
    }

    .filter-tab:hover {
      border-color: var(--pacientes-primary);
      color: var(--pacientes-primary);
    }

    .filter-tab.active {
      background: var(--pacientes-gradient);
      border-color: var(--pacientes-primary);
      color: white;
    }

    .appointments-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .appointment-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }

    .appointment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.12);
    }

    .appointment-card.confirmed {
      border-left-color: #28a745;
    }

    .appointment-card.pending {
      border-left-color: #ffc107;
    }

    .appointment-card.completed {
      border-left-color: #6c757d;
    }

    .appointment-card.cancelled {
      border-left-color: #dc3545;
      opacity: 0.7;
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
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

    .appointment-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--pacientes-primary);
      font-weight: 600;
      font-size: 1.1rem;
    }

    .appointment-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .doctor-info h3 {
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .doctor-info .specialty {
      color: var(--pacientes-primary);
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .doctor-info .location {
      color: #6c757d;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.confirmed {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.completed {
      background: #e2e3e5;
      color: #383d41;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .appointment-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .appointment-actions .btn {
      flex: 1;
      justify-content: center;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
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
      color: #495057;
    }

    .empty-state p {
      margin-bottom: 2rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .paciente-turnos {
        padding: 1rem;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .appointment-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .appointment-body {
        flex-direction: column;
        gap: 1rem;
      }
      
      .appointment-actions {
        flex-direction: column;
      }

      .filter-tabs {
        flex-wrap: wrap;
      }
    }
  `
})
export class PacienteTurnosComponent {
  currentFilter: 'upcoming' | 'past' | 'all' = 'upcoming';
  patientDNI: string = '';

  // Mock data - in a real app this would come from a service
  turnos = [
    {
      id: 1,
      day: '15',
      month: 'JUN',
      time: '10:30 AM',
      doctor: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      location: 'Centro Médico Norte - Consultorio 3',
      status: 'confirmed',
      date: new Date('2025-06-15')
    },
    {
      id: 2,
      day: '22',
      month: 'JUN',
      time: '3:00 PM',
      doctor: 'Dra. María García',
      specialty: 'Dermatología',
      location: 'Centro Médico Sur - Consultorio 1',
      status: 'pending',
      date: new Date('2025-06-22')
    },
    {
      id: 3,
      day: '05',
      month: 'JUN',
      time: '9:00 AM',
      doctor: 'Dr. Carlos López',
      specialty: 'Traumatología',
      location: 'Centro Médico Centro - Consultorio 5',
      status: 'completed',
      date: new Date('2025-06-05')
    }
  ];

  constructor(private router: Router) {
    this.patientDNI = localStorage.getItem('patientDNI') || '';
  }

  get filteredTurnos() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.currentFilter) {
      case 'upcoming':
        return this.turnos.filter(turno => 
          turno.date >= today && turno.status !== 'completed' && turno.status !== 'cancelled'
        );
      case 'past':
        return this.turnos.filter(turno => 
          turno.date < today || turno.status === 'completed'
        );
      case 'all':
        return this.turnos;
      default:
        return this.turnos;
    }
  }

  setFilter(filter: 'upcoming' | 'past' | 'all') {
    this.currentFilter = filter;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'Confirmado',
      'pending': 'Pendiente',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getEmptyStateText(): string {
    switch (this.currentFilter) {
      case 'upcoming': return 'próximos';
      case 'past': return 'pasados';
      case 'all': return 'registrados';
      default: return '';
    }
  }

  getEmptyStateDescription(): string {
    switch (this.currentFilter) {
      case 'upcoming': return '¡Programa tu próxima cita médica!';
      case 'past': return 'Aún no has tenido consultas médicas.';
      case 'all': return '¡Programa tu primera cita médica!';
      default: return '';
    }
  }

  goBack() {
    this.router.navigate(['/paciente-dashboard']);
  }

  scheduleNew() {
    this.router.navigate(['/paciente-solicitar-turno']);
  }

  reschedule(turno: any) {
    console.log('Reprogramar turno:', turno);
    // Navigate to reschedule component
  }

  cancel(turno: any) {
    if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      turno.status = 'cancelled';
      console.log('Turno cancelado:', turno);
    }
  }
}
