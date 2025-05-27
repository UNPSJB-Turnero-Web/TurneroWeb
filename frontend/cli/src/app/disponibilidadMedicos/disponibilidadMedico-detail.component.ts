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
      <div class="card shadow-sm p-4" style="max-width: 700px; width: 100%; border-radius: 1rem;">
        <h2 class="mb-4 text-center">
          {{ esNuevo ? 'Nueva Disponibilidad' : 'Editando Disponibilidad #' + disponibilidad.id }}
        </h2>
        <div *ngIf="!modoEdicion">
          <p><strong>Staff Médico:</strong> {{ getStaffMedicoNombre(disponibilidad.staffMedicoId) }}</p>
          <p><strong>Horarios:</strong></p>
          <table class="table table-bordered table-striped">
            <thead class="table-light">
              <tr>
                <th>Día</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let horario of disponibilidad.horarios">
                <td>{{ horario.dia }}</td>
                <td>{{ horario.horaInicio }}</td>
                <td>{{ horario.horaFin }}</td>
              </tr>
            </tbody>
          </table>
          <div class="d-flex justify-content-end mt-4 gap-2">
            <button class="btn btn-primary" (click)="activarEdicion()">
              <i class="fa fa-pencil me-1"></i> Editar
            </button>
            <button class="btn btn-secondary" (click)="goBack()">
              <i class="fa fa-arrow-left me-1"></i> Volver
            </button>
          </div>
        </div>
        <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
          <div class="mb-3">
            <label class="form-label">Staff Médico</label>
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
            <label class="form-label">Horarios por Día</label>
            <div *ngFor="let horario of disponibilidad.horarios; let i = index" class="mb-3">
              <div class="row g-2">
                <div class="col-4">
                  <select
                    [(ngModel)]="horario.dia"
                    name="dia-{{ i }}"
                    class="form-select"
                    required
                  >
                    <option *ngFor="let dia of diasSemana" [value]="dia">{{ dia }}</option>
                  </select>
                </div>
                <div class="col-3">
                  <input
                    type="time"
                    class="form-control"
                    [(ngModel)]="horario.horaInicio"
                    name="horaInicio-{{ i }}"
                    required
                  />
                </div>
                <div class="col-3">
                  <input
                    type="time"
                    class="form-control"
                    [(ngModel)]="horario.horaFin"
                    name="horaFin-{{ i }}"
                    required
                  />
                </div>
                <div class="col-2">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    (click)="removeHorario(i)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-primary mt-2" (click)="addHorario()">
              <i class="fa fa-plus me-1"></i> Agregar Día
            </button>
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
            >
              <i class="fa fa-save me-1"></i> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  `
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService,
    private location: Location
  ) {}
  
ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  const staffMedicoIdParam = this.route.snapshot.queryParamMap.get('staffMedicoId');

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

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  goBack(): void {
    this.location.back();
  }

  loadStaffMedicos(): void {
    this.staffMedicoService.all().subscribe({
      next: (dp: DataPackage) => {
        this.staffMedicos = dp.data as StaffMedico[];
      },
      error: (err) => {
        console.error('Error al cargar Staff Médicos:', err);
        alert('No se pudieron cargar los datos del Staff Médico.');
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