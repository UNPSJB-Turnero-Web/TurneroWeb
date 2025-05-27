import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
          <!-- Mostrar Horarios de la Disponibilidad Seleccionada -->
          <div class="mb-3">
            <label class="form-label">Horarios Disponibles</label>
            <table class="table table-bordered table-striped">
              <thead class="table-light">
                <tr>
                  <th>Día</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let horario of esquema.horarios">
                  <td>{{ horario.dia }}</td>
                  <td>{{ horario.horaInicio }}</td>
                  <td>{{ horario.horaFin }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Consultorio editable -->
          <div class="mb-3">
            <label class="form-label">Consultorio</label>
            <select
              [(ngModel)]="esquema.consultorioId"
              name="consultorioId"
              class="form-select"
              [disabled]="!modoEdicion"
              required
            >
              <option *ngFor="let consultorio of consultorios" [value]="consultorio.id">
                {{ consultorio.nombre }}
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
    centroId: null as any,
    horarios: [],
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

    this.esquemaTurnoService.get(id).subscribe({
      next: (esquema) => {
        console.log('Esquema recibido del backend:', esquema);
        this.esquema = esquema;

        // Asignar la disponibilidad seleccionada
        this.selectedDisponibilidadId = this.esquema.disponibilidadMedicoId ?? null;

        // Cargar los consultorios directamente usando el centroId del esquema
        if (this.esquema.centroId) {
          this.loadConsultorios(this.esquema.centroId);
        }
      },
      error: (err) => {
        console.error('Error al cargar el esquema de turno:', err);
        alert('No se pudo cargar el esquema de turno.');
      }
    });
  }
}

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
      this.esquema.staffMedicoId = disp.staffMedicoId;
      this.esquema.horarios = disp.horarios.map(horario => ({
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      }));
      this.esquema.disponibilidadMedicoId = disp.id;

      // Obtener el staff médico asociado
      const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
      if (staff) {
        this.esquema.centroId = staff.centro?.id ?? 0; // Asignar el centroId si existe, o 0 como valor predeterminado
      } else {
        this.esquema.centroId = 0; // Si no hay staff asociado, asignar 0 como valor predeterminado
      }
    }

    // Cargar los consultorios asociados al centro de atención
    if (this.esquema.centroId) {
      this.loadConsultorios(this.esquema.centroId);
    } else {
      this.consultorios = []; // Limpiar consultorios si no hay centro asociado
    }
  }
  loadConsultorios(centroId: number): void {
    this.consultorioService.getByCentroAtencion(centroId).subscribe({
      next: (dp) => {
        this.consultorios = dp.data as Consultorio[];
        console.log('Consultorios cargados:', this.consultorios);

        // Asignar el consultorioId al modelo si está disponible
        if (this.esquema.consultorioId) {
          const consultorio = this.consultorios.find(c => c.id === this.esquema.consultorioId);
          if (consultorio) {
            this.esquema.consultorioId = consultorio.id;
          } else {
            console.warn('El consultorio asociado no se encuentra en la lista de consultorios cargados.');
          }
        }
      },
      error: () => {
        console.error('Error al cargar los consultorios.');
        this.consultorios = [];
      }
    });
  }

  getDisponibilidadLabel(disp: DisponibilidadMedico): string {
    const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
    if (!staff) return `ID ${disp.id}`;

    const medicoNombre = staff.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Sin médico';
    const especialidadNombre = staff.especialidad ? staff.especialidad.nombre : 'Sin especialidad';

    const horarios = disp.horarios
      .map(horario => `${horario.dia}: ${horario.horaInicio}-${horario.horaFin}`)
      .join(', ');

    return `${medicoNombre} (${especialidadNombre}) - ${horarios}`;
  }

  save(): void {
    const payload = { ...this.esquema };

    // Agregar un log para verificar el contenido del payload
    console.log('Payload enviado al backend:', payload);

    // Validar que los campos requeridos no sean null
    if (!payload.disponibilidadMedicoId || !payload.consultorioId || !payload.staffMedicoId || !payload.centroId) {
      alert('Debe completar todos los campos obligatorios.');
      return;
    }

    this.esquemaTurnoService.create(payload).subscribe({
      next: () => this.router.navigate(['/esquema-turno']),
      error: (err) => {
        console.error('Error al guardar el esquema de turno:', err);
        alert('Error al guardar el esquema de turno.');
      }
    });
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  goBack(): void {
    this.location.back();
  }

}