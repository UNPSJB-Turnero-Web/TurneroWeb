import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DisponibilidadMedicoService } from './disponibilidadMedico.service';
import { DisponibilidadMedico } from './disponibilidadMedico';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-disponibilidad-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4 d-flex justify-content-center">
      <div class="card shadow-sm p-4" style="max-width: 600px; width: 100%; border-radius: 1rem;">
        <h2 class="mb-4 text-center">
          {{ esNuevo ? 'Nueva Disponibilidad' : 'Editando Disponibilidad #' + disponibilidad.id }}
        </h2>
        <form (ngSubmit)="save()" #form="ngForm">
          <div class="mb-3">
            <label class="form-label">Staff Médico</label>
            <!-- Deshabilitar si ya hay un ID -->
            <select
              [(ngModel)]="disponibilidad.staffMedicoId"
              name="staffMedicoId"
              class="form-select"
              required
            >
              <option *ngFor="let staff of staffMedicos" [value]="staff.id">
                {{ staff.medico?.nombre }} {{ staff.medico?.apellido }} ({{ staff.especialidad?.nombre }})
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Días de la Semana</label>
            <div class="d-flex flex-wrap gap-2">
              <div class="form-check form-check-inline" *ngFor="let dia of diasSemana">
                <input
                  class="form-check-input"
                  type="checkbox"
                  [value]="dia"
                  [checked]="disponibilidad.diaSemana.includes(dia)"
                  (change)="onDiaSemanaChange($event, dia)"
                  id="dia-{{dia}}"
                  [disabled]="!modoEdicion"
                />
                <label class="form-check-label" [for]="'dia-' + dia">
                  {{ dia }}
                </label>
              </div>
            </div>
            <div class="mt-2" *ngIf="disponibilidad.diaSemana?.length">
              <b>Días seleccionados:</b>
              <span class="badge bg-primary me-1" *ngFor="let dia of disponibilidad.diaSemana">
                {{ dia }}
              </span>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Hora Inicio</label>
            <input
              type="time"
              class="form-control"
              [(ngModel)]="disponibilidad.horaInicio"
              name="horaInicio"
              [disabled]="!modoEdicion"
              required
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Hora Fin</label>
            <input
              type="time"
              class="form-control"
              [(ngModel)]="disponibilidad.horaFin"
              name="horaFin"
              required
            />
          </div>
          <div class="d-flex justify-content-end mt-4 gap-2">
            <button 
              type="button" 
              class="btn btn-secondary px-4" 
              (click)="goBack()"
            >
              <i class="fa fa-arrow-left me-1"></i> Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-success px-4" 
              [disabled]="form.invalid" 
              *ngIf="modoEdicion"
            >
              <i class="fa fa-save me-1"></i> Guardar
            </button>
            <button 
              type="button" 
              class="btn btn-primary px-4" 
              *ngIf="!modoEdicion"
              (click)="activarEdicion()"
            >
              <i class="fa fa-pencil me-1"></i> Editar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DisponibilidadMedicoDetailComponent {
disponibilidad: DisponibilidadMedico = { id: 0, staffMedicoId: null as any, diaSemana: [], horaInicio: '', horaFin: '' };  staffMedicos: StaffMedico[] = [];
  
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Modo edición
      this.get();
    } else {
      // Modo nuevo
      this.modoEdicion = true;
      this.esNuevo = true;
      this.disponibilidad = { id: 0, staffMedicoId: null as any, diaSemana: [], horaInicio: '', horaFin: '' };
      this.loadStaffMedicos(() => {
        const staffMedicoId = this.route.snapshot.queryParamMap.get('staffMedicoId');
        if (staffMedicoId) {
          this.disponibilidad.staffMedicoId = +staffMedicoId;
          const found = this.staffMedicos.some(s => s.id === this.disponibilidad.staffMedicoId);
          if (!found) {
            alert('El Staff Médico proporcionado no es válido.');
            this.goBack();
          }
        }
      });
    }
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
      this.disponibilidadService.get(id).subscribe({
        next: (dataPackage) => {
          this.disponibilidad = <DisponibilidadMedico>dataPackage.data;
          if (typeof this.disponibilidad.diaSemana === 'string') {
            this.disponibilidad.diaSemana = [this.disponibilidad.diaSemana];
          }
          if (!Array.isArray(this.disponibilidad.diaSemana)) {
            this.disponibilidad.diaSemana = [];
          }
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
    // Validación extra
    if (!Array.isArray(this.disponibilidad.diaSemana) || this.disponibilidad.diaSemana.length === 0) {
      alert('Debe seleccionar al menos un día de la semana.');
      return;
    }
    const payload = { ...this.disponibilidad };
    delete payload.staffMedico;
    // Forzar staffMedicoId a número
    payload.staffMedicoId = Number(payload.staffMedicoId);

    this.disponibilidadService.create(payload).subscribe({
      next: () => {
        this.router.navigate(['/disponibilidades-medico']);
      },
      error: (error) => {
        console.error('Error al crear la disponibilidad:', error);
        alert('Error al crear la disponibilidad.');
      }
    });
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  goBack(): void {
    this.location.back();
  }

  loadStaffMedicos(callback?: () => void): void {
    this.staffMedicoService.all().subscribe({
      next: (dp: DataPackage) => {
        this.staffMedicos = dp.data as StaffMedico[];
        console.log('Staff Médicos cargados:', this.staffMedicos); // Verificar los datos cargados
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error al cargar Staff Médicos:', err);
        alert('No se pudieron cargar los datos del Staff Médico.');
      }
    });
  }

  onDiaSemanaChange(event: Event, dia: string) {
    // Asegura que siempre sea array
    if (!Array.isArray(this.disponibilidad.diaSemana)) {
      this.disponibilidad.diaSemana = [];
    }
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.disponibilidad.diaSemana.includes(dia)) {
        this.disponibilidad.diaSemana.push(dia);
      }
    } else {
      this.disponibilidad.diaSemana = this.disponibilidad.diaSemana.filter(d => d !== dia);
    }
  }
}