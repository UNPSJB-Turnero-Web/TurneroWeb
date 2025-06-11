import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';
import { AgendaService } from '../agenda/agenda.service';

interface SlotDisponible {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  staffMedicoId: number;
  staffMedicoNombre: string;
  staffMedicoApellido: string;
  especialidadStaffMedico: string;
  consultorioId: number;
  consultorioNombre: string;
  centroId: number;
  nombreCentro: string;
}

@Component({
  selector: 'app-paciente-reagendar-turno',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reagendar-turno-container">
      <!-- Header -->
      <div class="page-header">
        <button class="btn btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
        <h1>
          <i class="fas fa-calendar-check"></i>
          Reagendar Turno
        </h1>
      </div>

      <!-- Current Appointment Info -->
      <div class="current-appointment" *ngIf="currentTurno">
        <h2>
          <i class="fas fa-info-circle"></i>
          Turno Actual
        </h2>
        <div class="appointment-info">
          <div class="info-row">
            <strong>Fecha actual:</strong> {{ formatDate(currentTurno.fecha) }}
          </div>
          <div class="info-row">
            <strong>Hora:</strong> {{ currentTurno.horaInicio }} - {{ currentTurno.horaFin }}
          </div>
          <div class="info-row">
            <strong>Médico:</strong> {{ currentTurno.staffMedicoNombre }} {{ currentTurno.staffMedicoApellido }}
          </div>
          <div class="info-row">
            <strong>Especialidad:</strong> {{ currentTurno.especialidadStaffMedico }}
          </div>
          <div class="info-row">
            <strong>Consultorio:</strong> {{ currentTurno.consultorioNombre }}
          </div>
          <div class="info-row">
            <strong>Centro:</strong> {{ currentTurno.nombreCentro }}
          </div>
        </div>
      </div>

      <!-- Available Slots Section -->
      <div class="available-slots">
        <h2>
          <i class="fas fa-calendar-alt"></i>
          Horarios Disponibles del Mismo Médico
        </h2>
        <p class="slots-subtitle">Selecciona un nuevo horario disponible:</p>
        
        <!-- Loading State -->
        <div class="loading-slots" *ngIf="isLoadingSlots">
          <i class="fas fa-spinner fa-spin"></i>
          Cargando horarios disponibles...
        </div>

        <!-- No Slots Available -->
        <div class="no-slots" *ngIf="!isLoadingSlots && slotsDisponibles.length === 0 && currentTurno">
          <i class="fas fa-calendar-times"></i>
          <h3>No hay horarios disponibles</h3>
          <p>No se encontraron horarios disponibles para este médico en las próximas 4 semanas.</p>
          <p class="help-text">Puedes intentar contactar directamente con el centro médico para más opciones.</p>
        </div>

        <!-- Slots Grid -->
        <div class="slots-grid" *ngIf="!isLoadingSlots && slotsDisponibles.length > 0">
          <div 
            *ngFor="let slot of slotsDisponibles" 
            class="slot-card"
            [class.selected]="slotSeleccionado?.id === slot.id"
            (click)="seleccionarSlot(slot)"
          >
            <div class="slot-header">
              <div class="slot-date">
                <i class="fas fa-calendar"></i>
                {{ formatDateShort(slot.fecha) }}
              </div>
              <div class="slot-day">
                {{ formatDayOfWeek(slot.fecha) }}
              </div>
            </div>
            
            <div class="slot-time">
              <i class="fas fa-clock"></i>
              {{ slot.horaInicio }} - {{ slot.horaFin }}
            </div>
            
            <div class="slot-location">
              <div class="location-line">
                <i class="fas fa-door-open"></i>
                {{ slot.consultorioNombre }}
              </div>
              <div class="location-line">
                <i class="fas fa-map-marker-alt"></i>
                {{ slot.nombreCentro }}
              </div>
            </div>

            <div class="slot-check" *ngIf="slotSeleccionado?.id === slot.id">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Section -->
      <div class="confirmation-section" *ngIf="slotSeleccionado">
        <h2>
          <i class="fas fa-check-circle"></i>
          Confirmar Reagendamiento
        </h2>
        
        <div class="confirmation-details">
          <div class="change-summary">
            <div class="change-from">
              <h4>Cambiar de:</h4>
              <div class="appointment-summary old">
                <i class="fas fa-calendar-minus"></i>
                <div>
                  <strong>{{ formatDate(currentTurno?.fecha || '') }}</strong><br>
                  <span>{{ currentTurno?.horaInicio }} - {{ currentTurno?.horaFin }}</span>
                </div>
              </div>
            </div>
            
            <div class="change-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            
            <div class="change-to">
              <h4>Cambiar a:</h4>
              <div class="appointment-summary new">
                <i class="fas fa-calendar-plus"></i>
                <div>
                  <strong>{{ formatDate(slotSeleccionado.fecha) }}</strong><br>
                  <span>{{ slotSeleccionado.horaInicio }} - {{ slotSeleccionado.horaFin }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-cancel"
            (click)="cancelarSeleccion()"
            [disabled]="isProcessing"
          >
            <i class="fas fa-times"></i>
            Cancelar Selección
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            [disabled]="isProcessing"
            (click)="confirmarReagendamiento()"
          >
            <i class="fas fa-calendar-check"></i>
            Confirmar Reagendamiento
          </button>
        </div>
      </div>

      <!-- Processing and Error States -->
      <div class="loading-message" *ngIf="isProcessing">
        <i class="fas fa-spinner fa-spin"></i>
        Procesando reagendamiento...
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
        <button class="btn-retry" (click)="reintentar()" *ngIf="currentTurno">
          <i class="fas fa-redo"></i>
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: `
    .reagendar-turno-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .reagendar-turno-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .page-header h1 {
      color: white;
      font-size: 2.8rem;
      font-weight: 800;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-shadow: 0 4px 12px rgba(0,0,0,0.3);
      background: linear-gradient(45deg, #fff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .btn-back:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    }

    .btn-cancel:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
    }

    .current-appointment {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      border-left: 6px solid #ff6b6b;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .current-appointment::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(30px, -30px);
    }

    .current-appointment h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .appointment-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .info-row {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }

    .info-row:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    }

    .info-row strong {
      color: #2c3e50;
      font-weight: 700;
      margin-right: 0.5rem;
      font-size: 0.95rem;
    }

    .available-slots {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .available-slots::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 80px;
      height: 80px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(-20px, -20px);
    }

    .available-slots h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .slots-subtitle {
      color: #6c757d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      position: relative;
      z-index: 1;
    }

    .loading-slots {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .loading-slots i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
    }

    .no-slots {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-slots i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .no-slots h3 {
      margin-bottom: 1rem;
      color: #495057;
    }

    .help-text {
      font-style: italic;
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .slot-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1.8rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .slot-card::before {
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

    .slot-card:hover {
      border-color: #667eea;
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.25);
    }

    .slot-card:hover::before {
      opacity: 0.05;
    }

    .slot-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 20px 50px rgba(102, 126, 234, 0.4);
    }

    .slot-card.selected::before {
      opacity: 0;
    }

    .slot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .slot-date {
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .slot-day {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: capitalize;
    }

    .slot-time {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .slot-location {
      opacity: 0.8;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
      font-size: 0.9rem;
    }

    .slot-check {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .slot-card.selected .slot-location,
    .slot-card.selected .slot-day {
      opacity: 1;
    }

    .confirmation-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      border-left: 6px solid #28a745;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .confirmation-section::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 90px;
      height: 90px;
      background: linear-gradient(45deg, #28a745, #20c997);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(30px, -30px);
    }

    .confirmation-section h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .change-summary {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 2rem;
      align-items: center;
      margin-bottom: 2rem;
    }

    .change-from h4, .change-to h4 {
      margin-bottom: 1rem;
      color: #6c757d;
      font-size: 1rem;
    }

    .appointment-summary {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 10px;
    }

    .appointment-summary.old {
      background: #fff3cd;
      border: 2px solid #ffeaa7;
    }

    .appointment-summary.new {
      background: #d4edda;
      border: 2px solid #28a745;
    }

    .appointment-summary i {
      font-size: 1.5rem;
    }

    .change-arrow {
      font-size: 1.5rem;
      color: #667eea;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .loading-message, .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .loading-message {
      background: #d1ecf1;
      color: #0c5460;
      justify-content: center;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      justify-content: space-between;
    }

    .btn-retry {
      background: transparent;
      border: 1px solid currentColor;
      color: inherit;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-retry:hover {
      background: currentColor;
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .reagendar-turno-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .appointment-info {
        grid-template-columns: 1fr;
      }

      .slots-grid {
        grid-template-columns: 1fr;
      }

      .change-summary {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .change-arrow {
        transform: rotate(90deg);
        justify-self: center;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `
})
export class PacienteReagendarTurnoComponent implements OnInit {
  turnoId: number = 0;
  currentTurno: Turno | null = null;
  slotsDisponibles: SlotDisponible[] = [];
  slotSeleccionado: SlotDisponible | null = null;
  isProcessing: boolean = false;
  isLoadingSlots: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private agendaService: AgendaService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.turnoId = +params['id'];
      this.cargarTurnoActual();
    });
  }

  cargarTurnoActual() {
    this.turnoService.get(this.turnoId).subscribe({
      next: (dataPackage: DataPackage<Turno>) => {
        this.currentTurno = dataPackage.data;
        console.log('Turno cargado para reagendar:', this.currentTurno);
        
        // Cargar slots disponibles del mismo médico
        if (this.currentTurno?.staffMedicoId) {
          this.cargarSlotsDisponibles(this.currentTurno.staffMedicoId);
        }
      },
      error: (error) => {
        console.error('Error cargando turno:', error);
        this.errorMessage = 'No se pudo cargar la información del turno.';
      }
    });
  }

  cargarSlotsDisponibles(staffMedicoId: number) {
    this.isLoadingSlots = true;
    this.errorMessage = '';

    this.agendaService.obtenerSlotsDisponiblesPorMedico(staffMedicoId, 4).subscribe({
      next: (response: any) => {
        // El backend devuelve un Response object con data
        const slots = response.data || response;
        
        this.slotsDisponibles = slots.filter((slot: any) => {
          // Filtrar slots que no sean el turno actual
          if (!this.currentTurno) return true;
          
          const currentDateTime = new Date(`${this.currentTurno.fecha}T${this.currentTurno.horaInicio}`);
          const slotDateTime = new Date(`${slot.fecha}T${slot.horaInicio}`);
          return slotDateTime.getTime() !== currentDateTime.getTime();
        });
        
        console.log('Slots disponibles cargados:', this.slotsDisponibles);
        this.isLoadingSlots = false;
      },
      error: (error) => {
        console.error('Error cargando slots disponibles:', error);
        this.errorMessage = 'No se pudieron cargar los horarios disponibles.';
        this.isLoadingSlots = false;
      }
    });
  }

  seleccionarSlot(slot: SlotDisponible) {
    this.slotSeleccionado = slot;
    console.log('Slot seleccionado:', slot);
  }

  cancelarSeleccion() {
    this.slotSeleccionado = null;
  }

  confirmarReagendamiento() {
    if (!this.currentTurno || !this.slotSeleccionado) return;

    this.isProcessing = true;
    this.errorMessage = '';

    const nuevosDatos = {
      fecha: this.slotSeleccionado.fecha,
      horaInicio: this.slotSeleccionado.horaInicio,
      horaFin: this.slotSeleccionado.horaFin,
      pacienteId: this.currentTurno.pacienteId,
      staffMedicoId: this.slotSeleccionado.staffMedicoId,
      consultorioId: this.slotSeleccionado.consultorioId
    };

    this.turnoService.reagendar(this.turnoId, nuevosDatos).subscribe({
      next: (response) => {
        console.log('Turno reagendado exitosamente:', response);
        this.isProcessing = false;
        alert(`¡Turno reagendado exitosamente!\n\nNueva fecha: ${this.formatDate(this.slotSeleccionado!.fecha)}\nNueva hora: ${this.slotSeleccionado!.horaInicio} - ${this.slotSeleccionado!.horaFin}`);
        this.router.navigate(['/paciente-turnos']);
      },
      error: (error) => {
        console.error('Error reagendando turno:', error);
        this.isProcessing = false;
        
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'No se pudo reagendar el turno. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  reintentar() {
    this.errorMessage = '';
    if (this.currentTurno?.staffMedicoId) {
      this.cargarSlotsDisponibles(this.currentTurno.staffMedicoId);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  formatDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long'
    });
  }

  goBack() {
    this.router.navigate(['/paciente-turnos']);
  }
}
