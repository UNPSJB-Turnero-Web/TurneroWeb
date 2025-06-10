import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DisponibilidadMedicoService } from './disponibilidadMedico.service';
import { DisponibilidadMedico } from './disponibilidadMedico';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { DataPackage } from '../data.package';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-disponibilidad-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="disponibilidad">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="header-text">
              <h1>{{ esNuevo ? 'Nueva Disponibilidad Médica' : 'Disponibilidad #' + disponibilidad.id }}</h1>
              <p>{{ esNuevo ? 'Configure una nueva disponibilidad médica' : 'Gestione la disponibilidad médica' }}</p>
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
                  <span class="info-icon" style="background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);">👨‍⚕️</span>
                  Staff Médico
                </div>
                <div class="info-value">
                  {{ getStaffMedicoNombre(disponibilidad.staffMedicoId) }}
                </div>
              </div>

              <div class="info-item full-width">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">🕐</span>
                  Horarios de Disponibilidad
                </div>
                <div class="horarios-table">
                  <div class="table-header">
                    <span>Día</span>
                    <span>Hora Inicio</span>
                    <span>Hora Fin</span>
                  </div>
                  <div *ngFor="let horario of disponibilidad.horarios" class="table-row">
                    <span class="dia-badge">{{ horario.dia }}</span>
                    <span class="hora-badge">{{ horario.horaInicio }}</span>
                    <span class="hora-badge">{{ horario.horaFin }}</span>
                  </div>
                  <div *ngIf="!disponibilidad.horarios || disponibilidad.horarios.length === 0" 
                       class="no-horarios">
                    Sin horarios configurados
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN -->
          <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
            <div class="row">
              <!-- Staff Médico -->
              <div class="col-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);">👨‍⚕️</span>
                    Staff Médico
                  </label>
                  <select
                    [(ngModel)]="disponibilidad.staffMedicoId"
                    name="staffMedicoId"
                    class="form-control form-control-modern"
                    required
                  >
                    <option [ngValue]="null">Seleccione un staff médico...</option>
                    <option *ngFor="let staff of staffMedicos" [value]="staff.id">
                      {{ staff.medico?.nombre }} {{ staff.medico?.apellido }} ({{ staff.especialidad?.nombre }})
                    </option>
                  </select>
                  <div class="form-help">
                    Seleccione el staff médico para asignar disponibilidad.
                  </div>
                </div>
              </div>

              <!-- Horarios -->
              <div class="col-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">🕐</span>
                    Horarios por Día
                  </label>
                  
                  <div *ngFor="let horario of disponibilidad.horarios; let i = index" class="horario-form-row">
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
                    Configure los días y horarios de disponibilidad del médico.
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
                (click)="remove(disponibilidad)"
                *ngIf="disponibilidad.id"
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
    /* Estilos modernos para Disponibilidad Médico Detail */
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
      background: var(--disponibilidad-gradient);
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
      color: var(--disponibilidad-primary);
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
    
    .horarios-table {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .table-header {
      background: var(--disponibilidad-gradient);
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
    
    .dia-badge {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      box-shadow: 0 3px 10px rgba(255,154,158,0.3);
    }
    
    .hora-badge {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      color: #495057;
      padding: 8px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      box-shadow: 0 3px 10px rgba(168,237,234,0.3);
    }
    
    .no-horarios {
      color: #6c757d;
      font-style: italic;
      padding: 2rem;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
      border-color: var(--disponibilidad-primary);
      box-shadow: 0 0 0 0.2rem var(--disponibilidad-shadow);
      outline: 0;
    }
    
    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.5rem;
      font-style: italic;
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
      background: var(--disponibilidad-gradient);
      color: white;
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-save {
      background: var(--disponibilidad-gradient);
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
export class DisponibilidadMedicoDetailComponent {
  disponibilidad: DisponibilidadMedico = {
    id: 0,
    staffMedicoId: null as any,
    horarios: [],
  };
  staffMedicos: StaffMedico[] = [];
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  modoEdicion = false;
  esNuevo = false;
  
  // Parámetros de navegación de retorno
  returnTo: string | null = null;
  centroAtencionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService,
    private modalService: ModalService
  ) {}
  
ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  const staffMedicoIdParam = this.route.snapshot.queryParamMap.get('staffMedicoId');
  
  // Capturar parámetros de navegación de retorno
  this.returnTo = this.route.snapshot.queryParamMap.get('returnTo');
  this.centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');

  if (idParam) {
    this.get();
  } else {
    this.modoEdicion = true;
    this.esNuevo = true;

    // Si se pasa el staffMedicoId por la URL, asignarlo automáticamente
    if (staffMedicoIdParam) {
      const staffMedicoId = Number(staffMedicoIdParam);
      if (!isNaN(staffMedicoId)) {
        this.disponibilidad.staffMedicoId = staffMedicoId;
      }
    }

    this.loadStaffMedicos();
  }
}

  get(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;
      
      // Capturar parámetros de navegación de retorno también en modo edición
      this.returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      this.centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');
      
      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }
      this.disponibilidadService.get(id).subscribe({
        next: (dataPackage) => {
          this.disponibilidad = <DisponibilidadMedico>dataPackage.data;
          this.loadStaffMedicos();
        },
        error: (err) => {
          console.error('Error al obtener la disponibilidad:', err);
          alert('No se pudo cargar la disponibilidad. Intente nuevamente.');
        }
      });
    }
  }

  save(): void {
    if (!this.disponibilidad.horarios.length) {
      alert('Debe agregar al menos un horario.');
      return;
    }

    // Ordenar los horarios por el orden de los días de la semana
    const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    this.disponibilidad.horarios.sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));

    const payload = { ...this.disponibilidad };
    
    if (this.esNuevo) {
      // Crear nueva disponibilidad
      this.disponibilidadService.create(payload).subscribe({
        next: () => {
          this.navigateBack();
        },
        error: (error) => {
          console.error('Error al crear la disponibilidad:', error);
          alert('Error al crear la disponibilidad.');
        }
      });
    } else {
      // Actualizar disponibilidad existente
      this.disponibilidadService.update(this.disponibilidad.id, payload).subscribe({
        next: () => {
          this.modoEdicion = false;
          this.navigateBack();
        },
        error: (error) => {
          console.error('Error al actualizar la disponibilidad:', error);
          alert('Error al actualizar la disponibilidad.');
        }
      });
    }
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
    if (this.esNuevo) {
      this.navigateBack();
    }
  }

  goBack(): void {
    this.navigateBack();
  }

  /**
   * Navega de vuelta según el parámetro returnTo
   */
  private navigateBack(): void {
    if (this.returnTo === 'centro-detail' && this.centroAtencionId) {
      // Regresar al detalle del centro de atención
      this.router.navigate(['/centrosAtencion', this.centroAtencionId]);
    } else {
      // Regresar a la lista de disponibilidades médicas por defecto
      this.router.navigate(['/disponibilidades-medico']);
    }
  }

  remove(disponibilidad: DisponibilidadMedico): void {
    this.modalService
      .confirm(
        "Eliminar Disponibilidad",
        "¿Está seguro que desea eliminar esta disponibilidad?",
        "Si elimina la disponibilidad no podrá asignar turnos en ese horario"
      )
      .then(() => {
        this.disponibilidadService.remove(disponibilidad.id).subscribe({
          next: () => this.router.navigate(['/disponibilidades-medico']),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar la disponibilidad.";
            this.modalService.alert("Error", msg);
            console.error("Error al eliminar disponibilidad:", err);
          }
        });
      });
  }

  allFieldsEmpty(): boolean {
    return !this.disponibilidad.staffMedicoId || 
           this.disponibilidad.horarios.length === 0;
  }

  loadStaffMedicos(): void {
    this.staffMedicoService.all().subscribe({
      next: (dp: DataPackage) => {
        this.staffMedicos = dp.data as StaffMedico[];
      },
      error: (err) => {
        console.error('Error al cargar Staff Médicos:', err);
        this.modalService.alert("Error", "No se pudieron cargar los datos del Staff Médico.");
      }
    });
  }

  addHorario(): void {
    this.disponibilidad.horarios.push({ dia: '', horaInicio: '', horaFin: '' });
  }

  removeHorario(index: number): void {
    this.disponibilidad.horarios.splice(index, 1);
  }

  getStaffMedicoNombre(staffMedicoId: number): string {
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    if (!staff) return 'Sin asignar';

    const medicoNombre = staff.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Sin médico';
    const especialidadNombre = staff.especialidad ? staff.especialidad.nombre : 'Sin especialidad';

    return `${medicoNombre} (${especialidadNombre})`;
  }
}