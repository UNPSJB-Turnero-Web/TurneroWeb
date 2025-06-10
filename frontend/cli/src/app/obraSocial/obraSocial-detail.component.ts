import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ObraSocialService } from './obraSocial.service';
import { ObraSocial } from './obraSocial';
import { ModalService } from '../modal/modal.service';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-obra-social-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="obraSocial">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-heart-pulse"></i>
            </div>
            <div class="header-text">
              <h1>{{ esNuevo ? 'Nueva Obra Social' : 'Obra Social #' + obraSocial.id }}</h1>
              <p>{{ esNuevo ? 'Registre una nueva obra social' : obraSocial.nombre }}</p>
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
                  <span class="info-icon" style="background: var(--obra-social-gradient);">🆔</span>
                  ID de la Obra Social
                </div>
                <div class="info-value">
                  {{ obraSocial.id }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--obra-social-gradient);">💊</span>
                  Nombre de la Obra Social
                </div>
                <div class="info-value">
                  {{ obraSocial.nombre }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--obra-social-gradient);">🏷️</span>
                  Código
                </div>
                <div class="info-value">
                  {{ obraSocial.codigo }}
                </div>
              </div>

              <div class="info-item" *ngIf="obraSocial.descripcion">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--obra-social-gradient);">📝</span>
                  Descripción
                </div>
                <div class="info-value">
                  {{ obraSocial.descripcion }}
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
                    <span class="form-icon" style="background: var(--obra-social-gradient);">💊</span>
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Nombre de la obra social"
                    class="form-control form-control-modern"
                    [(ngModel)]="obraSocial.nombre"
                    #nombre="ngModel"
                  />
                  <div *ngIf="nombre.invalid && (nombre.dirty || nombre.touched)" class="form-help text-danger">
                    <div *ngIf="nombre.errors?.['required']">
                      El nombre es requerido
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Código -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--obra-social-gradient);">🏷️</span>
                    Código
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    placeholder="Código de la obra social"
                    class="form-control form-control-modern"
                    [(ngModel)]="obraSocial.codigo"
                    #codigo="ngModel"
                  />
                  <div *ngIf="codigo.invalid && (codigo.dirty || codigo.touched)" class="form-help text-danger">
                    <div *ngIf="codigo.errors?.['required']">
                      El código es requerido
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Descripción -->
              <div class="col-md-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--obra-social-gradient);">📝</span>
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    placeholder="Descripción de la obra social (opcional)"
                    class="form-control form-control-modern"
                    rows="4"
                    [(ngModel)]="obraSocial.descripcion"
                  ></textarea>
                  <div class="form-help">
                    Proporcione una descripción detallada sobre la obra social (opcional).
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
                *ngIf="obraSocial.id && obraSocial.id !== 0"
              >
                🗑️ Eliminar
              </button>
            </ng-container>

            <!-- Botones en modo edición -->
            <ng-container *ngIf="modoEdicion">
              <button 
                type="button" 
                class="btn btn-modern btn-save" 
                [disabled]="!isFormValid()"
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
    /* Estilos modernos para Obra Social Detail */
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
      background: var(--obra-social-gradient);
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
      color: var(--obra-social-primary);
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
      border-color: var(--obra-social-primary);
      box-shadow: 0 0 0 0.2rem var(--obra-social-shadow);
      outline: 0;
    }
    
    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
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
      background: var(--obra-social-gradient);
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
export class ObraSocialDetailComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  
  obraSocial: ObraSocial = { id: 0, nombre: '', codigo: '', descripcion: '' };
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obraSocialService: ObraSocialService,
    private modalService: ModalService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'obraSocial/new') {
      this.modoEdicion = true;
      this.esNuevo = true;
    } else {
      const id = +this.route.snapshot.paramMap.get('id')!;
      this.obraSocialService.get(id).subscribe({
        next: (dp: DataPackage<ObraSocial>) => {
          this.obraSocial = dp.data;
          this.route.queryParams.subscribe(params => {
            this.modoEdicion = params['edit'] === 'true';
          });
        },
        error: (err) => {
          const mensaje = err?.error?.message || "No se pudo cargar la información de la obra social";
          this.modalService.alert("Error", mensaje);
          console.error('Error al cargar obra social:', err);
          this.goBack();
        }
      });
    }
  }

  save(): void {
    // Validar campos requeridos manualmente si el form no está disponible
    if (!this.obraSocial.nombre || !this.obraSocial.codigo) {
      this.modalService.alert(
        "Error", 
        "Por favor, complete correctamente todos los campos requeridos (Nombre y Código)."
      );
      return;
    }

    if (this.form && !this.form.valid) {
      this.modalService.alert(
        "Error", 
        "Por favor, complete correctamente todos los campos requeridos."
      );
      return;
    }
    
    const operacion = this.esNuevo ? 'crear' : 'actualizar';
    const op = this.obraSocial.id && this.obraSocial.id !== 0
      ? this.obraSocialService.update(this.obraSocial.id, this.obraSocial)
      : this.obraSocialService.create(this.obraSocial);
      
    op.subscribe({
      next: () => {
        this.router.navigate(['/obraSocial']);
      },
      error: (err) => {
        const mensaje = err?.error?.message || `No se pudo ${operacion} la obra social. Intente nuevamente.`;
        this.modalService.alert("Error", mensaje);
        console.error(`Error al ${operacion} obra social:`, err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/obraSocial']);
  }
  
  cancelar(): void {
    if (this.obraSocial.id) {
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

  allFieldsEmpty(): boolean {
    return !this.obraSocial?.nombre && 
           !this.obraSocial?.codigo && 
           !this.obraSocial?.descripcion;
  }

  isFormValid(): boolean {
    return !!(this.obraSocial?.nombre && this.obraSocial?.codigo);
  }

  remove(): void {
    if (!this.obraSocial.id) {
      this.modalService.alert('Error', 'No se puede eliminar: la obra social no tiene ID.');
      return;
    }
    
    this.modalService
      .confirm(
        "Eliminar Obra Social",
        "¿Está seguro que desea eliminar esta obra social?",
        "Si elimina la obra social no la podrá utilizar luego"
      )
      .then(() => {
        this.obraSocialService.remove(this.obraSocial.id!).subscribe({
          next: () => {
            this.goBack(); // Redirige al usuario a la lista
          },
          error: (err: any) => {
            console.error('Error al eliminar la obra social:', err);
            this.modalService.alert('Error', 'No se pudo eliminar la obra social. Intente nuevamente.');
          }
        });
      });
  }
}