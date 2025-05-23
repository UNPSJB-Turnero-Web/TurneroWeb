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
        <p><b>Consultorio:</b> {{ getConsultorioNombre() }}</p>
        <p><b>Días:</b> {{ esquema?.diasSemana?.join(', ') }}</p>
        <p><b>Hora Inicio:</b> {{ esquema?.horaInicio }}</p>
        <p><b>Hora Fin:</b> {{ esquema?.horaFin }}</p>
        <p><b>Intervalo:</b> {{ esquema?.intervalo }} min</p>
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
              {{ disp.staffMedicoNombre }} - {{ disp.especialidadNombre }} - {{ disp.centroAtencionNombre }} - {{ disp.diaSemana.join(', ') }} - {{ disp.horaInicio }} a {{ disp.horaFin }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Staff Médico</label>
          <input class="form-control"
  [value]="selectedDisponibilidad?.staffMedicoNombre + ' (' + selectedDisponibilidad?.especialidadNombre + ')'"
          readonly
          />
        </div>
        <div class="mb-3">
  <label class="form-label">Centro Médico</label>
  <select class="form-control"
          [(ngModel)]="esquema.centroAtencion"
          name="centroAtencion"
          required>
    <option [ngValue]="null">Seleccione un centro médico</option>
    <option *ngFor="let centro of centrosMedicosFiltrados" [ngValue]="centro">
      {{ centro.name }}
    </option>
  </select>
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
  esquema: any = {
    consultorio: null,
    disponibilidadMedicoId: null,
    diasSemana: [],
    horaInicio: '',
    horaFin: '',
    intervalo: null,
  };
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  disponibilidades: any[] = [];
  selectedDisponibilidad: any = null;
  centrosMedicos: CentroAtencion[] = [];
  centrosMedicosFiltrados: CentroAtencion[] = [];
  consultoriosFiltrados: Consultorio[] = [];
  selectedCentroMedicoId: number | null = null;
  loading: boolean = true;
  modoEdicion = false;
  esNuevo = false;
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.esquemaTurnoService.get(id).subscribe({
        next: (dataPackage) => {
          this.esquema = dataPackage.data;

          // Cargar staff médicos y disponibilidades en paralelo
          this.staffMedicoService.all().subscribe({
            next: (dp) => {
              this.staffMedicos = dp.data as StaffMedico[];

              this.disponibilidadMedicoService.all().subscribe({
                next: (disponibilidades) => {
                  // Cruzar staffMedicoId con staffMedicos para armar los textos
                  this.disponibilidades = disponibilidades.data.map((disp: any) => {
                    const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
                    return {
                      ...disp,
                      staffMedicoNombre: staff ? staff.medicoNombre : '',
                      especialidadNombre: staff ? staff.especialidadNombre : '',
                      centroAtencionNombre: staff ? staff.centroAtencionName : '',
                    };
                  });

                  // Seleccionar la disponibilidad actual si existe
                  this.selectedDisponibilidad = this.disponibilidades.find(
                    (disp: any) => disp.id === this.esquema.disponibilidadMedicoId
                  );
                  if (this.selectedDisponibilidad) {
                    this.onDisponibilidadChange();
                  }
                },
                error: (err) => {
                  console.error('Error al cargar disponibilidades:', err);
                },
              });
            },
            error: (err) => {
              console.error('Error al cargar staff médicos:', err);
            }
          });

          // Cargar consultorios
          this.consultorioService.getAll().subscribe({
            next: (dp) => {
              this.consultorios = dp.data as Consultorio[];
              console.log('Consultorios cargados:', this.consultorios); // <-- Agrega esto
              if (this.esquema.consultorio) {
                const found = this.consultorios.find(c => c.id === this.esquema.consultorio.id);
                if (found) this.esquema.consultorio = found;
              }
            },
            error: (err) => {
              console.error('Error al cargar consultorios:', err);
            },
          });

          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar el esquema:', err);
          this.loading = false;
        },
      });
    } else {
      // MODO NUEVO: cargar staff y disponibilidades
      this.esNuevo = true;
      this.staffMedicoService.all().subscribe({
        next: (dp) => {
          this.staffMedicos = dp.data as StaffMedico[];
          this.disponibilidadMedicoService.all().subscribe({
            next: (disponibilidades) => {
              this.disponibilidades = disponibilidades.data.map((disp: any) => {
                const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
                return {
                  ...disp,
                  staffMedicoNombre: staff ? staff.medicoNombre : '',
                  especialidadNombre: staff ? staff.especialidadNombre : '',
                  centroAtencionNombre: staff ? staff.centroAtencionName : '',
                };
              });
            },
            error: (err) => {
              console.error('Error al cargar disponibilidades:', err);
            },
          });
        },
        error: (err) => {
          console.error('Error al cargar staff médicos:', err);
        }
      });

      // Consultorios (opcional, si querés que ya estén cargados)
      this.consultorioService.getAll().subscribe({
        next: (dp) => {
          this.consultorios = dp.data as Consultorio[];
        },
        error: (err) => {
          console.error('Error al cargar consultorios:', err);
        },
      });

      this.loading = false;
    }
  }

  save(): void {
    if (this.selectedDisponibilidad) {
      this.esquema.diasSemana = [...this.selectedDisponibilidad.diaSemana];
      this.esquema.horaInicio = this.selectedDisponibilidad.horaInicio;
      this.esquema.horaFin = this.selectedDisponibilidad.horaFin;
      this.esquema.disponibilidadMedicoId = this.selectedDisponibilidad.id;
      this.esquema.staffMedicoId = this.selectedDisponibilidad.staffMedicoId;

      // Asegurá que el centro de atención esté bien seteado
      if (this.esquema.consultorio && this.esquema.consultorio.centroAtencion) {
        this.esquema.centroAtencion = this.esquema.consultorio.centroAtencion;
      } else if (this.centrosMedicosFiltrados.length > 0) {
        this.esquema.centroAtencion = this.centrosMedicosFiltrados[0];
      } else {
        this.esquema.centroAtencion = null;
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
    this.staffMedicoService.all().subscribe({
      next: (dp) => {
        this.staffMedicos = dp.data as StaffMedico[];
        // Ahora sí podés mapear las disponibilidades con los datos completos
        this.disponibilidades = this.disponibilidades.map((disp) => {
          const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
          return {
            ...disp,
            staffMedicoNombre: staff ? `${staff.medicoNombre} (${staff.especialidadNombre})` : '',
            centroAtencionNombre: staff?.centroAtencionName ?? '',
          };
        });
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

      // Buscar el staff médico seleccionado
      const staff = this.staffMedicos.find(s => s.id === this.selectedDisponibilidad.staffMedicoId);
      if (staff && staff.centroAtencionId) {
        // Consultar consultorios del centro de atención desde el backend
        this.consultorioService.getByCentroAtencion(staff.centroAtencionId).subscribe({
          next: (dp) => {
            this.consultoriosFiltrados = dp.data as Consultorio[];
            // Limpiar consultorio si no pertenece al nuevo centro
            if (!this.consultoriosFiltrados.some(c => c.id === this.esquema.consultorio?.id)) {
              this.esquema.consultorio = null;
            }
          },
          error: () => {
            this.consultoriosFiltrados = [];
            this.esquema.consultorio = null;
          }
        });

        // Consultar el centro de atención desde el backend
        this.centroAtencionService.get(staff.centroAtencionId).subscribe({
          next: (centro) => {
            this.centrosMedicosFiltrados = [centro.data];
            this.esquema.centroAtencion = centro.data;
          },
          error: () => {
            this.centrosMedicosFiltrados = [];
            this.esquema.centroAtencion = null;
          }
        });
      } else {
        this.consultoriosFiltrados = [];
        this.centrosMedicosFiltrados = [];
        this.esquema.centroAtencion = null;
        this.esquema.consultorio = null;
      }
    }
  }

  getMedicoNombre(): string {
    // Si hay una disponibilidad seleccionada, usá sus campos
    if (this.selectedDisponibilidad) {
      return `${this.selectedDisponibilidad.medicoNombre ?? ''} ${this.selectedDisponibilidad.medicoApellido ?? ''}`.trim();
    }
    // Si no, buscá la disponibilidad por ID
    const disp = this.disponibilidades.find(d => d.id === this.esquema.disponibilidadMedicoId);
    if (disp) {
      return `${disp.medicoNombre ?? ''} ${disp.medicoApellido ?? ''}`.trim();
    }
    return '';
  }

  getEspecialidadNombre(): string {
    if (this.selectedDisponibilidad) {
      return this.selectedDisponibilidad.especialidadNombre ?? '';
    }
    const disp = this.disponibilidades.find(d => d.id === this.esquema.disponibilidadMedicoId);
    return disp ? disp.especialidadNombre ?? '' : '';
  }

  getConsultorioNombre(): string {
    if (this.esquema.consultorio && typeof this.esquema.consultorio === 'object' && this.esquema.consultorio.name) {
      return this.esquema.consultorio.name;
    }
    if (this.esquema.consultorio && this.consultorios.length) {
      const cons = this.consultorios.find(c => c.id === this.esquema.consultorio.id);
      return cons ? cons.name : '';
    }
    return '';
  }
}