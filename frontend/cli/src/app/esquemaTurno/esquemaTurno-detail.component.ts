import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EsquemaTurnoService } from './esquemaTurno.service';
import { EsquemaTurno } from './esquemaTurno';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { Consultorio } from '../consultorios/consultorio';
import { DataPackage } from '../data.package';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';

@Component({
  selector: 'app-esquema-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <!-- MODO VISTA -->
      <div *ngIf="!modoEdicion">
        <h2>Esquema de Turno #{{ esquema.id }}</h2>
        <p><b>Staff Médico:</b> {{ getMedicoNombre() }} ({{ getEspecialidadNombre() }})</p>
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
        <div class="mb-3">
          <label class="form-label">Disponibilidad Médica</label>
          <select
            class="form-control"
            [(ngModel)]="selectedDisponibilidad"
            name="disponibilidadMedico"
            (change)="onDisponibilidadChange()"
            required
          >
            <option [ngValue]="null">Seleccione una disponibilidad</option>
            <option *ngFor="let disp of disponibilidades" [ngValue]="disp">
              {{ disp.staffMedico?.medico?.nombre }} {{ disp.staffMedico?.medico?.apellido }} ({{ disp.staffMedico?.especialidad?.nombre }}) - 
              {{ disp.diaSemana.join(', ') }} - {{ disp.horaInicio }} a {{ disp.horaFin }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Staff Médico</label>
          <input class="form-control"
  [value]="selectedDisponibilidad?.staffMedico?.medico?.nombre + ' ' + selectedDisponibilidad?.staffMedico?.medico?.apellido + ' (' + selectedDisponibilidad?.staffMedico?.especialidad?.nombre + ')'"
  readonly
/>
        </div>
                <div class="mb-3">
          <label class="form-label">Centro Médico</label>
          <input class="form-control"
    [value]="selectedDisponibilidad?.staffMedico?.centro?.name"
    readonly
  />
        </div>
        <div class="mb-3">
          <label class="form-label">Consultorio</label>
          <select class="form-control"
    [(ngModel)]="esquema.consultorio"
    name="consultorio"
    required>
    <option [ngValue]="null">Seleccione un consultorio</option>
    <option *ngFor="let cons of consultoriosFiltrados" [ngValue]="cons">
      {{ cons.name }}
    </option>
  </select>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Días de la Semana</label>
          <input class="form-control" [value]="selectedDisponibilidad?.diaSemana?.join(', ')" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">Hora Inicio</label>
          <input class="form-control" [value]="selectedDisponibilidad?.horaInicio" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">Hora Fin</label>
          <input class="form-control" [value]="selectedDisponibilidad?.horaFin" readonly />
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
  esquema: EsquemaTurno = { id: 0, staffMedicoId: null as any, consultorio: null as any, diasSemana: [], horaInicio: '', horaFin: '', intervalo: 30, disponibilidadMedicoId: 0 };
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  modoEdicion = false;
  esNuevo = false;
  disponibilidades: any[] = [];
  selectedDisponibilidad: any = null;
  centrosMedicos: any[] = [];
  consultoriosFiltrados: Consultorio[] = [];
  selectedCentroMedicoId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private esquemaTurnoService: EsquemaTurnoService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
    private location: Location,
    private disponibilidadMedicoService: DisponibilidadMedicoService,
    private centroAtencionService: CentroAtencionService
  ) { }

  ngOnInit(): void {
    this.disponibilidadMedicoService.all().subscribe((dp: DataPackage) => {
      this.disponibilidades = dp.data;
      this.disponibilidades.forEach((disp: any, idx: number) => {
        if (!disp.staffMedico && disp.staffMedicoId) {
          this.staffMedicoService.get(disp.staffMedicoId).subscribe((staffDP: DataPackage) => {
            this.disponibilidades[idx].staffMedico = staffDP.data;
          });
        }
      });
    });
    this.centroAtencionService.all().subscribe((dp: DataPackage) => {
      this.centrosMedicos = dp.data;
    });
    this.consultorioService.getAll().subscribe((dp: DataPackage) => {
      this.consultorios = dp.data;
    });
    this.get();
  }

  get(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('ID param:', idParam);
    if (idParam) {
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;
      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }
      this.esquemaTurnoService.get(id).subscribe({
        next: (dataPackage) => {
          const data = dataPackage.data;
          this.esquema = <EsquemaTurno>data;

          // Si solo tienes el ID, busca el objeto completo
          if (data.staffMedicoId && !data.staffMedicoId) {
            this.staffMedicoService.get(data.staffMedicoId).subscribe((staffDP: DataPackage) => {
              this.esquema.staffMedicoId = staffDP.data;
            });
          }
          if (data.consultorio && data.consultorio.id) {
            this.consultorioService.getAll().subscribe((consDP: DataPackage) => {
              this.esquema.consultorio = consDP.data;
            });
          }
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
      this.esquema = { id: 0, staffMedicoId: null as any, consultorio: null as any, diasSemana: [], horaInicio: '', horaFin: '', intervalo: 30, disponibilidadMedicoId: 0 };
      this.loadStaffMedicos();
      this.loadConsultorios();
    }
  }

  save(): void {
    if (this.selectedDisponibilidad) {
      // Usa el nombre correcto que espera el backend
      this.esquema.diasSemana = [...this.selectedDisponibilidad.diaSemana];


      this.esquema.horaInicio = this.selectedDisponibilidad.horaInicio;
      this.esquema.horaFin = this.selectedDisponibilidad.horaFin;
      this.esquema.disponibilidadMedicoId = this.selectedDisponibilidad.id;
      this.esquema.staffMedicoId = this.selectedDisponibilidad.staffMedicoId;
      if (this.esquema.consultorio && this.esquema.consultorio.centroAtencion) {
        this.esquema.centroAtencion = this.esquema.consultorio.centroAtencion;
      }
      console.log('selectedDisponibilidad:', this.selectedDisponibilidad);
      console.log('esquema a enviar:', this.esquema);
    }
    if (this.esNuevo) {
      this.esquemaTurnoService.create(this.esquema).subscribe({
        next: () => this.router.navigate(['/esquema-turno']),
        error: (error) => {
          console.error('Error al crear el esquema de turno:', error);
          alert('Error al crear el esquema de turno.');
        }
      });
    } else {
      this.esquemaTurnoService.update(this.esquema.id!, this.esquema).subscribe({
        next: () => this.router.navigate(['/esquema-turno']),
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
      if (this.esquema.staffMedicoId) {
        const found = this.staffMedicos.find(s => s.id === this.esquema.staffMedicoId);
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

  onStaffMedicoChange() {
    if (this.esquema.staffMedicoId) {
      this.disponibilidadMedicoService.byStaffMedico(this.esquema.staffMedicoId).subscribe((dp: DataPackage) => {
        this.disponibilidades = dp.data;
      });
    } else {
      this.disponibilidades = [];
    }
  }

  onDisponibilidadChange() {
    if (this.selectedDisponibilidad) {
      this.esquema.disponibilidadMedicoId = this.selectedDisponibilidad.id;
      this.esquema.staffMedicoId = this.selectedDisponibilidad.staffMedicoId;
      this.esquema.diasSemana = this.selectedDisponibilidad.diaSemana;
      this.esquema.horaInicio = this.selectedDisponibilidad.horaInicio;
      this.esquema.horaFin = this.selectedDisponibilidad.horaFin;

      // Traer el staff médico completo por ID
      this.staffMedicoService.get(this.selectedDisponibilidad.staffMedicoId).subscribe((dp: DataPackage) => {
        this.selectedDisponibilidad.staffMedico = dp.data;

        // Usa 'centro' en vez de 'centroAtencion'
        const centroId = this.selectedDisponibilidad.staffMedico?.centro?.id;
        this.selectedCentroMedicoId = centroId ?? null;

        // Filtra consultorios por centro
        this.consultoriosFiltrados = this.consultorios.filter(
          c => c.centroAtencion?.id === this.selectedCentroMedicoId || c.centroAtencion?.id === this.selectedCentroMedicoId
        );

        // Si la disponibilidad tiene consultorio sugerido, lo selecciona automáticamente
        // (esto depende de tu modelo, si lo tienes en la disponibilidad)
        // Si no, puedes dejarlo para que el usuario lo seleccione.
        // Ejemplo:
        // this.esquema.consultorio = this.consultoriosFiltrados[0] ?? null;
      });
    }
  }

  getMedicoNombre(): string {
    const staff = this.esquema.staffMedico ?? this.staffMedicos.find(s => s.id === this.esquema.staffMedicoId);
    if (!staff) return '';
    // Si tienes una lista de médicos aparte, puedes buscar el nombre por ID aquí
    // Si tu StaffMedico tiene campos medicoNombre y medicoApellido, usa eso:
    if ('medicoNombre' in staff && 'medicoApellido' in staff) {
      return `${(staff as any).medicoNombre} ${(staff as any).medicoApellido}`;
    }
    return '';
  }

  getEspecialidadNombre(): string {
    const staff = this.esquema.staffMedico ?? this.staffMedicos.find(s => s.id === this.esquema.staffMedicoId);
    if (!staff) return '';
    if ('especialidadNombre' in staff) {
      return (staff as any).especialidadNombre;
    }
    return '';
  }
}