import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StaffMedicoService } from './staffmedico.service';
import { StaffMedico } from './staffmedico';
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
        <p><b>Centro:</b> {{ staffMedico.centro?.name }}</p>
        <p><b>Médico:</b> {{ staffMedico.medico?.nombre }} {{ staffMedico.medico?.apellido }}</p>
        <p><b>Especialidad:</b> {{ staffMedico.especialidad?.nombre }}</p>
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
            [(ngModel)]="staffMedico.centro"
            name="centro"
            class="form-control"
            required
          >
            <option *ngFor="let centro of centros" [ngValue]="centro">
              {{ centro.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Médico</label>
          <select
            [(ngModel)]="staffMedico.medico"
            name="medico"
            class="form-control"
            required
          >
            <option *ngFor="let medico of medicos" [ngValue]="medico">
              {{ medico.nombre }} {{ medico.apellido }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Especialidad</label>
          <select
            [(ngModel)]="staffMedico.especialidad"
            name="especialidad"
            class="form-control"
            required
          >
            <option *ngFor="let especialidad of especialidades" [ngValue]="especialidad">
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
  staffMedico: StaffMedico = { id: 0, centro: null as any, medico: null as any, especialidad: null as any };
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
          this.staffMedico = <StaffMedico>dataPackage.data;
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
      this.staffMedico = { id: 0, centro: null as any, medico: null as any, especialidad: null as any };
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
    return !this.staffMedico?.centro && !this.staffMedico?.medico && !this.staffMedico?.especialidad;
  }

  goBack(): void {
    this.location.back();
  }

  loadCentros(): void {
    this.centroAtencionService.all().subscribe((dp: DataPackage) => {
      this.centros = dp.data as CentroAtencion[];
      // Reasignar el centro seleccionado si ya hay uno
      if (this.staffMedico.centro) {
        const found = this.centros.find(c => c.id === this.staffMedico.centro.id);
        if (found) this.staffMedico.centro = found;
      }
    });
  }

  loadMedicos(): void {
    this.medicoService.getAll().subscribe((dp: DataPackage) => {
      this.medicos = dp.data as Medico[];
      // Reasignar el médico seleccionado si ya hay uno
      if (this.staffMedico.medico) {
        const found = this.medicos.find(m => m.id === this.staffMedico.medico.id);
        if (found) this.staffMedico.medico = found;
      }
    });
  }

  loadEspecialidades(): void {
    this.especialidadService.all().subscribe((dp: DataPackage) => {
      this.especialidades = dp.data as Especialidad[];
      // Reasignar la especialidad seleccionada si ya hay una
      if (this.staffMedico.especialidad) {
        const found = this.especialidades.find(e => e.id === this.staffMedico.especialidad.id);
        if (found) this.staffMedico.especialidad = found;
      }
    });
  }
}