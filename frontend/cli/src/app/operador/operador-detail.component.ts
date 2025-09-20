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
                <div class="info-icon"><i class="fas fa-user"></i></div>
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
                <div class="info-icon"><i class="fas fa-envelope"></i></div>
                <div>
                  <label class="info-label">Email</label>
                  <div class="info-value">{{ operador.email }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <div class="info-icon"><i class="fas fa-phone"></i></div>
                <div>
                  <label class="info-label">Teléfono</label>
                  <div class="info-value">{{ operador.telefono || "-" }}</div>
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

              <!-- Email -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="operador.email"
                    name="email"
                    id="email"
                    type="email"
                    class="form-control form-control-modern"
                    placeholder="Email"
                    required
                    #email="ngModel"
                  />
                  <label for="email"
                    ><i class="fas fa-envelope me-2"></i>Email</label
                  >
                </div>
                <div
                  *ngIf="isInvalidField(email)"
                  class="invalid-feedback d-block"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>
                  <div *ngIf="email.errors?.['required']">
                    El email es requerido
                  </div>
                  <div *ngIf="email.errors?.['email']">
                    Debe ser un email válido
                  </div>
                </div>
              </div>

              <!-- DNI -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="operador.dni"
                    name="dni"
                    id="dni"
                    type="text"
                    class="form-control form-control-modern"
                    placeholder="DNI"
                    required
                    #dni="ngModel"
                  />
                  <label for="dni"
                    ><i class="fas fa-id-card me-2"></i>DNI</label
                  >
                </div>
                <div
                  *ngIf="isInvalidField(dni)"
                  class="invalid-feedback d-block"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>El DNI es
                  requerido
                </div>
              </div>

              <!-- Teléfono -->
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    [(ngModel)]="operador.telefono"
                    name="telefono"
                    id="telefono"
                    class="form-control form-control-modern"
                    placeholder="Teléfono"
                    #telefono="ngModel"
                  />
                  <label for="telefono"
                    ><i class="fas fa-phone me-2"></i>Teléfono</label
                  >
                </div>
              </div>

              <!-- Activo switch -->
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

              <!-- Información sobre contraseña automática para nuevos operadores -->
              <div class="col-md-12" *ngIf="esNuevo()">
                <div class="alert alert-info d-flex align-items-center">
                  <i class="fas fa-info-circle me-3"></i>
                  <div>
                    <strong>Contraseña automática:</strong> 
                    Se generará una contraseña segura automáticamente y será enviada por correo electrónico al operador.
                  </div>
                </div>
              </div>

              <!-- Contraseña: solo para edición cuando se activa el cambio -->
              <div class="col-md-12" *ngIf="!esNuevo() && cambiarPassword">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        [(ngModel)]="password"
                        name="password"
                        id="password"
                        type="password"
                        class="form-control form-control-modern"
                        placeholder="Contraseña"
                        required
                        minlength="6"
                        #pwd="ngModel"
                      />
                      <label for="password"
                        ><i class="fas fa-lock me-2"></i>Nueva Contraseña</label
                      >
                    </div>
                    <div
                      *ngIf="pwd?.invalid && (pwd.dirty || pwd.touched)"
                      class="invalid-feedback d-block"
                    >
                      <div *ngIf="pwd.errors?.['required']">
                        La contraseña es requerida
                      </div>
                      <div *ngIf="pwd.errors?.['minlength']">
                        La contraseña debe tener al menos 6 caracteres
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        [(ngModel)]="confirmPassword"
                        name="confirmPassword"
                        id="confirmPassword"
                        type="password"
                        class="form-control form-control-modern"
                        placeholder="Confirmar contraseña"
                        required
                        #cpwd="ngModel"
                      />
                      <label for="confirmPassword"
                        ><i class="fas fa-lock me-2"></i>Confirmar
                        contraseña</label
                      >
                    </div>
                    <div
                      *ngIf="
                        confirmPassword &&
                        password !== confirmPassword &&
                        (cpwd.dirty || cpwd.touched)
                      "
                      class="invalid-feedback d-block"
                    >
                      ⚠️ Las contraseñas no coinciden
                    </div>
                  </div>
                </div>
              </div>

              <!-- Toggle cambiar password (solo en edición) -->
              <div class="col-12" *ngIf="!esNuevo()">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="toggleCambiarPassword()"
                >
                  <i
                    class="fas"
                    [class.fa-key]="!cambiarPassword"
                    [class.fa-times]="cambiarPassword"
                  ></i>
                  {{
                    cambiarPassword
                      ? "Cancelar cambio de contraseña"
                      : "Cambiar contraseña"
                  }}
                </button>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex flex-wrap gap-3 mt-5 pt-4 border-top">
                            <button
                type="submit"
                class="btn btn-modern btn-primary rounded-pill px-5 py-3 fw-bold"
                [disabled]="form.invalid || (!esNuevo() && cambiarPassword && passwordMismatch())"
              >
                <i class="fas fa-save me-2"></i>
                <span *ngIf="esNuevo()">Crear Operador</span>
                <span *ngIf="!esNuevo()">Guardar Cambios</span>
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
    dni: null,
    email: "",
    activo: true,
    telefono: "",
  };

  modoEdicion = false;

  // Campos para manejar contraseñas en el front
  password: string = "";
  confirmPassword: string = "";
  cambiarPassword: boolean = false;

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
      const idParam = this.route.snapshot.paramMap.get("id");
      const id = idParam ? +idParam : 0;
      if (id <= 0) {
        // si no existe id válido, volver a la lista o mostrar error
        console.error("ID inválido para operador:", idParam);
        this.router.navigate(["/operadores"]);
        return;
      }

      this.operadorService.get(id).subscribe(
        (dp: DataPackage<Operador>) => {
          this.operador = dp.data;
          this.route.queryParams.subscribe((params) => {
            this.modoEdicion = params["edit"] === "true";
          });
        },
        (err) => {
          console.error("Error cargando operador:", err);
        }
      );
    }
  }

  esNuevo(): boolean {
    return !this.operador.id || this.operador.id === 0;
  }

  isInvalidField(field: any): boolean {
    return field.invalid && (field.dirty || field.touched);
  }

  passwordMismatch(): boolean {
    // Solo verificar match si estamos cambiando contraseña en edición (no en creación)
    if (!this.esNuevo() && this.cambiarPassword) {
      return (
        !!(this.password || this.confirmPassword) &&
        this.password !== this.confirmPassword
      );
    }
    return false;
  }

  toggleCambiarPassword() {
    this.cambiarPassword = !this.cambiarPassword;
    if (!this.cambiarPassword) {
      this.password = "";
      this.confirmPassword = "";
    }
  }

  save(): void {
    // marcar controles tocados para mostrar errores
    if (this.form.invalid || (!this.esNuevo() && this.cambiarPassword && this.passwordMismatch())) {
      Object.keys(this.form.controls).forEach((key) =>
        this.form.controls[key].markAsTouched()
      );
      return;
    }

    // Preparar payload
    const payload: any = { ...this.operador };
    
    if (this.esNuevo()) {
      // Para nuevos operadores: no incluir contraseña, se genera automáticamente
      delete payload.password;
    } else if (this.cambiarPassword) {
      // Para edición con cambio de contraseña: validar y agregar password
      if (!this.password || this.password.length < 6) {
        this.modalService.alert(
          "Error",
          "La contraseña debe tener al menos 6 caracteres."
        );
        return;
      }
      payload.password = this.password;
    } else {
      // Para edición sin cambio de contraseña: no incluir password
      delete payload.password;
    }

    // Seleccionar el método correcto según el caso
    const op$ = this.operador.id
      ? this.operadorService.update(this.operador.id, payload)
      : this.operadorService.createByAdmin(payload);

    op$.subscribe({
      next: (response) => {
        console.log("Respuesta recibida en next:", response);
        
        // Verificar si la respuesta indica un error (status_code diferente de 200)
        if (response.status_code && response.status_code !== 200) {
          const errorMessage = response.status_text || "Error al guardar el operador.";
          this.modalService.alert("Error", errorMessage);
          console.log("Error detectado en respuesta exitosa:", errorMessage);
          return;
        }

        // Si llegamos aquí, es una respuesta exitosa
        this.modalService.alert(
          "Éxito",
          this.esNuevo()
            ? "Operador creado correctamente. Se ha enviado una contraseña automática por correo electrónico."
            : "Operador actualizado correctamente"
        );
        this.router.navigate(["/operadores"]);
      },
      error: (err) => {
        console.log("Respuesta recibida en error:", err);
        let errorMessage = "Error al guardar el operador.";
        
        if (err?.error?.status_text) {
          errorMessage = err.error.status_text;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        this.modalService.alert("Error", errorMessage);
        console.error("Error al guardar operador:", err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/operadores"]);
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.password = "";
    this.confirmPassword = "";
    this.cambiarPassword = false;
    if (this.esNuevo()) {
      this.router.navigate(["/operadores"]);
    }
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
