import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { OperadorService } from "./operador.service";
import { Operador } from "./operador";
import { DataPackage } from "../data.package";
import { ModalService } from "../modal/modal.service";

@Component({
  selector: "app-operador-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-3 py-4" *ngIf="operador">
      <div class="card shadow-lg rounded-4 overflow-hidden border-0">
        <div
          class="card-header bg-gradient-blue text-white position-relative py-4 px-5"
        >
          <div class="gradient-overlay"></div>
          <div class="position-relative">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center">
                <div class="icon-container me-4">
                  <i class="fas fa-user-cog icon-main"></i>
                </div>
                <div>
                  <h1 class="mb-1 fw-bold display-6" *ngIf="!esNuevo()">
                    {{ operador.nombre }} {{ operador.apellido }}
                  </h1>
                  <h1 class="mb-1 fw-bold display-6" *ngIf="esNuevo()">
                    Nuevo Operador
                  </h1>
                  <p class="mb-0 opacity-75">
                    <ng-container *ngIf="!modoEdicion && !esNuevo()"
                      >Información del operador</ng-container
                    >
                    <ng-container *ngIf="modoEdicion && !esNuevo()"
                      >Editando información</ng-container
                    >
                    <ng-container *ngIf="esNuevo()"
                      >Registro de nuevo operador</ng-container
                    >
                  </p>
                </div>
              </div>
              <div class="d-flex gap-2" *ngIf="!modoEdicion && !esNuevo()">
                <button
                  class="btn btn-glass rounded-pill px-4"
                  (click)="activarEdicion()"
                >
                  <i class="fas fa-edit me-2"></i>
                  <span class="d-none d-sm-inline">Editar</span>
                </button>
                <button
                  class="btn btn-glass-secondary rounded-pill px-4"
                  (click)="goBack()"
                >
                  <i class="fas fa-arrow-left me-2"></i>
                  <span class="d-none d-sm-inline">Volver</span>
                </button>
              </div>
            </div>

            <div
              class="d-flex flex-wrap gap-2"
              *ngIf="!modoEdicion && !esNuevo()"
            >
              <span class="badge badge-glass">
                <i class="fas fa-hashtag me-1"></i>
                ID: {{ operador.id }}
              </span>
              <span class="badge badge-glass">
                <i class="fas fa-user-check me-1"></i>
                Activo: {{ operador.activo ? "Sí" : "No" }}
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
                  <div class="info-value">
                    {{ operador.nombre }} {{ operador.apellido }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-user-tag"></i>
                </div>
                <div>
                  <label class="info-label">Usuario</label>
                  <div class="info-value">{{ operador.username }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon">
                  <i class="fas fa-user-check"></i>
                </div>
                <div>
                  <label class="info-label">Activo</label>
                  <div class="info-value">
                    {{ operador.activo ? "Sí" : "No" }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN/CREACIÓN -->
          <form
            *ngIf="modoEdicion || esNuevo()"
            #form="ngForm"
            (ngSubmit)="save()"
            class="needs-validation"
            novalidate
          >
            <div class="row g-4">
              <!-- Nombre -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="operador.nombre"
                    name="nombre"
                    id="nombre"
                    class="form-control form-control-modern"
                    placeholder="Nombre"
                    required
                    #nombre="ngModel"
                  />
                  <label for="nombre"
                    ><i class="fas fa-user me-2"></i>Nombre</label
                  >
                </div>
                <div
                  *ngIf="isInvalidField(nombre)"
                  class="invalid-feedback d-block"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>El nombre es
                  requerido
                </div>
              </div>

              <!-- Apellido -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="operador.apellido"
                    name="apellido"
                    id="apellido"
                    class="form-control form-control-modern"
                    placeholder="Apellido"
                    required
                    #apellido="ngModel"
                  />
                  <label for="apellido"
                    ><i class="fas fa-user-tag me-2"></i>Apellido</label
                  >
                </div>
                <div
                  *ngIf="isInvalidField(apellido)"
                  class="invalid-feedback d-block"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>El apellido es
                  requerido
                </div>
              </div>

              <!-- Username -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="operador.username"
                    name="username"
                    id="username"
                    class="form-control form-control-modern"
                    placeholder="Usuario"
                    required
                    #username="ngModel"
                  />
                  <label for="username"
                    ><i class="fas fa-user-cog me-2"></i>Usuario</label
                  >
                </div>
                <div
                  *ngIf="isInvalidField(username)"
                  class="invalid-feedback d-block"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>El usuario es
                  requerido
                </div>
              </div>

              <!-- Activo -->
              <div class="col-md-6 d-flex align-items-center">
                <div class="form-check form-switch">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="activo"
                    [(ngModel)]="operador.activo"
                    name="activo"
                  />
                  <label class="form-check-label" for="activo">Activo</label>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex flex-wrap gap-3 mt-5 pt-4 border-top">
              <button
                type="submit"
                class="btn btn-success-gradient btn-lg rounded-pill px-4"
                [disabled]="form.invalid"
              >
                <i class="fas fa-save me-2"></i>Guardar Operador
              </button>

              <button
                type="button"
                class="btn btn-secondary-gradient btn-lg rounded-pill px-4"
                (click)="cancelar()"
              >
                <i class="fas fa-times me-2"></i>Cancelar
              </button>

              <button
                *ngIf="operador.id && !esNuevo()"
                type="button"
                class="btn btn-danger-gradient btn-lg rounded-pill px-4"
                (click)="confirmDelete()"
              >
                <i class="fas fa-trash me-2"></i>Eliminar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .bg-gradient-blue {
        background: var(--operadores-gradient);
        position: relative;
        overflow: hidden;
      }
      .gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%,
          rgba(255, 255, 255, 0.05) 100%
        );
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
      .badge-glass {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        backdrop-filter: blur(10px);
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        font-weight: 500;
      }
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
      .info-icon {
        width: 50px;
        height: 50px;
        background: var(--operadores-gradient);
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
    `,
  ],
})
export class OperadorDetailComponent implements OnInit {
  @ViewChild("form", { static: false }) form!: NgForm;
  operador: Operador = {
    id: 0,
    nombre: "",
    apellido: "",
    username: "",
    telefono: "",
    activo: true,
    dni: 0,
    email: "",
  };
  modoEdicion = false;

  constructor(
    private operadorService: OperadorService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "operadores/new") {
      this.modoEdicion = true;
    } else {
      const id = +this.route.snapshot.paramMap.get("id")!;
      this.operadorService.get(id).subscribe((dp: DataPackage<Operador>) => {
        this.operador = dp.data;
        this.route.queryParams.subscribe((params) => {
          this.modoEdicion = params["edit"] === "true";
        });
      });
    }
  }

  esNuevo(): boolean {
    return !this.operador.id || this.operador.id === 0;
  }
  isInvalidField(field: any): boolean {
    return field.invalid && (field.dirty || field.touched);
  }

  save(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) =>
        this.form.controls[key].markAsTouched()
      );
      return;
    }

    const op = this.operador.id
      ? this.operadorService.update(this.operador.id, this.operador)
      : this.operadorService.create(this.operador);

    op.subscribe({
      next: () => {
        this.modalService.alert(
          "Éxito",
          this.esNuevo()
            ? "Operador creado correctamente"
            : "Operador actualizado correctamente"
        );
        this.router.navigate(["/operadores"]);
      },
      error: (err) => {
        const msg = err?.error?.message || "Error al guardar el operador.";
        this.modalService.alert("Error", msg);
        console.error("Error al guardar operador:", err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/operadores"]);
  }
  cancelar(): void {
    this.modoEdicion = false;
  }
  activarEdicion(): void {
    this.modoEdicion = true;
  }

  remove(): void {
    if (!this.operador.id) return;
    this.operadorService.remove(this.operador.id).subscribe({
      next: () => {
        this.modalService.alert("Éxito", "Operador eliminado correctamente");
        this.goBack();
      },
      error: (err) => {
        this.modalService.alert(
          "Error",
          err?.error?.message || "Error al eliminar operador."
        );
      },
    });
  }

  confirmDelete(): void {
    this.modalService
      .confirm(
        "Eliminar operador",
        "Confirmar eliminación",
        `¿Está seguro que desea eliminar el operador ${this.operador.nombre} ${this.operador.apellido}?`
      )
      .then(() => this.remove())
      .catch(() => {});
  }
}
