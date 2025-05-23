import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { EsquemaTurnoService } from './esquemaTurno.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { EsquemaTurno } from './esquemaTurno';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { Consultorio } from '../consultorios/consultorio';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

@Component({
  selector: 'app-esquema-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4 d-flex justify-content-center" *ngIf="esquema">
      <div class="card shadow-sm p-4" style="max-width: 600px; width: 100%; border-radius: 1rem;">
        <h2 class="mb-4 text-center">
          {{ esNuevo ? 'Nuevo Esquema de Turno' : 'Editando Esquema #' + esquema.id }}
        </h2>
        <form (ngSubmit)="save()" #form="ngForm">
          <!-- Selección de Disponibilidad Médica -->
          <div class="mb-3">
            <label class="form-label">Disponibilidad Médica</label>
            <select
              [(ngModel)]="selectedDisponibilidadId"
              name="disponibilidadMedicoId"
              class="form-select"
              [disabled]="!modoEdicion"
              required
              (change)="onDisponibilidadChange()"
            >
              <option [ngValue]="null">Seleccione una disponibilidad...</option>
              <option *ngFor="let disp of disponibilidadesMedico" [ngValue]="disp.id">
                {{ getDisponibilidadLabel(disp) }}
              </option>
            </select>
          </div>
          <!-- El resto del formulario -->
          <div class="mb-3">
            <label class="form-label">Staff Médico</label>
            <input
              class="form-control"
              [value]="getStaffMedicoNombre(esquema.staffMedicoId)"
              disabled
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Días de la Semana</label>
            <input
              class="form-control"
              [value]="esquema.diasSemana?.join(', ')"
              disabled
            />
          </div>
          <div class="mb-3 row">
            <div class="col">
              <label class="form-label">Hora Inicio</label>
              <input
                type="time"
                class="form-control"
                [(ngModel)]="esquema.horaInicio"
                name="horaInicio"
                [disabled]="true"
                required
              />
            </div>
            <div class="col">
              <label class="form-label">Hora Fin</label>
              <input
                type="time"
                class="form-control"
                [(ngModel)]="esquema.horaFin"
                name="horaFin"
                [disabled]="true"
                required
              />
            </div>
          </div>
          <!-- Consultorio editable -->
          <div class="mb-3">
            <label class="form-label">Consultorio</label>
            <select
              [(ngModel)]="esquema.consultorio"
              name="consultorioId"
              class="form-select"
              [disabled]="!modoEdicion"
              required
            >
              <option *ngFor="let consultorio of consultorios" [value]="consultorio.id">
                {{ consultorio.name }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Intervalo (minutos)</label>
            <input
              type="number"
              class="form-control"
              [(ngModel)]="esquema.intervalo"
              name="intervalo"
              [disabled]="!modoEdicion"
              required
              min="1"
            />
          </div>
          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-secondary" (click)="goBack()">
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
  `
})
export class EsquemaTurnoDetailComponent {
  esquema: EsquemaTurno = {
    id: 0,
    staffMedicoId: null as any,
    consultorioId: null as any,
    disponibilidadMedicoId: null as any,
    diasSemana: [],
    horaInicio: '',
    horaFin: '',
    intervalo: 15
  } as EsquemaTurno;
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  disponibilidadesMedico: DisponibilidadMedico[] = [];
  selectedDisponibilidadId: number | null = null;
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private esquemaTurnoService: EsquemaTurnoService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
    private disponibilidadMedicoService: DisponibilidadMedicoService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.loadDisponibilidadesMedico();
    this.get();
    
    this.loadStaffMedicos();
    
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'esquema-turno/new') {
      this.modoEdicion = true;
      this.esNuevo = true;
      this.esquema = {
        id: 0,
        staffMedicoId: null as any,
        consultorioId: null as any,
        disponibilidadMedicoId: null as any,
        diasSemana: [],
        horaInicio: '',
        horaFin: '',
        intervalo: 15
      } as EsquemaTurno;
      this.loadStaffMedicos();
      this.loadDisponibilidadesMedico();
    } else if (path === 'esquema-turno/:id') {
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;

      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) {
        console.error('El ID proporcionado no es válido.');
        return;
      }

      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }

      // Primero cargar staff y disponibilidades, luego el esquema
      Promise.all([
        new Promise<void>(resolve => this.loadStaffMedicos(resolve)),
        new Promise<void>(resolve => this.loadDisponibilidadesMedico(resolve))
      ]).then(() => {
        this.esquemaTurnoService.get(id).subscribe({
          next: (resp) => {
            console.log(resp.data)
            if (!resp.data) {
              alert('No se encontró el esquema de turno.');
              return;
            }
            this.esquema = resp.data as EsquemaTurno;
            // Solo asigna si existe la propiedad
            this.selectedDisponibilidadId = this.esquema.disponibilidadMedicoId ?? null;
            this.onDisponibilidadChange();
          },
          error: () => {
            alert('No se pudo cargar el esquema de turno.');
          }
        });
      });
    } else {
      console.error('Ruta no reconocida.');
    }
  }

  // Modifica los métodos para aceptar un callback opcional:
  loadDisponibilidadesMedico(callback?: () => void): void {
    this.disponibilidadMedicoService.all().subscribe(dp => {
      this.disponibilidadesMedico = dp.data as DisponibilidadMedico[];
      if (callback) callback();
    });
  }

  loadStaffMedicos(callback?: () => void): void {
    this.staffMedicoService.all().subscribe(dp => {
      this.staffMedicos = dp.data as StaffMedico[];
      if (callback) callback();
    });
  }

  onDisponibilidadChange(): void {
    const disp = this.disponibilidadesMedico.find(d => d.id === this.selectedDisponibilidadId);
    if (disp) {
      // Solo actualizar campos si es un esquema nuevo
      if (this.esNuevo) {
        this.esquema.staffMedicoId = disp.staffMedicoId;
        this.esquema.diasSemana = Array.isArray(disp.diaSemana) ? disp.diaSemana : [disp.diaSemana];
        this.esquema.horaInicio = disp.horaInicio;
        this.esquema.horaFin = disp.horaFin;
        this.esquema.disponibilidadMedicoId = disp.id;
      }
      // Siempre actualizar consultorios según staff
      const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
      if (staff && staff.centroAtencionId) {
        this.consultorioService.getByCentroAtencion(staff.centroAtencionId).subscribe(dp => {
          this.consultorios = dp.data as Consultorio[];
        });
      } else {
        this.consultorios = [];
      }
    }
  }

  getDisponibilidadLabel(disp: DisponibilidadMedico): string {
    const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
    return staff
      ? `${staff.medicoNombre} (${staff.especialidadNombre}) - ${disp.diaSemana?.join(', ')} ${disp.horaInicio}-${disp.horaFin}`
      : `ID ${disp.id}`;
  }

  getStaffMedicoNombre(staffMedicoId: number): string {
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    return staff ? `${staff.medicoNombre} (${staff.especialidadNombre})` : '';
  }

  save(): void {
    const payload = { ...this.esquema };
    this.esquemaTurnoService.create(payload).subscribe({
      next: () => this.router.navigate(['/esquema-turno']),
      error: (error) => {
        alert('Error al guardar el esquema de turno.');
      }
    });
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  goBack(): void {
    this.location.back();
  }
}