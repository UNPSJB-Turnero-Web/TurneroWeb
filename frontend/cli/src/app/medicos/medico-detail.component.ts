import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicoService } from './medico.service';
import { Medico } from './medico';
import { Especialidad } from '../especialidades/especialidad';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { DataPackage } from '../data.package';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="medico">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="header-text">
              <h1>{{ esNuevo ? 'Nuevo Médico' : 'Médico #' + medico.id }}</h1>
              <p>{{ esNuevo ? 'Registre un nuevo profesional médico' : medico.nombre + ' ' + medico.apellido }}</p>
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
                  <span class="info-icon" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);">🆔</span>
                  ID del Médico
                </div>
                <div class="info-value">
                  {{ medico.id }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">👨‍⚕️</span>
                  Nombre Completo
                </div>
                <div class="info-value">
                  {{ medico.nombre }} {{ medico.apellido }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">🪪</span>
                  DNI
                </div>
                <div class="info-value">
                  {{ medico.dni }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">🏅</span>
                  Matrícula
                </div>
                <div class="info-value">
                  {{ medico.matricula }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);">🏥</span>
                  Especialidad
                </div>
                <div class="info-value">
                  {{ medico.especialidad.nombre || 'Sin especialidad' }}
                </div>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN -->
          <form *ngIf="modoEdicion" #form="ngForm" (ngSubmit)="save()">
            <div class="row">
              <!-- Nombre -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">👨‍⚕️</span>
                    Nombre
                  </label>
                  <input
                    [(ngModel)]="medico.nombre"
                    name="nombre"
                    class="form-control form-control-modern"
                    placeholder="Nombre del médico"
                    required
                    #nombre="ngModel"
                  />
                  <div *ngIf="nombre.invalid && (nombre.dirty || nombre.touched)" class="form-help text-danger">
                    El nombre es requerido
                  </div>
                </div>
              </div>
              
              <!-- Apellido -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">👨‍⚕️</span>
                    Apellido
                  </label>
                  <input
                    [(ngModel)]="medico.apellido"
                    name="apellido"
                    class="form-control form-control-modern"
                    placeholder="Apellido del médico"
                    required
                    #apellido="ngModel"
                  />
                  <div *ngIf="apellido.invalid && (apellido.dirty || apellido.touched)" class="form-help text-danger">
                    El apellido es requerido
                  </div>
                </div>
              </div>
              
              <!-- DNI -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">🪪</span>
                    DNI
                  </label>
                  <input
                    [(ngModel)]="medico.dni"
                    name="dni"
                    class="form-control form-control-modern"
                    placeholder="Documento Nacional de Identidad"
                    required
                    #dni="ngModel"
                  />
                  <div *ngIf="dni.invalid && (dni.dirty || dni.touched)" class="form-help text-danger">
                    El DNI es requerido
                  </div>
                  <div class="form-help">
                    Ingrese el número de DNI sin puntos ni espacios.
                  </div>
                </div>
              </div>
              
              <!-- Matrícula -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">🏅</span>
                    Matrícula
                  </label>
                  <input
                    [(ngModel)]="medico.matricula"
                    name="matricula"
                    class="form-control form-control-modern"
                    placeholder="Número de matrícula profesional"
                    required
                    #matricula="ngModel"
                  />
                  <div *ngIf="matricula.invalid && (matricula.dirty || matricula.touched)" class="form-help text-danger">
                    La matrícula es requerida
                  </div>
                  <div class="form-help">
                    Ingrese el número de matrícula profesional del médico.
                  </div>
                </div>
              </div>
              
              <!-- Especialidad -->
              <div class="col-md-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);">🏥</span>
                    Especialidad
                  </label>
                  <select
                    [(ngModel)]="medico.especialidad"
                    name="especialidad"
                    class="form-control form-control-modern"
                    required
                    #especialidad="ngModel"
                  >
                    <option [ngValue]="null">Seleccione una especialidad...</option>
                    <option *ngFor="let especialidad of especialidades" [ngValue]="especialidad">
                      {{ especialidad.nombre }}
                    </option>
                  </select>
                  <div *ngIf="especialidad.invalid && (especialidad.dirty || especialidad.touched)" class="form-help text-danger">
                    La especialidad es requerida
                  </div>
                  <div class="form-help">
                    Seleccione la especialidad médica del profesional.
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
                (click)="remove()"
                *ngIf="medico.id"
              >
                🗑️ Eliminar
              </button>
            </ng-container>

            <!-- Botones en modo edición -->
            <ng-container *ngIf="modoEdicion">
              <button 
                type="submit" 
                class="btn btn-modern btn-save" 
                [disabled]="allFieldsEmpty() || form.invalid"
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
    /* Estilos modernos para el Médico Detail */
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
      background: var(--medicos-gradient);
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
      transform: translate(-30%, -30%);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .header-icon {
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--medicos-primary);
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
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 1rem;
      color: #6c757d;
    }
    
    .info-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    
    .info-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #212529;
    }
    
    .id-badge {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border-radius: 15px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(0,123,255,0.3);
    }
    
    .dni-badge {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      border-radius: 15px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(23,162,184,0.3);
      font-family: 'Courier New', monospace;
    }
    
    .matricula-badge {
      background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);
      color: white;
      border-radius: 15px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(253,126,20,0.3);
      font-family: 'Courier New', monospace;
    }
    
    .especialidad-badge {
      background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
      color: white;
      border-radius: 15px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(111,66,193,0.3);
    }
    
    /* Estilos para formulario modo edición */
    .form-group-modern {
      margin-bottom: 1.5rem;
    }
    
    .form-label-modern {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #495057;
    }
    
    .form-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: white;
    }
    
    .form-control-modern {
      border-radius: 10px;
      border: 1px solid #dee2e6;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    
    .form-control-modern:focus {
      box-shadow: 0 0 0 0.25rem var(--medicos-shadow);
      border-color: var(--medicos-primary);
    }
    
    .form-error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .form-error::before {
      content: "⚠️";
    }
    
    .form-help {
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-style: italic;
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
      background: var(--medicos-gradient);
      color: white;
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-save {
      background: var(--medicos-gradient);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-modern:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .btn-back:hover {
      box-shadow: 0 6px 20px rgba(108,117,125,0.4);
    }
    
    .btn-edit:hover {
      box-shadow: 0 6px 20px rgba(0,123,255,0.4);
    }
    
    .btn-delete:hover {
      box-shadow: 0 6px 20px rgba(220,53,69,0.4);
    }
    
    .btn-save:hover {
      box-shadow: 0 6px 20px rgba(40,167,69,0.4);
    }
    
    .btn-cancel:hover {
      box-shadow: 0 6px 20px rgba(108,117,125,0.4);
    }
    
    .btn-modern:disabled {
      opacity: 0.7;
      transform: none !important;
      box-shadow: none !important;
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
export class MedicoDetailComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  medico: Medico = { id: 0, nombre: '', apellido: '', dni: '', matricula: '', especialidad: { id: 0, nombre: '', descripcion: '' } };
  especialidades: Especialidad[] = [];
  selectedEspecialidad!: Especialidad;
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "medicos/new") {
      this.modoEdicion = true;
      this.esNuevo = true;
      
      this.especialidadService.all().subscribe({
        next: (dp: DataPackage<Especialidad[]>) => {
          this.especialidades = dp.data;
          
          if (!this.especialidades.length) {
            this.modalService.alert(
              "Error",
              "No hay especialidades cargadas. Debe crear al menos una especialidad antes de registrar un médico."
            );
            this.goBack();
            return;
          }
          
          this.selectedEspecialidad = this.especialidades[0];
          this.medico = {
            id: 0,
            nombre: "",
            apellido: "",
            dni: '',
            matricula: "",
            especialidad: this.selectedEspecialidad
          };
        },
        error: (err) => {
          this.modalService.alert(
            "Error",
            "No se pudieron cargar las especialidades. Por favor, intente nuevamente."
          );
          console.error('Error al cargar especialidades:', err);
        }
      });
    } else {
      // Modo edición o vista
      this.especialidadService.all().subscribe({
        next: (dp: DataPackage<Especialidad[]>) => {
          this.especialidades = dp.data;
          
          if (!this.especialidades.length) {
            this.modalService.alert(
              "Error",
              "No hay especialidades cargadas. Debe crear al menos una especialidad."
            );
            this.goBack();
            return;
          }
          
          const id = +this.route.snapshot.paramMap.get('id')!;
          this.medicoService.getById(id).subscribe({
            next: (resp: DataPackage<Medico>) => {
              this.medico = resp.data;
              
              // Verificación robusta de la especialidad
              if (!this.medico.especialidad) {
                this.selectedEspecialidad = this.especialidades[0];
                this.medico.especialidad = this.selectedEspecialidad;
              } else {
                // Solo buscar si especialidad existe y tiene id
                const especialidadId = this.medico.especialidad?.id;
                const especialidadEncontrada = especialidadId
                  ? this.especialidades.find(e => e.id === especialidadId)
                  : undefined;
                this.selectedEspecialidad = especialidadEncontrada || this.especialidades[0];
                this.medico.especialidad = this.selectedEspecialidad;
              }
            },
            error: (err) => {
              this.modalService.alert(
                "Error",
                "No se pudo cargar la información del médico. Por favor, intente nuevamente."
              );
              console.error('Error al cargar médico:', err);
              this.goBack();
            }
          });
          
          this.route.queryParams.subscribe(params => {
            this.modoEdicion = params['edit'] === 'true';
          });
        },
        error: (err) => {
          this.modalService.alert(
            "Error",
            "No se pudieron cargar las especialidades. Por favor, intente nuevamente."
          );
          console.error('Error al cargar especialidades:', err);
          this.goBack();
        }
      });
    }
  }

  save(): void {
    if (!this.form.valid) {
      this.modalService.alert(
        "Error", 
        "Por favor, complete correctamente todos los campos requeridos."
      );
      return;
    }
    
    if (!this.selectedEspecialidad?.id) {
      this.modalService.alert(
        "Error", 
        "Debe seleccionar una especialidad válida."
      );
      return;
    }
    
    this.medico.especialidad = this.selectedEspecialidad;
    
    const operacion = this.esNuevo ? 'crear' : 'actualizar';
    const op = this.medico.id
      ? this.medicoService.update(this.medico.id, this.medico)
      : this.medicoService.create(this.medico);
      
    op.subscribe({
      next: () => {
        this.router.navigate(['/medicos']);
      },
      error: (err) => {
        const mensaje = err?.error?.message || `No se pudo ${operacion} el médico. Intente nuevamente.`;
        this.modalService.alert("Error", mensaje);
        console.error(`Error al ${operacion} médico:`, err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/medicos']);
  }

  cancelar(): void {
    if (this.medico.id) {
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

  compareEspecialidad(e1: Especialidad, e2: Especialidad): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }

  allFieldsEmpty(): boolean {
    return !this.medico?.nombre &&
      !this.medico?.apellido &&
      !this.medico?.dni &&
      !this.medico?.matricula &&
      !this.selectedEspecialidad;
  }

  remove(): void {
    if (!this.medico.id) return;
    
    this.modalService
      .confirm(
        "Eliminar médico",
        "Eliminar médico",
        `¿Está seguro que desea eliminar al médico ${this.medico.nombre} ${this.medico.apellido}?`
      )
      .then(() => {
        this.medicoService.delete(this.medico.id).subscribe({
          next: () => this.goBack(),
          error: (err) => {
            const mensaje = err?.error?.message || "No se pudo eliminar el médico. Puede que tenga registros asociados.";
            this.modalService.alert("Error", mensaje);
            console.error('Error al eliminar médico:', err);
          }
        });
      })
      .catch(() => { /* Usuario canceló la operación */ });
  }
}
