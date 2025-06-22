import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente';
import { DataPackage } from '../data.package';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-3 py-4" *ngIf="paciente">
      <div class="card shadow-lg rounded-4 overflow-hidden border-0">
        <!-- Header con gradiente verde-esmeralda -->
        <div class="card-header bg-gradient-green text-white position-relative py-4 px-5">
          <div class="gradient-overlay"></div>
          <div class="position-relative">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center">
                <div class="icon-container me-4">
                  <i class="fas fa-user-injured icon-main"></i>
                </div>
                <div>
                  <h1 class="mb-1 fw-bold display-6" *ngIf="!esNuevo()">
                    {{ paciente.nombre }} {{ paciente.apellido }}
                  </h1>
                  <h1 class="mb-1 fw-bold display-6" *ngIf="esNuevo()">
                    Nuevo Paciente
                  </h1>
                  <p class="mb-0 opacity-75">
                    <ng-container *ngIf="!modoEdicion && !esNuevo()">Información del paciente</ng-container>
                    <ng-container *ngIf="modoEdicion && !esNuevo()">Editando información</ng-container>
                    <ng-container *ngIf="esNuevo()">Registro de nuevo paciente</ng-container>
                  </p>
                </div>
              </div>
              <div class="d-flex gap-2" *ngIf="!modoEdicion && !esNuevo()">
                <button class="btn btn-glass rounded-pill px-4" (click)="activarEdicion()">
                  <i class="fas fa-edit me-2"></i>
                  <span class="d-none d-sm-inline">Editar</span>
                </button>
                <button class="btn btn-glass-secondary rounded-pill px-4" (click)="goBack()">
                  <i class="fas fa-arrow-left me-2"></i>
                  <span class="d-none d-sm-inline">Volver</span>
                </button>
              </div>
            </div>

            <!-- Badges informativos en modo vista -->
            <div class="d-flex flex-wrap gap-2" *ngIf="!modoEdicion && !esNuevo()">
              <span class="badge badge-glass">
                <i class="fas fa-hashtag me-1"></i>
                ID: {{ paciente.id }}
              </span>
              <span class="badge badge-glass">
                <i class="fas fa-id-card me-1"></i>
                DNI: {{ paciente.dni }}
              </span>
              <span class="badge badge-glass" *ngIf="paciente.obraSocial">
                <i class="fas fa-hospital me-1"></i>
                {{ paciente.obraSocial.nombre }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-body p-5">
          <!-- MODO VISTA -->
          <div *ngIf="!modoEdicion && !esNuevo()" class="row g-4">
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <label class="info-label">Nombre Completo</label>
                  <div class="info-value">{{ paciente.nombre }} {{ paciente.apellido }}</div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div>
                  <label class="info-label">Correo Electrónico</label>
                  <div class="info-value">{{ paciente.email }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div>
                  <label class="info-label">Teléfono</label>
                  <div class="info-value">{{ paciente.telefono }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-id-card"></i>
                </div>
                <div>
                  <label class="info-label">Documento</label>
                  <div class="info-value">{{ paciente.dni }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <label class="info-label">Fecha de Nacimiento</label>
                  <div class="info-value">{{ paciente.fechaNacimiento | date: 'dd/MM/yyyy' }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-hospital"></i>
                </div>
                <div>
                  <label class="info-label">Obra Social</label>
                  <div class="info-value">{{ paciente.obraSocial?.nombre || 'Sin obra social' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN/CREACIÓN -->
          <form *ngIf="modoEdicion || esNuevo()" #form="ngForm" (ngSubmit)="save()" class="needs-validation" novalidate>
            <div class="row g-4">
              <!-- Nombre -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="paciente.nombre"
                    name="nombre"
                    id="nombre"
                    class="form-control form-control-modern"
                    placeholder="Nombre"
                    required
                    #nombre="ngModel"
                  />
                  <label for="nombre">
                    <i class="fas fa-user me-2"></i>Nombre
                  </label>
                </div>
                <div *ngIf="isInvalidField(nombre)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  El nombre es requerido
                </div>
              </div>

              <!-- Apellido -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="paciente.apellido"
                    name="apellido"
                    id="apellido"
                    class="form-control form-control-modern"
                    placeholder="Apellido"
                    required
                    #apellido="ngModel"
                  />
                  <label for="apellido">
                    <i class="fas fa-user-tag me-2"></i>Apellido
                  </label>
                </div>
                <div *ngIf="isInvalidField(apellido)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  El apellido es requerido
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="paciente.email"
                    name="email"
                    id="email"
                    type="email"
                    class="form-control form-control-modern"
                    placeholder="Email"
                    required
                    #email="ngModel"
                  />
                  <label for="email">
                    <i class="fas fa-envelope me-2"></i>Correo Electrónico
                  </label>
                </div>
                <div *ngIf="isInvalidField(email)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  <div *ngIf="email.errors?.['required']">El email es requerido</div>
                  <div *ngIf="email.errors?.['email']">Debe ser un email válido</div>
                </div>
              </div>

              <!-- Teléfono -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="paciente.telefono"
                    name="telefono"
                    id="telefono"
                    class="form-control form-control-modern"
                    placeholder="Teléfono"
                    required
                    #telefono="ngModel"
                  />
                  <label for="telefono">
                    <i class="fas fa-phone me-2"></i>Teléfono
                  </label>
                </div>
                <div *ngIf="isInvalidField(telefono)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  El teléfono es requerido
                </div>
              </div>

              <!-- DNI -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="paciente.dni"
                    name="dni"
                    id="dni"
                    type="number"
                    class="form-control form-control-modern"
                    placeholder="DNI"
                    required
                    #dni="ngModel"
                  />
                  <label for="dni">
                    <i class="fas fa-id-card me-2"></i>Documento (DNI)
                  </label>
                </div>
                <div *ngIf="isInvalidField(dni)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  El DNI es requerido
                </div>
              </div>

              <!-- Fecha de Nacimiento -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="paciente.fechaNacimiento"
                    name="fechaNacimiento"
                    id="fechaNacimiento"
                    type="date"
                    class="form-control form-control-modern"
                    placeholder="Fecha de Nacimiento"
                    required
                    #fechaNacimiento="ngModel"
                  />
                  <label for="fechaNacimiento">
                    <i class="fas fa-calendar-alt me-2"></i>Fecha de Nacimiento
                  </label>
                </div>
                <div *ngIf="isInvalidField(fechaNacimiento)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  La fecha de nacimiento es requerida
                </div>
              </div>

              <!-- Obra Social -->
              <div class="col-12">
                <div class="form-floating">
                  <select
                    [(ngModel)]="paciente.obraSocial"
                    name="obraSocial"
                    id="obraSocial"
                    class="form-select form-control-modern"
                    required
                    #obraSocial="ngModel"
                  >
                    <option value="" disabled selected>Seleccionar obra social</option>
                    <option *ngFor="let obraSocial of obrasSociales" [ngValue]="obraSocial">
                      {{ obraSocial.nombre }}
                    </option>
                  </select>
                  <label for="obraSocial">
                    <i class="fas fa-hospital me-2"></i>Obra Social
                  </label>
                </div>
                <div *ngIf="isInvalidField(obraSocial)" class="invalid-feedback d-block">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  La obra social es requerida
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex flex-wrap gap-3 mt-5 pt-4 border-top">
              <button type="submit" 
                      class="btn btn-success-gradient btn-lg rounded-pill px-4"
                      [disabled]="form.invalid">
                <i class="fas fa-save me-2"></i>
                Guardar Paciente
              </button>
              
              <button type="button" 
                      class="btn btn-secondary-gradient btn-lg rounded-pill px-4" 
                      (click)="cancelar()">
                <i class="fas fa-times me-2"></i>
                Cancelar
              </button>
              
              <button *ngIf="paciente.id && !esNuevo() && !esPacienteVendoSuPerfil()" 
                      type="button" 
                      class="btn btn-danger-gradient btn-lg rounded-pill px-4" 
                      (click)="confirmDelete()">
                <i class="fas fa-trash me-2"></i>
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Gradiente para tema de pacientes */
    .bg-gradient-green {
      background: var(--pacientes-gradient);
      position: relative;
      overflow: hidden;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }

    .icon-container {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .icon-main {
      font-size: 2.5rem;
      color: white;
    }

    .btn-glass {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .btn-glass:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .btn-glass-secondary {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: white;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .btn-glass-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      color: white;
      transform: translateY(-2px);
    }

    .badge-glass {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      backdrop-filter: blur(10px);
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      font-weight: 500;
    }

    .card {
      border: none;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    }

    /* Cards de información en modo vista */
    .info-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      height: 100%;
    }

    .info-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px var(--pacientes-shadow);
      border-color: var(--pacientes-primary);
    }

    .info-icon {
      width: 50px;
      height: 50px;
      background: var(--pacientes-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: white;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .info-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
      display: block;
    }

    .info-value {
      font-size: 1.1rem;
      color: #1f2937;
      font-weight: 600;
      word-break: break-word;
    }

    /* Formularios modernos */
    .form-floating {
      margin-bottom: 0;
    }

    .form-control-modern, .form-select {
      border: 2px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1rem 1.25rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .form-control-modern:focus, .form-select:focus {
      border-color: var(--pacientes-primary);
      box-shadow: 0 0 0 3px var(--pacientes-shadow);
      background: white;
    }

    .form-floating > label {
      padding: 1rem 1.25rem;
      color: #6b7280;
      font-weight: 500;
    }

    .form-floating > .form-control-modern:focus ~ label,
    .form-floating > .form-control-modern:not(:placeholder-shown) ~ label,
    .form-floating > .form-select:focus ~ label,
    .form-floating > .form-select:not([value=""]) ~ label {
      color: var(--pacientes-primary);
      transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
    }

    /* Botones con gradiente */
    .btn-success-gradient {
      background: var(--pacientes-gradient);
      border: none;
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-success-gradient:hover:not(:disabled) {
      background: var(--pacientes-gradient);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--pacientes-shadow);
      color: white;
    }

    .btn-success-gradient:disabled {
      background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
      cursor: not-allowed;
    }

    .btn-secondary-gradient {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      border: none;
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-secondary-gradient:hover {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
      color: white;
    }

    .btn-danger-gradient {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border: none;
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-danger-gradient:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
      color: white;
    }

    /* Validación de formularios */
    .invalid-feedback {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
    }

    .was-validated .form-control:invalid,
    .form-control.is-invalid {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .display-6 {
        font-size: 1.5rem;
      }
      
      .icon-container {
        width: 60px;
        height: 60px;
      }
      
      .icon-main {
        font-size: 2rem;
      }
      
      .info-card {
        padding: 1rem;
      }
      
      .info-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
        margin-right: 0.75rem;
      }
      
      .info-value {
        font-size: 1rem;
      }
      
      .card-body {
        padding: 2rem !important;
      }
    }

    @media (max-width: 576px) {
      .info-card {
        flex-direction: column;
        text-align: center;
      }
      
      .info-icon {
        margin-right: 0;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class PacienteDetailComponent implements OnInit {
  @ViewChild('form', { static: false }) form!: NgForm;
  
  paciente: Paciente = { id: 0, nombre: '', apellido: '', email: '', telefono: '', dni: 0, fechaNacimiento: '' };
  modoEdicion = false;
  obrasSociales: { id: number; nombre: string; codigo: string }[] = [];

  constructor(
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.pacienteService.getObrasSociales().subscribe((dp: DataPackage<{ id: number; nombre: string; codigo: string }[]>) => {
      this.obrasSociales = dp.data;
    });

    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'pacientes/new') {
      this.modoEdicion = true;
    } else {
      let id: number;
      
      // Si estamos en la ruta del perfil del paciente, usar el ID del localStorage
      if (path === 'paciente-perfil') {
        const pacienteId = localStorage.getItem('pacienteId');
        if (!pacienteId) {
          console.error('No se encontró el ID del paciente en localStorage');
          alert('No se pudo cargar el perfil. Por favor, intenta nuevamente.');
          this.router.navigate(['/paciente-dashboard']);
          return;
        }
        id = parseInt(pacienteId);
      } else {
        // Para rutas de admin, usar el parámetro de la URL
        id = +this.route.snapshot.paramMap.get('id')!;
      }
      
      this.pacienteService.get(id).subscribe((dp: DataPackage<Paciente>) => {
        this.paciente = dp.data;

        // Asignar la obra social asociada al paciente
        if (this.paciente.obraSocial) {
          const obraSocial = this.obrasSociales.find(os => os.id === this.paciente.obraSocial?.id);
          if (obraSocial) {
            this.paciente.obraSocial = obraSocial;
          }
        }

        this.route.queryParams.subscribe(params => {
          this.modoEdicion = params['edit'] === 'true';
        });
      });
    }
  }

  esNuevo(): boolean {
    return !this.paciente.id || this.paciente.id === 0;
  }

  isInvalidField(field: any): boolean {
    return field.invalid && (field.dirty || field.touched);
  }

  save(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      return;
    }

    const op = this.paciente.id
      ? this.pacienteService.update(this.paciente.id, this.paciente)
      : this.pacienteService.create(this.paciente);
    
    op.subscribe({
      next: () => {
        this.modalService.alert(
          "Éxito", 
          this.esNuevo() ? "Paciente creado correctamente" : "Paciente actualizado correctamente"
        );
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        const msg = err?.error?.message || "Error al guardar el paciente.";
        this.modalService.alert("Error", msg);
        console.error("Error al guardar paciente:", err);
      }
    });
  }

  goBack(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'paciente-perfil') {
      // Si es un paciente viendo su perfil, volver al dashboard del paciente
      this.router.navigate(['/paciente-dashboard']);
    } else {
      // Si es un admin, volver a la lista de pacientes
      this.router.navigate(['/pacientes']);
    }
  }

  cancelar(): void {
    if (this.paciente.id) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: 'merge'
      });
      this.modoEdicion = false;
    } else {
      this.goBack();
    }
  }

  activarEdicion(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: true },
      queryParamsHandling: 'merge'
    });
    this.modoEdicion = true;
  }

  remove(): void {
    if (!this.paciente.id) return;
    
    this.pacienteService.remove(this.paciente.id).subscribe({
      next: () => {
        this.modalService.alert("Éxito", "Paciente eliminado correctamente");
        this.goBack();
      },
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el paciente.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar paciente:", err);
      }
    });
  }

  confirmDelete(): void {
    this.modalService
      .confirm(
        "Eliminar paciente",
        "Confirmar eliminación",
        `¿Está seguro que desea eliminar el paciente ${this.paciente.nombre} ${this.paciente.apellido}?`
      )
      .then(() => this.remove())
      .catch(() => {});
  }

  esPacienteVendoSuPerfil(): boolean {
    const path = this.route.snapshot.routeConfig?.path;
    return path === 'paciente-perfil';
  }
}
