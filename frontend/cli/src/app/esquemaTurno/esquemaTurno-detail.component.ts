import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EsquemaTurnoService } from './esquemaTurno.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { EsquemaTurno } from './esquemaTurno';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { Consultorio } from '../consultorios/consultorio';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-esquema-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="esquema">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="header-text">
              <h1>{{ esNuevo ? 'Nuevo Esquema de Turno' : 'Esquema #' + esquema.id }}</h1>
              <p>{{ esNuevo ? 'Configure un nuevo esquema de turnos' : 'Gestione el esquema de turnos' }}</p>
            </div>
          </div>
        </div>

        <!-- BODY DEL CARD -->
        <div class="card-body">
          <!-- MODO VISTA -->
          <div *ngIf="!modoEdicion">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">👨‍⚕️</span>
                  Disponibilidad Médica
                </div>
                <div class="info-value">
                  {{ getDisponibilidadLabelForCurrent() }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">🏥</span>
                  Centro de Atención
                </div>
                <div class="info-value">
                  {{ getCentroNombre() }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);">🚪</span>
                  Consultorio
                </div>
                <div class="info-value">
                  {{ getConsultorioNombre() }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">⏱️</span>
                  Intervalo
                </div>
                <div class="info-value">
                  {{ esquema.intervalo }} minutos
                </div>
              </div>

              <div class="info-item full-width">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);">🕐</span>
                  Horarios de Disponibilidad
                </div>
                <div class="horarios-disponibles">
                  <div *ngFor="let horario of esquema.horariosDisponibilidad" class="horario-card">
                    <span class="dia-label">{{ horario.dia }}</span>
                    <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                  </div>
                  <div *ngIf="!esquema.horariosDisponibilidad || esquema.horariosDisponibilidad.length === 0" 
                       class="no-horarios">
                    Sin horarios configurados
                  </div>
                </div>
              </div>

              <div class="info-item full-width" *ngIf="esquema.horarios && esquema.horarios.length > 0">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">📅</span>
                  Horarios del Esquema
                </div>
                <div class="horarios-esquema">
                  <div *ngFor="let horario of esquema.horarios" class="horario-card">
                    <span class="dia-label">{{ horario.dia }}</span>
                    <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN -->
          <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
            <div class="row">
              <!-- Disponibilidad Médica -->
              <div class="col-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">👨‍⚕️</span>
                    Disponibilidad Médica
                  </label>
                  <select
                    [(ngModel)]="selectedDisponibilidadId"
                    name="disponibilidadMedicoId"
                    class="form-control form-control-modern"
                    required
                    (change)="onDisponibilidadChange()"
                  >
                    <option [ngValue]="null">Seleccione una disponibilidad...</option>
                    <option *ngFor="let disp of disponibilidadesMedico" [ngValue]="disp.id">
                      {{ getDisponibilidadLabel(disp) }}
                    </option>
                  </select>
                  <div class="form-help">
                    Seleccione la disponibilidad médica base para el esquema.
                  </div>
                </div>
              </div>

              <!-- Centro de Atención (readonly) -->
              <div class="col-md-6" *ngIf="esquema.centroId">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">🏥</span>
                    Centro de Atención
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-modern"
                    [value]="getCentroNombre()"
                    readonly
                  />
                  <div class="form-help">
                    Centro asignado automáticamente según el médico seleccionado.
                  </div>
                </div>
              </div>

              <!-- Consultorio -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);">🚪</span>
                    Consultorio
                  </label>
                  <select
                    [(ngModel)]="esquema.consultorioId"
                    name="consultorioId"
                    class="form-control form-control-modern"
                    required
                  >
                    <option [ngValue]="null">Seleccione un consultorio...</option>
                    <option *ngFor="let consultorio of consultorios" [value]="consultorio.id">
                      {{ consultorio.nombre }}
                    </option>
                  </select>
                  <div class="form-help">
                    Consultorio donde se realizarán las consultas.
                  </div>
                </div>
              </div>

              <!-- Intervalo -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">⏱️</span>
                    Intervalo (minutos)
                  </label>
                  <input
                    type="number"
                    class="form-control form-control-modern"
                    [(ngModel)]="esquema.intervalo"
                    name="intervalo"
                    required
                    min="1"
                    placeholder="15"
                  />
                  <div class="form-help">
                    Duración de cada turno en minutos.
                  </div>
                </div>
              </div>

              <!-- Horarios de Disponibilidad (readonly) -->
              <div class="col-12" *ngIf="esquema.horariosDisponibilidad && esquema.horariosDisponibilidad.length > 0">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);">🕐</span>
                    Horarios de Disponibilidad del Médico
                  </label>
                  <div class="horarios-table">
                    <div class="table-header">
                      <span>Día</span>
                      <span>Hora Inicio</span>
                      <span>Hora Fin</span>
                    </div>
                    <div *ngFor="let horario of esquema.horariosDisponibilidad" class="table-row">
                      <span>{{ horario.dia }}</span>
                      <span>{{ horario.horaInicio }}</span>
                      <span>{{ horario.horaFin }}</span>
                    </div>
                  </div>
                  <div class="form-help">
                    Horarios base del médico según su disponibilidad.
                  </div>
                </div>
              </div>

              <!-- Horarios del Esquema -->
              <div class="col-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">📅</span>
                    Horarios del Esquema
                  </label>
                  
                  <div *ngFor="let horario of esquema.horarios; let i = index" class="horario-form-row">
                    <div class="row g-2">
                      <div class="col-4">
                        <select
                          [(ngModel)]="horario.dia"
                          [name]="'dia-' + i"
                          class="form-control form-control-sm"
                          required
                        >
                          <option value="">Seleccionar día...</option>
                          <option *ngFor="let dia of diasSemana" [value]="dia">{{ dia }}</option>
                        </select>
                      </div>
                      <div class="col-3">
                        <input
                          type="time"
                          class="form-control form-control-sm"
                          [(ngModel)]="horario.horaInicio"
                          [name]="'horaInicio-' + i"
                          required
                        />
                      </div>
                      <div class="col-3">
                        <input
                          type="time"
                          class="form-control form-control-sm"
                          [(ngModel)]="horario.horaFin"
                          [name]="'horaFin-' + i"
                          required
                        />
                      </div>
                      <div class="col-2">
                        <button
                          type="button"
                          class="btn btn-delete-small"
                          (click)="removeHorario(i)"
                          title="Eliminar horario"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    class="btn btn-add-horario" 
                    (click)="addHorario()"
                  >
                    <i class="fas fa-plus me-2"></i>
                    Agregar Horario
                  </button>
                  
                  <div class="form-help">
                    Configure los horarios específicos para este esquema de turnos.
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- FOOTER DEL CARD -->
        <div class="card-footer">
          <div class="d-flex gap-2 flex-wrap">
            <!-- Botones en modo vista -->
            <ng-container *ngIf="!modoEdicion">
              <button type="button" class="btn btn-modern btn-back" (click)="goBack()">
                ← Volver
              </button>
              <button type="button" class="btn btn-modern btn-edit" (click)="activarEdicion()">
                ✏️ Editar
              </button>
              <button 
                type="button" 
                class="btn btn-modern btn-delete ms-auto" 
                (click)="remove(esquema)"
                *ngIf="esquema.id"
              >
                🗑️ Eliminar
              </button>
            </ng-container>

            <!-- Botones en modo edición -->
            <ng-container *ngIf="modoEdicion">
              <button 
                type="submit" 
                class="btn btn-modern btn-save" 
                [disabled]="allFieldsEmpty()"
                (click)="save()"
              >
                💾 Guardar
              </button>
              <button type="button" class="btn btn-modern btn-cancel" (click)="cancelar()">
                ❌ Cancelar
              </button>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos modernos para Esquema Turno Detail */
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .modern-card {
      border-radius: 1.5rem;
      overflow: hidden;
      border: none;
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      background: white;
      backdrop-filter: blur(20px);
    }
    
    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: rotate(45deg);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }
    
    .header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
      font-size: 1.5rem;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .header-text h1 {
      color: white;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .info-item {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 15px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .info-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    
    .info-item.full-width {
      grid-column: 1 / -1;
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .info-value {
      font-size: 1.1rem;
      color: #343a40;
      font-weight: 500;
    }
    
    .horarios-disponibles, .horarios-esquema {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .horario-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 3px 10px rgba(102,126,234,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      min-width: 120px;
    }
    
    .dia-label {
      font-size: 0.8rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .hora-label {
      font-weight: 600;
    }
    
    .no-horarios {
      color: #6c757d;
      font-style: italic;
      padding: 1rem;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 10px;
    }
    
    /* Estilos del formulario */
    .form-group-modern {
      margin-bottom: 2rem;
    }
    
    .form-label-modern {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .form-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .form-control-modern {
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }
    
    .form-control-modern:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102,126,234,0.25);
      outline: 0;
    }
    
    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.5rem;
      font-style: italic;
    }
    
    .horarios-table {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .table-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }
    
    .table-row:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    .table-row:last-child {
      border-bottom: none;
    }
    
    .horario-form-row {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #e9ecef;
    }
    
    .form-control-sm {
      border-radius: 8px;
      border: 1px solid #ced4da;
    }
    
    .btn-delete-small {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.5rem;
      font-size: 0.8rem;
      transition: all 0.3s ease;
      width: 100%;
    }
    
    .btn-delete-small:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220,53,69,0.4);
    }
    
    .btn-add-horario {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      border-radius: 15px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }
    
    .btn-add-horario:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40,167,69,0.4);
    }
    
    /* Footer y botones */
    .card-footer {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: none;
      padding: 1.5rem 2rem;
    }
    
    .btn-modern {
      border-radius: 25px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-back {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-edit {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-save {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
    }
    
    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .btn-modern:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .card-header {
        padding: 1.5rem;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .horarios-disponibles, .horarios-esquema {
        justify-content: center;
      }
      
      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        text-align: center;
      }
      
      .d-flex {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .ms-auto {
        margin-left: 0 !important;
      }
    }
  `]
})
export class EsquemaTurnoDetailComponent {
  esquema: EsquemaTurno = {
    id: 0,
    staffMedicoId: null as any,
    consultorioId: null as any,
    disponibilidadMedicoId: null as any,
    centroId: null as any,
    horarios: [],
    intervalo: 15,
  } as EsquemaTurno;
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  disponibilidadesMedico: DisponibilidadMedico[] = [];
  selectedDisponibilidadId: number | null = null;
  modoEdicion = false;
  esNuevo = false;

  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diasSemanaMap: { [key: string]: string } = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miércoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private esquemaTurnoService: EsquemaTurnoService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
    private disponibilidadMedicoService: DisponibilidadMedicoService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadDisponibilidadesMedico();
    this.get();
    this.loadStaffMedicos();
  }

  // Helper methods for template binding to replace arrow functions
  getDisponibilidadById(): DisponibilidadMedico | undefined {
    return this.disponibilidadesMedico.find(d => d.id === this.esquema.disponibilidadMedicoId);
  }

  getDisponibilidadLabelForCurrent(): string {
    const disp = this.getDisponibilidadById();
    return disp ? this.getDisponibilidadLabel(disp) : '';
  }

  getConsultorioNombre(): string {
    const consultorio = this.consultorios.find(c => c.id === this.esquema.consultorioId);
    return consultorio?.nombre || 'Sin consultorio';
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'esquema-turno/new') {
      this.modoEdicion = true;
      this.esNuevo = true;
      
      // Auto-completar con parámetros de query si vienen del centro de atención
      const consultorioId = this.route.snapshot.queryParamMap.get('consultorioId');
      const centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');
      
      if (consultorioId && centroAtencionId) {
        this.esquema.consultorioId = Number(consultorioId);
        this.esquema.centroId = Number(centroAtencionId);
        
        // Cargar consultorios para el centro específico
        this.loadConsultorios(Number(centroAtencionId));
      }
    } else if (path === 'esquema-turno/:id') {
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;

      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) {
        console.error('El ID proporcionado no es válido.');
        return;
      }

      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }

      this.esquemaTurnoService.get(id).subscribe({
        next: (dataPackage) => {
          this.esquema = <EsquemaTurno>dataPackage.data;

          // Convertir los días al formato esperado
          this.esquema.horarios = this.esquema.horarios.map(horario => ({
            ...horario,
            dia: this.diasSemanaMap[horario.dia] || horario.dia, // Convertir el día si es necesario
          }));

          this.selectedDisponibilidadId = this.esquema.disponibilidadMedicoId ?? null;
          if (this.esquema.centroId) {
            this.loadConsultorios(this.esquema.centroId);
          }
        },
        error: (err) => {
          console.error('Error al cargar el esquema de turno:', err);
          this.modalService.alert('Error', 'No se pudo cargar el esquema de turno.');
        }
      });
    }
  }

  loadDisponibilidadesMedico(callback?: () => void): void {
    this.disponibilidadMedicoService.all().subscribe(dp => {
      this.disponibilidadesMedico = dp.data as DisponibilidadMedico[];
      if (callback) callback();
    });
  }

  loadStaffMedicos(callback?: () => void): void {
    this.staffMedicoService.all().subscribe(dp => {
      this.staffMedicos = dp.data as StaffMedico[];
      if (callback) callback();
    });
  }

  onDisponibilidadChange(): void {
    const disp = this.disponibilidadesMedico.find(d => d.id === this.selectedDisponibilidadId);
    if (disp) {
      this.esquema.staffMedicoId = disp.staffMedicoId;
      this.esquema.horariosDisponibilidad = disp.horarios.map(horario => ({
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      }));
      this.esquema.disponibilidadMedicoId = disp.id;

      // Obtener el staff médico asociado
      const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
      if (staff) {
        this.esquema.centroId = staff.centro?.id ?? 0; // Asignar el centroId si existe, o 0 como valor predeterminado
      } else {
        this.esquema.centroId = 0; // Si no hay staff asociado, asignar 0 como valor predeterminado
      }
    }

    // Cargar los consultorios asociados al centro de atención
    if (this.esquema.centroId) {
      this.loadConsultorios(this.esquema.centroId);
    } else {
      this.consultorios = []; // Limpiar consultorios si no hay centro asociado
    }
  }
  loadConsultorios(centroId: number): void {
    this.consultorioService.getByCentroAtencion(centroId).subscribe({
      next: (dp) => {
        this.consultorios = dp.data as Consultorio[];
        console.log('Consultorios cargados:', this.consultorios);

        // Asignar el consultorioId al modelo si está disponible
        if (this.esquema.consultorioId) {
          const consultorio = this.consultorios.find(c => c.id === this.esquema.consultorioId);
          if (consultorio) {
            this.esquema.consultorioId = consultorio.id;
          } else {
            console.warn('El consultorio asociado no se encuentra en la lista de consultorios cargados.');
          }
        }
      },
      error: () => {
        console.error('Error al cargar los consultorios.');
        this.consultorios = [];
      }
    });
  }

  getCentroNombre(): string {
    const staff = this.staffMedicos.find(s => s.id === this.esquema.staffMedicoId);
    return staff?.centro?.nombre ?? '';
  }



  getDisponibilidadLabel(disp: DisponibilidadMedico): string {
    const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
    if (!staff) return `ID ${disp.id}`;

    const medicoNombre = staff.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Sin médico';
    const especialidadNombre = staff.especialidad ? staff.especialidad.nombre : 'Sin especialidad';

    const horarios = disp.horarios
      .map(horario => `${horario.dia}: ${horario.horaInicio}-${horario.horaFin}`)
      .join(', ');

    return `${medicoNombre} (${especialidadNombre}) - ${horarios}`;
  }

  save(): void {
    const payload = { ...this.esquema };

    // Agregar un log para verificar el contenido del payload
    console.log('Payload enviado al backend:', payload);

    // Validar que los campos requeridos no sean null
    if (!payload.disponibilidadMedicoId || !payload.consultorioId || !payload.staffMedicoId || !payload.centroId) {
      this.modalService.alert('Error', 'Debe completar todos los campos obligatorios.');
      return;
    }

    this.esquemaTurnoService.create(payload).subscribe({
      next: () => {
        const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
        const centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');
        
        if (returnTo === 'centro-detail' && centroAtencionId) {
          this.router.navigate(['/centrosAtencion', centroAtencionId]);
        } else {
          this.router.navigate(['/esquema-turno']);
        }
      },
      error: (err) => {
        console.error('Error al guardar el esquema de turno:', err);
        this.modalService.alert('Error', 'Error al guardar el esquema de turno.');
      }
    });
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
    if (this.esNuevo) {
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      const centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');
      
      if (returnTo === 'centro-detail' && centroAtencionId) {
        this.router.navigate(['/centrosAtencion', centroAtencionId]);
      } else {
        this.router.navigate(['/esquema-turno']);
      }
    }
  }

  goBack(): void {
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    const centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');
    
    if (returnTo === 'centro-detail' && centroAtencionId) {
      this.router.navigate(['/centrosAtencion', centroAtencionId]);
    } else {
      this.router.navigate(['/esquema-turno']);
    }
  }

  remove(esquema: EsquemaTurno): void {
    this.modalService
      .confirm(
        "Eliminar Esquema de Turno",
        "¿Está seguro que desea eliminar este esquema de turno?",
        "Si elimina el esquema no podrá recuperarlo luego"
      )
      .then(() => {
        this.esquemaTurnoService.remove(esquema.id).subscribe({
          next: () => this.router.navigate(['/esquema-turno']),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el esquema de turno.";
            this.modalService.alert("Error", msg);
            console.error("Error al eliminar esquema de turno:", err);
          }
        });
      });
  }

  allFieldsEmpty(): boolean {
    return !this.esquema.disponibilidadMedicoId || 
           !this.esquema.consultorioId || 
           !this.esquema.intervalo ||
           this.esquema.horarios.length === 0;
  }

  addHorario(): void {
    this.esquema.horarios.push({ dia: '', horaInicio: '', horaFin: '' });
  }

  removeHorario(index: number): void {
    this.esquema.horarios.splice(index, 1);
  }
}