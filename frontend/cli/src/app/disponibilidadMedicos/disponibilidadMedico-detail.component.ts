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
    <div class="container mt-4">
      <!-- MODO VISTA -->
      <div *ngIf="!modoEdicion">
        <h2>Disponibilidad #{{ disponibilidad.id }}</h2>
        <p><b>Staff Médico:</b> 
          {{ disponibilidad.staffMedico?.medico?.nombre }} {{ disponibilidad.staffMedico?.medico?.apellido }}
          ({{ disponibilidad.staffMedico?.especialidad?.nombre }})
        </p>
        <p><b>Día:</b> {{ disponibilidad.diaSemana }}</p>
        <p><b>Hora Inicio:</b> {{ disponibilidad.horaInicio }}</p>
        <p><b>Hora Fin:</b> {{ disponibilidad.horaFin }}</p>
        <button class="btn btn-danger" (click)="goBack()">Atrás</button>
        <button class="btn btn-primary" (click)="activarEdicion()">Editar</button>
      </div>

      <!-- MODO EDICIÓN -->
      <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
        <h2>
          <ng-container *ngIf="disponibilidad.id && disponibilidad.id !== 0; else nuevo">
            Editando Disponibilidad #{{ disponibilidad.id }}
          </ng-container>
          <ng-template #nuevo>
            Nueva Disponibilidad
          </ng-template>
        </h2>
        <div class="mb-3">
          <label class="form-label">Staff Médico</label>
          <select
            [(ngModel)]="disponibilidad.staffMedico"
            name="staffMedico"
            class="form-control"
            required
          >
            <option *ngFor="let staff of staffMedicos" [ngValue]="staff">
              {{ staff.medico?.nombre }} {{ staff.medico?.apellido }} ({{ staff.especialidad?.nombre }})
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Día de la Semana</label>
          <select
            [(ngModel)]="disponibilidad.diaSemana"
            name="diaSemana"
            class="form-control"
            required
          >
            <option *ngFor="let dia of diasSemana" [value]="dia">{{ dia }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Hora Inicio</label>
          <input
            type="time"
            class="form-control"
            [(ngModel)]="disponibilidad.horaInicio"
            name="horaInicio"
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
        <button type="submit" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
})
export class DisponibilidadMedicoDetailComponent {
  disponibilidad: DisponibilidadMedico = { id: 0, staffMedico: null as any, diaSemana: '', horaInicio: '', horaFin: '' };
  staffMedicos: StaffMedico[] = [];
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
    } else {
      // Modo nuevo
      this.modoEdicion = true;
      this.esNuevo = true;
      this.disponibilidad = { id: 0, staffMedico: null as any, diaSemana: '', horaInicio: '', horaFin: '', };
      this.loadStaffMedicos();
    }
  }

  save(): void {
    if (this.esNuevo) {
      this.disponibilidadService.create(this.disponibilidad).subscribe({
        next: () => {
          this.router.navigate(['/disponibilidadMedico']);
        },
        error: (error) => {
          console.error('Error al crear la disponibilidad:', error);
          alert('Error al crear la disponibilidad.');
        }
      });
    } else {
      this.disponibilidadService.update(this.disponibilidad.id!, this.disponibilidad).subscribe({
        next: () => {
          this.router.navigate(['/disponibilidadMedico']);
        },
        error: (error) => {
          console.error('Error al actualizar la disponibilidad:', error);
          alert('Error al actualizar la disponibilidad.');
        }
      });
    }
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  goBack(): void {
    this.location.back();
  }

  loadStaffMedicos(): void {
    this.staffMedicoService.all().subscribe((dp: DataPackage) => {
      this.staffMedicos = dp.data as StaffMedico[];
      // Reasignar el staff seleccionado si ya hay uno
      if (this.disponibilidad.staffMedico) {
        const found = this.staffMedicos.find(s => s.id === this.disponibilidad.staffMedico.id);
        if (found) this.disponibilidad.staffMedico = found;
      }
    });
  }
}