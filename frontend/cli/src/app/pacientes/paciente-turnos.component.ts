import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-paciente-turnos',
  imports: [CommonModule],
  template: `
    <div class="paciente-turnos">
      <!-- Header -->
      <div class="page-header">
        <button class="btn btn-header-glass" (click)="goBack()">
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
        <!-- Loading state -->
        <div class="loading-state" *ngIf="isLoadingTurnos">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando turnos...</p>
        </div>

        <!-- Appointments -->
        <div class="appointment-card" 
             *ngFor="let turno of filteredTurnos" 
             [class]="turno.status"
             [hidden]="isLoadingTurnos">
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
          
          <div class="appointment-actions" *ngIf="turno.status !== 'cancelado'">
            <button class="btn btn-success" 
                    *ngIf="turno.status === 'programado' || turno.status === 'reagendado'"
                    (click)="confirm(turno)">
              <i class="fas fa-check"></i>
              Confirmar
            </button>
            <button class="btn btn-secondary" 
                    *ngIf="turno.status === 'programado' || turno.status === 'confirmado' || turno.status === 'reagendado'"
                    (click)="reschedule(turno)">
              <i class="fas fa-calendar-alt"></i>
              Reprogramar
            </button>
            <button class="btn btn-danger" 
                    *ngIf="turno.status === 'programado' || turno.status === 'confirmado' || turno.status === 'reagendado'"
                    (click)="cancel(turno)">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!isLoadingTurnos && filteredTurnos.length === 0">
          <i class="fas fa-calendar-times"></i>
          <h3>No hay turnos {{ getEmptyStateText() }}</h3>
          <p>{{ getEmptyStateDescription() }}</p>
          <button class="btn btn-header-solid" (click)="scheduleNew()">
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
      position: relative;
      overflow: hidden;
    }

    .paciente-turnos::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="particles" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="white" opacity="0.05"/><circle cx="5" cy="5" r="0.4" fill="white" opacity="0.03"/><circle cx="15" cy="15" r="0.6" fill="white" opacity="0.04"/></pattern></defs><rect width="100" height="100" fill="url(%23particles)"/></svg>');
      pointer-events: none;
      z-index: 0;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      border-radius: 25px;
      backdrop-filter: blur(15px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .page-header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 120px;
      height: 120px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      opacity: 0.08;
      transform: translate(40px, -40px);
    }

    .page-header h1 {
      color: #f1f1f1;
      font-size: 2.8rem;
      font-weight: 800;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(45deg, #f1f1f1, #f1f1f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 4px 8px rgba(0,0,0,0.1);
      position: relative;
      z-index: 1;
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


    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #218838 0%, #1abc9c 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
    }

    .filters-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 15px 50px rgba(0,0,0,0.1);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .filters-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #f093fb, #f5576c);
      border-radius: 50%;
      opacity: 0.06;
      transform: translate(-30px, -30px);
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      background: rgba(248, 249, 250, 0.8);
      padding: 0.5rem;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 1;
    }

    .filter-tab {
      padding: 0.8rem 1.8rem;
      border: none;
      background: transparent;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      color: #6c757d;
      position: relative;
      overflow: hidden;
    }

    .filter-tab::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .filter-tab:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .filter-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      transform: translateY(-3px) scale(1.05);
    }

    .filter-tab.active::before {
      opacity: 1;
    }

    .appointments-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.1);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
    }

    .loading-state i {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      color: #667eea;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-state p {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .appointment-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      padding: 2rem;
      box-shadow: 0 15px 50px rgba(0,0,0,0.12);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      border-left: 6px solid transparent;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .appointment-card::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(30px, -30px);
    }

    .appointment-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 80px rgba(0,0,0,0.18);
    }

    .appointment-card.confirmado {
      border-left-color: #28a745;
      border-left-width: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 255, 248, 0.95) 100%);
    }

    .appointment-card.programado {
      border-left-color: #ffc107;
      border-left-width: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 254, 248, 0.95) 100%);
    }

    .appointment-card.reagendado {
      border-left-color: #17a2b8;
      border-left-width: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 254, 255, 0.95) 100%);
      position: relative;
    }


    @keyframes reagendadoPulse {
      0% {
        box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
      }
      50% {
        box-shadow: 0 4px 25px rgba(23, 162, 184, 0.6);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
      }
    }

    .appointment-card.completed {
      border-left-color: #6c757d;
      border-left-width: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.95) 100%);
    }

    .appointment-card.cancelado {
      border-left-color: #dc3545;
      border-left-width: 8px;
      opacity: 0.7;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 248, 248, 0.95) 100%);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
      color: #667eea;
      font-weight: 600;
      font-size: 1.1rem;
      background: rgba(102, 126, 234, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
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
      color: #667eea;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      background: rgba(102, 126, 234, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      display: inline-block;
    }

    .doctor-info .location {
      color: #6c757d;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-badge {
      padding: 0.6rem 1.2rem;
      border-radius: 25px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      overflow: hidden;
    }

    .status-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .status-badge:hover::before {
      left: 100%;
    }

    .status-badge.confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
      border: none;
    }

    .status-badge.programado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
      border: none;
    }

    .status-badge.reagendado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
      border: none;
      position: relative;
    }

    .status-badge.reagendado::after {
      content: "🔄";
      margin-left: 6px;
    }

    .status-badge.cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
      border: none;
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
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.1);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .empty-state::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      opacity: 0.05;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.6;
      color: #667eea;
      position: relative;
      z-index: 1;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #495057;
      position: relative;
      z-index: 1;
    }

    .empty-state p {
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
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
export class PacienteTurnosComponent implements OnInit {
  currentFilter: 'upcoming' | 'past' | 'all' = 'upcoming';
  patientDNI: string = '';
  turnos: any[] = [];
  isLoadingTurnos = false;

  constructor(
    private router: Router,
    private turnoService: TurnoService
  ) {
    this.patientDNI = localStorage.getItem('patientDNI') || '';
  }

  ngOnInit() {
    this.cargarTurnosPaciente();
  }

  cargarTurnosPaciente() {
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
    console.log('Cargando turnos del paciente ID:', pacienteId);
    
    this.turnoService.getByPacienteId(parseInt(pacienteId)).subscribe({
      next: (dataPackage: DataPackage<Turno[]>) => {
        console.log('Turnos recibidos en mis turnos:', dataPackage);
        const turnosData = dataPackage.data || [];
        this.turnos = turnosData.map(turno => this.convertirTurnoParaLista(turno));
        this.isLoadingTurnos = false;
      },
      error: (error) => {
        console.error('Error cargando turnos del paciente:', error);
        this.isLoadingTurnos = false;
      }
    });
  }

  private convertirTurnoParaLista(turno: Turno): any {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = turno.fecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // month es 0-indexed
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    return {
      id: turno.id,
      day: fecha.getDate().toString().padStart(2, '0'),
      month: meses[fecha.getMonth()],
      time: turno.horaInicio,
      doctor: `${turno.staffMedicoNombre} ${turno.staffMedicoApellido}`,
      specialty: turno.especialidadStaffMedico,
      location: `${turno.nombreCentro} - ${turno.consultorioNombre}`,
      status: turno.estado?.toLowerCase() || 'programado',
      date: fecha
    };
  }

  get filteredTurnos() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.currentFilter) {
      case 'upcoming':
        return this.turnos.filter(turno => 
          turno.date >= today && 
          (turno.status === 'programado' || turno.status === 'confirmado' || turno.status === 'reagendado')
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
      'confirmado': 'Confirmado',
      'programado': 'Programado',
      'reagendado': 'Reagendado',
      'cancelado': 'Cancelado'
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
    this.router.navigate(['/paciente-reagendar-turno', turno.id]);
  }

  confirm(turno: any) {
    const confirmMessage = `¿Deseas confirmar este turno?\n\nFecha: ${turno.day}/${turno.month}\nHora: ${turno.time}\nMédico: ${turno.doctor}`;
    
    if (confirm(confirmMessage)) {
      this.turnoService.confirmar(turno.id).subscribe({
        next: (response) => {
          console.log('Turno confirmado exitosamente:', response);
          // Actualizar el estado localmente
          turno.status = 'confirmado';
          // Mostrar mensaje de éxito
          alert('Turno confirmado exitosamente. Te esperamos en la fecha y hora programada.');
          // Recargar la lista de turnos para reflejar cambios
          this.cargarTurnosPaciente();
        },
        error: (error) => {
          console.error('Error confirmando el turno:', error);
          alert('No se pudo confirmar el turno. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  cancel(turno: any) {
    const confirmMessage = `¿Estás seguro de que deseas cancelar este turno?\n\nFecha: ${turno.day}/${turno.month}\nHora: ${turno.time}\nMédico: ${turno.doctor}`;
    
    if (confirm(confirmMessage)) {
      this.turnoService.cancelar(turno.id).subscribe({
        next: (response) => {
          console.log('Turno cancelado exitosamente:', response);
          // Actualizar el estado localmente
          turno.status = 'cancelado';
          // Mostrar mensaje de éxito
          alert('Turno cancelado exitosamente. El horario quedará disponible para otros pacientes.');
          // Recargar la lista de turnos para reflejar cambios
          this.cargarTurnosPaciente();
        },
        error: (error) => {
          console.error('Error cancelando el turno:', error);
          alert('No se pudo cancelar el turno. Por favor, intenta nuevamente.');
        }
      });
    }
  }
}
