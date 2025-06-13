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
            <button class="btn btn-header-solid btn-header-danger" (click)="logout()">
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
          <button class="btn btn-header-solid" (click)="scheduleAppointment()">
            <i class="fas fa-plus"></i>
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
      position: relative;
      overflow: hidden;
    }

    .patient-dashboard::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .dashboard-header {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 15px 50px rgba(0,0,0,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .dashboard-header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 150px;
      height: 150px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      opacity: 0.05;
      transform: translate(50px, -50px);
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .welcome-section h1 {
      color: #2c3e50;
      font-size: 3rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .welcome-section p {
      color: #6c757d;
      font-size: 1.2rem;
      font-weight: 500;
      margin: 0.5rem 0 0 0;
    }
    

    .user-actions {
      display: flex;
      gap: 1rem;
      position: relative;
      z-index: 1;
    }

    .btn {
      padding: 0.8rem 1.8rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    .btn-logout {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
    }

    .btn-logout:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(255, 107, 107, 0.5);
      background: linear-gradient(135deg, #ee5a24 0%, #d63031 100%);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }
    

    .quick-actions {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 15px 50px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .quick-actions::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 120px;
      height: 120px;
      background: linear-gradient(45deg, #f093fb, #f5576c);
      border-radius: 50%;
      opacity: 0.05;
      transform: translate(-40px, -40px);
    }

    .quick-actions h2 {
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 1;
    }

    .action-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 2.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      border: 2px solid rgba(102, 126, 234, 0.1);
      position: relative;
      overflow: hidden;
    }

    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .action-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .action-card:hover::before {
      opacity: 0.05;
    }

    .action-card i {
      font-size: 3.5rem;
      color: #667eea;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .action-card:hover i {
      transform: scale(1.1);
      color: #5a6fd8;
    }

    .action-card h3 {
      color: #2c3e50;
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 0.8rem 0;
      position: relative;
      z-index: 1;
    }

    .action-card p {
      color: #6c757d;
      margin: 0;
      line-height: 1.6;
      font-size: 1rem;
      position: relative;
      z-index: 1;
    }
    .recent-appointments {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 15px 50px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .recent-appointments::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #a8edea, #fed6e3);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(30px, -30px);
    }

    .recent-appointments h2 {
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
      position: relative;
      z-index: 1;
    }

    .loading-state i {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      color: #667eea;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .appointment-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      border-left: 6px solid transparent;
      overflow: hidden;
    }

    .appointment-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
      pointer-events: none;
    }

    .appointment-card:hover {
      transform: translateY(-5px) scale(1.01);
      box-shadow: 0 15px 50px rgba(0,0,0,0.15);
    }

    .appointment-card.upcoming {
      border-left-color: #28a745;
      border-left-width: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 255, 248, 0.95) 100%);
    }

    .appointment-card.upcoming.programado {
      border-left-color: #ffc107;
      border-left-width: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 254, 248, 0.95) 100%);
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
      color: #667eea;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .appointment-status {
      display: flex;
      align-items: center;
    }

    .status {
      padding: 0.6rem 1.2rem;
      border-radius: 25px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      overflow: hidden;
    }

    .status::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .status:hover::before {
      left: 100%;
    }

    .status.confirmado, .status.confirmed {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
      border: none;
    }

    .status.programado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
      border: none;
    }

    .status.reagendado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
      border: none;
      position: relative;
    }

    .status.reagendado::after {
      content: "🔄";
      margin-left: 6px;
    }

    .status.cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
      border: none;
    }

    .status.pending {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
      border: none;
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
            // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
            const [year, month, day] = turno.fecha.split('-').map(Number);
            const fechaTurno = new Date(year, month - 1, day); // month es 0-indexed
            fechaTurno.setHours(0, 0, 0, 0);
            return fechaTurno >= hoy && 
                   (turno.estado?.toLowerCase() === 'confirmado' || 
                    turno.estado?.toLowerCase() === 'programado' ||
                    turno.estado?.toLowerCase() === 'reagendado');
          })
          .sort((a, b) => {
            // Parsear fechas sin conversión a UTC para evitar problemas de zona horaria
            const [yearA, monthA, dayA] = a.fecha.split('-').map(Number);
            const [yearB, monthB, dayB] = b.fecha.split('-').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA.getTime() - dateB.getTime();
          })
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
