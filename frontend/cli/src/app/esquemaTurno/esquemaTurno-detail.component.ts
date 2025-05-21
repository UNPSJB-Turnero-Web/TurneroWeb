import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EsquemaTurnoService } from './esquemaTurno.service';
import { EsquemaTurno } from './esquemaTurno';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { Consultorio } from '../consultorios/consultorio';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-esquema-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <!-- MODO VISTA -->
      <div *ngIf="!modoEdicion">
        <h2>Esquema de Turno #{{ esquema.id }}</h2>
        <p><b>Staff Médico:</b> 
          {{ esquema.staffMedico?.medico?.nombre }} {{ esquema.staffMedico?.medico?.apellido }}
          ({{ esquema.staffMedico?.especialidad?.nombre }})
        </p>
        <p><b>Consultorio:</b> {{ esquema.consultorio?.name }}</p>
        <p><b>Días:</b> {{ esquema.diasSemana?.join(', ') }}</p>
        <p><b>Hora Inicio:</b> {{ esquema.horaInicio }}</p>
        <p><b>Hora Fin:</b> {{ esquema.horaFin }}</p>
        <p><b>Intervalo:</b> {{ esquema.intervalo }} min</p>
        <button class="btn btn-danger" (click)="goBack()">Atrás</button>
        <button class="btn btn-primary" (click)="activarEdicion()">Editar</button>
      </div>

      <!-- MODO EDICIÓN -->
      <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
        <h2>
          <ng-container *ngIf="esquema.id && esquema.id !== 0; else nuevo">
            Editando Esquema de Turno #{{ esquema.id }}
          </ng-container>
          <ng-template #nuevo>
            Nuevo Esquema de Turno
          </ng-template>
        </h2>
        <div class="mb-3">
          <label class="form-label">Staff Médico</label>
          <select
            [(ngModel)]="esquema.staffMedico"
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
          <label class="form-label">Consultorio</label>
          <select
            [(ngModel)]="esquema.consultorio"
            name="consultorio"
            class="form-control"
            required
          >
            <option *ngFor="let consultorio of consultorios" [ngValue]="consultorio">
              {{ consultorio.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Días de la Semana</label>
          <select
            multiple
            [(ngModel)]="esquema.diasSemana"
            name="diasSemana"
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
            [(ngModel)]="esquema.horaInicio"
            name="horaInicio"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Hora Fin</label>
          <input
            type="time"
            class="form-control"
            [(ngModel)]="esquema.horaFin"
            name="horaFin"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Intervalo (minutos)</label>
          <input
            type="number"
            class="form-control"
            [(ngModel)]="esquema.intervalo"
            name="intervalo"
            required
            min="1"
          />
        </div>
        <button type="submit" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
})
export class EsquemaTurnoDetailComponent {
  esquema: EsquemaTurno = { id: 0, staffMedico: null as any, consultorio: null as any, diasSemana: [], horaInicio: '', horaFin: '', intervalo: 30, disponibilidadMedicoId: 0 };
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private esquemaTurnoService: EsquemaTurnoService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
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
      this.esquemaTurnoService.get(id).subscribe({
        next: (dataPackage) => {
          this.esquema = <EsquemaTurno>dataPackage.data;
          this.loadStaffMedicos();
          this.loadConsultorios();
        },
        error: (err) => {
          console.error('Error al obtener el esquema de turno:', err);
          alert('No se pudo cargar el esquema de turno. Intente nuevamente.');
        }
      });
    } else {
      // Modo nuevo
      this.modoEdicion = true;
      this.esNuevo = true;
      this.esquema = { id: 0, staffMedico: null as any, consultorio: null as any, diasSemana: [], horaInicio: '', horaFin: '', intervalo: 30, disponibilidadMedicoId: 0 };
      this.loadStaffMedicos();
      this.loadConsultorios();
    }
  }

  save(): void {
    if (this.esNuevo) {
      this.esquemaTurnoService.create(this.esquema).subscribe({
        next: () => {
          this.router.navigate(['/esquemaTurno']);
        },
        error: (error) => {
          console.error('Error al crear el esquema de turno:', error);
          alert('Error al crear el esquema de turno.');
        }
      });
    } else {
      this.esquemaTurnoService.update(this.esquema.id!, this.esquema).subscribe({
        next: () => {
          this.router.navigate(['/esquemaTurno']);
        },
        error: (error) => {
          console.error('Error al actualizar el esquema de turno:', error);
          alert('Error al actualizar el esquema de turno.');
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
      if (this.esquema.staffMedico) {
        const found = this.staffMedicos.find(s => s.id === this.esquema.staffMedico.id);
        if (found) this.esquema.staffMedico = found;
      }
    });
  }

  loadConsultorios(): void {
    this.consultorioService.getAll().subscribe((dp: DataPackage) => {
      this.consultorios = dp.data as Consultorio[];
      if (this.esquema.consultorio) {
        const found = this.consultorios.find(c => c.id === this.esquema.consultorio.id);
        if (found) this.esquema.consultorio = found;
      }
    });
  }
}