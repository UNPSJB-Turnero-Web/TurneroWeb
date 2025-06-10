import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-solicitar-turno',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="solicitar-turno">
      <!-- Header -->
      <div class="page-header">
        <button class="btn btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
        <h1>Solicitar Turno</h1>
      </div>

      <!-- Form Container -->
      <div class="form-container">
        <div class="form-card">
          <h2>Nueva Cita Médica</h2>
          
          <form (ngSubmit)="submitRequest()" #turnoForm="ngForm">
            <!-- Step 1: Specialty Selection -->
            <div class="form-step" *ngIf="currentStep === 1">
              <h3>1. Selecciona la Especialidad</h3>
              <div class="specialty-grid">
                <div 
                  class="specialty-card" 
                  *ngFor="let specialty of especialidades"
                  [class.selected]="selectedSpecialty?.id === specialty.id"
                  (click)="selectSpecialty(specialty)"
                >
                  <i [class]="specialty.icon"></i>
                  <h4>{{ specialty.name }}</h4>
                  <p>{{ specialty.description }}</p>
                </div>
              </div>
            </div>

            <!-- Step 2: Doctor Selection -->
            <div class="form-step" *ngIf="currentStep === 2">
              <h3>2. Selecciona el Médico</h3>
              <div class="doctor-list">
                <div 
                  class="doctor-card" 
                  *ngFor="let doctor of availableDoctors"
                  [class.selected]="selectedDoctor?.id === doctor.id"
                  (click)="selectDoctor(doctor)"
                >
                  <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                  </div>
                  <div class="doctor-info">
                    <h4>{{ doctor.name }}</h4>
                    <p>{{ doctor.specialty }}</p>
                    <span class="rating">
                      <i class="fas fa-star"></i>
                      {{ doctor.rating }}
                    </span>
                  </div>
                  <div class="doctor-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ doctor.location }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Date & Time Selection -->
            <div class="form-step" *ngIf="currentStep === 3">
              <h3>3. Selecciona Fecha y Hora</h3>
              
              <div class="datetime-selection">
                <div class="date-section">
                  <h4>Fecha</h4>
                  <div class="date-grid">
                    <div 
                      class="date-card" 
                      *ngFor="let date of availableDates"
                      [class.selected]="selectedDate === date.value"
                      (click)="selectDate(date.value)"
                    >
                      <span class="day-name">{{ date.dayName }}</span>
                      <span class="day-number">{{ date.dayNumber }}</span>
                      <span class="month">{{ date.month }}</span>
                    </div>
                  </div>
                </div>

                <div class="time-section" *ngIf="selectedDate">
                  <h4>Horario</h4>
                  <div class="time-grid">
                    <button 
                      type="button"
                      class="time-slot" 
                      *ngFor="let time of availableTimes"
                      [class.selected]="selectedTime === time"
                      [disabled]="!time.available"
                      (click)="selectTime(time.value)"
                    >
                      {{ time.value }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Confirmation -->
            <div class="form-step" *ngIf="currentStep === 4">
              <h3>4. Confirmar Datos</h3>
              
              <div class="confirmation-summary">
                <div class="summary-card">
                  <h4>Resumen de la Cita</h4>
                  
                  <div class="summary-item">
                    <strong>Especialidad:</strong>
                    <span>{{ selectedSpecialty?.name }}</span>
                  </div>
                  
                  <div class="summary-item">
                    <strong>Médico:</strong>
                    <span>{{ selectedDoctor?.name }}</span>
                  </div>
                  
                  <div class="summary-item">
                    <strong>Fecha:</strong>
                    <span>{{ getFormattedDate() }}</span>
                  </div>
                  
                  <div class="summary-item">
                    <strong>Hora:</strong>
                    <span>{{ selectedTime }}</span>
                  </div>
                  
                  <div class="summary-item">
                    <strong>Ubicación:</strong>
                    <span>{{ selectedDoctor?.location }}</span>
                  </div>
                </div>

                <div class="additional-info">
                  <h4>Información Adicional</h4>
                  <textarea 
                    [(ngModel)]="additionalInfo"
                    name="additionalInfo"
                    class="form-control"
                    placeholder="Describe brevemente el motivo de la consulta (opcional)"
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="form-navigation">
              <button 
                type="button" 
                class="btn btn-secondary" 
                *ngIf="currentStep > 1"
                (click)="previousStep()"
              >
                <i class="fas fa-arrow-left"></i>
                Anterior
              </button>
              
              <button 
                type="button" 
                class="btn btn-primary" 
                *ngIf="currentStep < 4"
                [disabled]="!canProceed()"
                (click)="nextStep()"
              >
                Siguiente
                <i class="fas fa-arrow-right"></i>
              </button>
              
              <button 
                type="submit" 
                class="btn btn-success" 
                *ngIf="currentStep === 4"
                [disabled]="isSubmitting"
              >
                <i class="fas fa-check" *ngIf="!isSubmitting"></i>
                <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
                {{ isSubmitting ? 'Procesando...' : 'Confirmar Turno' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(currentStep / 4) * 100"></div>
        </div>
        <div class="step-indicators">
          <div 
            class="step-indicator" 
            *ngFor="let step of [1, 2, 3, 4]; let i = index"
            [class.active]="currentStep > i"
            [class.current]="currentStep === step"
          >
            {{ step }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .solicitar-turno {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
      position: relative;
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
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-back {
      background: #f8f9fa;
      color: #6c757d;
      border: 2px solid #e9ecef;
    }

    .btn-primary {
      background: var(--pacientes-gradient);
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-success {
      background: var(--action-add);
      color: white;
    }

    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 6rem;
    }

    .form-card h2 {
      color: #333;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      text-align: center;
    }

    .form-step h3 {
      color: var(--pacientes-primary);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .specialty-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .specialty-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .specialty-card:hover {
      border-color: var(--pacientes-primary);
      transform: translateY(-2px);
    }

    .specialty-card.selected {
      border-color: var(--pacientes-primary);
      background: var(--pacientes-gradient);
      color: white;
    }

    .specialty-card i {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--pacientes-primary);
    }

    .specialty-card.selected i {
      color: white;
    }

    .doctor-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .doctor-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .doctor-card:hover {
      border-color: var(--pacientes-primary);
    }

    .doctor-card.selected {
      border-color: var(--pacientes-primary);
      background: rgba(52, 152, 219, 0.1);
    }

    .doctor-avatar {
      width: 60px;
      height: 60px;
      background: var(--pacientes-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .doctor-info {
      flex: 1;
    }

    .doctor-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .doctor-info p {
      margin: 0 0 0.5rem 0;
      color: #6c757d;
    }

    .rating {
      color: #ffc107;
      font-weight: 600;
    }

    .doctor-location {
      color: #6c757d;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .datetime-selection {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .date-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    .date-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .date-card:hover {
      border-color: var(--pacientes-primary);
    }

    .date-card.selected {
      border-color: var(--pacientes-primary);
      background: var(--pacientes-gradient);
      color: white;
    }

    .time-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .time-slot {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .time-slot:hover:not(:disabled) {
      border-color: var(--pacientes-primary);
    }

    .time-slot.selected {
      border-color: var(--pacientes-primary);
      background: var(--pacientes-gradient);
      color: white;
    }

    .time-slot:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .confirmation-summary {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .summary-card {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--pacientes-primary);
    }

    .form-navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .progress-indicator {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 1rem 2rem;
      border-radius: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      width: 200px;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--pacientes-gradient);
      transition: width 0.3s ease;
    }

    .step-indicators {
      display: flex;
      gap: 1rem;
    }

    .step-indicator {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #6c757d;
      transition: all 0.3s ease;
    }

    .step-indicator.active {
      background: var(--pacientes-gradient);
      color: white;
    }

    .step-indicator.current {
      background: var(--pacientes-primary);
      color: white;
      transform: scale(1.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .solicitar-turno {
        padding: 1rem;
      }
      
      .form-card {
        padding: 1.5rem;
      }
      
      .specialty-grid {
        grid-template-columns: 1fr;
      }
      
      .doctor-card {
        flex-direction: column;
        text-align: center;
      }
      
      .datetime-selection {
        gap: 1rem;
      }
      
      .form-navigation {
        flex-direction: column;
        gap: 1rem;
      }
      
      .progress-indicator {
        position: relative;
        left: auto;
        transform: none;
        margin-top: 2rem;
      }
    }
  `
})
export class PacienteSolicitarTurnoComponent {
  currentStep = 1;
  isSubmitting = false;
  
  selectedSpecialty: any = null;
  selectedDoctor: any = null;
  selectedDate: string = '';
  selectedTime: string = '';
  additionalInfo: string = '';

  especialidades = [
    {
      id: 1,
      name: 'Cardiología',
      description: 'Especialista en corazón y sistema cardiovascular',
      icon: 'fas fa-heartbeat'
    },
    {
      id: 2,
      name: 'Dermatología',
      description: 'Especialista en piel y problemas dermatológicos',
      icon: 'fas fa-user-md'
    },
    {
      id: 3,
      name: 'Traumatología',
      description: 'Especialista en huesos y lesiones musculares',
      icon: 'fas fa-bone'
    },
    {
      id: 4,
      name: 'Pediatría',
      description: 'Especialista en salud infantil',
      icon: 'fas fa-baby'
    }
  ];

  availableDoctors: any[] = [];
  availableDates: any[] = [];
  availableTimes: any[] = [];

  constructor(private router: Router) {
    this.generateAvailableDates();
  }

  selectSpecialty(specialty: any) {
    this.selectedSpecialty = specialty;
    this.loadDoctors();
  }

  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.loadAvailableTimes();
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  loadDoctors() {
    // Mock data - in a real app this would be from a service
    this.availableDoctors = [
      {
        id: 1,
        name: 'Dr. Juan Pérez',
        specialty: this.selectedSpecialty?.name,
        rating: 4.8,
        location: 'Centro Médico Norte'
      },
      {
        id: 2,
        name: 'Dra. María García',
        specialty: this.selectedSpecialty?.name,
        rating: 4.9,
        location: 'Centro Médico Sur'
      }
    ];
  }

  generateAvailableDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dates.push({
        value: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' })
      });
    }
    
    this.availableDates = dates;
  }

  loadAvailableTimes() {
    // Mock available times
    this.availableTimes = [
      { value: '09:00', available: true },
      { value: '09:30', available: true },
      { value: '10:00', available: false },
      { value: '10:30', available: true },
      { value: '11:00', available: true },
      { value: '14:00', available: true },
      { value: '14:30', available: false },
      { value: '15:00', available: true },
      { value: '15:30', available: true },
      { value: '16:00', available: true }
    ];
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedSpecialty;
      case 2: return !!this.selectedDoctor;
      case 3: return !!this.selectedDate && !!this.selectedTime;
      default: return false;
    }
  }

  nextStep() {
    if (this.canProceed() && this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getFormattedDate(): string {
    if (!this.selectedDate) return '';
    const date = new Date(this.selectedDate);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  async submitRequest() {
    this.isSubmitting = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success and redirect
      alert('¡Turno solicitado exitosamente! Te contactaremos para confirmar la cita.');
      this.router.navigate(['/paciente-turnos']);
    } catch (error) {
      alert('Error al solicitar el turno. Por favor intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.router.navigate(['/paciente-dashboard']);
  }
}
