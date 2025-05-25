import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StaffMedicoService } from './staffMedico.service';
import { StaffMedico } from './staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Medico } from '../medicos/medico';
import { Especialidad } from '../especialidades/especialidad';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { MedicoService } from '../medicos/medico.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-staff-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <!-- MODO VISTA -->
      <div *ngIf="!modoEdicion">
        <h2>Staff Médico #{{ staffMedico.id }}</h2>
        <p><b>Centro:</b> {{ getCentroNombre() }}</p>
        <p><b>Médico:</b> {{ getMedicoNombre() }}</p>
        <p><b>Especialidad:</b> {{ getEspecialidadNombre() }}</p>
        <button class="btn btn-danger" (click)="goBack()">Atrás</button>
        <button class="btn btn-primary" (click)="activarEdicion()">Editar</button>
      </div>

      <!-- MODO EDICIÓN -->
      <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
        <h2>
          <ng-container *ngIf="staffMedico.id && staffMedico.id !== 0; else nuevo">
            Editando Staff Médico #{{ staffMedico.id }}
          </ng-container>
          <ng-template #nuevo>
            Nuevo Staff Médico
          </ng-template>
        </h2>
        <div class="mb-3">
          <label class="form-label">Centro de Atención</label>
          <select
            [(ngModel)]="staffMedico.centroAtencionId"
            name="centroAtencionId"
            class="form-control"
            required
          >
            <option *ngFor="let centro of centros" [value]="centro.id">
              {{ centro.nombre }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Médico</label>
          <select
            [(ngModel)]="staffMedico.medicoId"
            name="medicoId"
            class="form-control"
            required
          >
            <option *ngFor="let medico of medicos" [value]="medico.id">
              {{ medico.nombre }} {{ medico.apellido }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Especialidad</label>
          <select
            [(ngModel)]="staffMedico.especialidadId"
            name="especialidadId"
            class="form-control"
            required
          >
            <option *ngFor="let especialidad of especialidades" [value]="especialidad.id">
              {{ especialidad.nombre }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn btn-success" [disabled]="form.invalid || allFieldsEmpty()">Guardar</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
})
export class StaffMedicoDetailComponent {
  staffMedico: StaffMedico = { id: 0, centroAtencionId: 0, medicoId: 0, especialidadId: 0 };
  centros: CentroAtencion[] = [];
  medicos: Medico[] = [];
  especialidades: Especialidad[] = [];
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.get();
  }

  get(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Modo edición
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;
      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }
      this.staffMedicoService.get(id).subscribe({
        next: (dataPackage) => {
          const data = dataPackage.data;

          // Mapear los datos del backend al modelo StaffMedico
   // Asignar los datos del backend al modelo StaffMedico
        this.staffMedico = {
          id: data.id,
          centroAtencionId: data.centro?.id || 0,
          medicoId: data.medico?.id || 0,
          especialidadId: data.especialidad?.id || 0,
          centro: data.centro || undefined, // Objeto completo del centro
          medico: data.medico || undefined, // Objeto completo del médico
          especialidad: data.especialidad || undefined, // Objeto completo de la especialidad
        };


          // Cargar listas de opciones
          this.loadCentros();
          this.loadMedicos();
          this.loadEspecialidades();
        },
        error: (err) => {
          console.error('Error al obtener el staff médico:', err);
          alert('No se pudo cargar el staff médico. Intente nuevamente.');
        }
      });
    } else {
      // Modo nuevo
      this.modoEdicion = true;
      this.esNuevo = true;
      this.staffMedico = { id: 0, centroAtencionId: 0, medicoId: 0, especialidadId: 0 };
      this.loadCentros();
      this.loadMedicos();
      this.loadEspecialidades();
    }
  }

  save(): void {
    if (this.esNuevo) {
      this.staffMedicoService.create(this.staffMedico).subscribe({
        next: () => {
          this.router.navigate(['/staffMedico']);
        },
        error: (error) => {
          console.error('Error al crear el staff médico:', error);
          alert('Error al crear el staff médico.');
        }
      });
    } else {
      this.staffMedicoService.update(this.staffMedico.id, this.staffMedico).subscribe({
        next: () => {
          this.router.navigate(['/staffMedico']);
        },
        error: (error) => {
          console.error('Error al actualizar el staff médico:', error);
          alert('Error al actualizar el staff médico.');
        }
      });
    }
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  allFieldsEmpty(): boolean {
    return !this.staffMedico?.centroAtencionId && !this.staffMedico?.medicoId && !this.staffMedico?.especialidadId;
  }

  goBack(): void {
    this.location.back();
  }

  loadCentros(): void {
    this.centroAtencionService.all().subscribe((dp: DataPackage) => {
      this.centros = dp.data as CentroAtencion[];
    });
  }

  loadMedicos(): void {
    this.medicoService.getAll().subscribe((dp: DataPackage) => {
      this.medicos = dp.data as Medico[];
    });
  }

  loadEspecialidades(): void {
    this.especialidadService.all().subscribe((dp: DataPackage) => {
      this.especialidades = dp.data as Especialidad[];
    });
  }

getCentroNombre(): string {
  return this.staffMedico.centro?.nombre || 'Sin centro';
}

getMedicoNombre(): string {
  const medico = this.staffMedico.medico;
  return medico ? `${medico.nombre} ${medico.apellido}` : 'Sin médico';
}

getEspecialidadNombre(): string {
  return this.staffMedico.especialidad?.nombre || 'Sin especialidad';
}
}