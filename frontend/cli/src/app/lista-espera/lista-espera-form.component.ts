import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListaEspera } from './lista-espera.model';
import { PacienteService } from '../pacientes/paciente.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { MedicoService } from '../medicos/medico.service';
import { DataPackage } from '../data.package';


@Component({
  selector: 'app-lista-espera-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{data ? 'Editar' : 'Nueva'}} Solicitud en Lista de Espera</h4>
      <button type="button" class="close" aria-label="Close" (click)="cerrar()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form [formGroup]="form">
        <!-- Campos del formulario -->
        <div class="form-group">
          <label for="pacienteId">Paciente*</label>
          <select class="form-control" id="pacienteId" formControlName="pacienteId" required>
            <option value="">Seleccione un paciente</option>
            <option *ngFor="let paciente of pacientes" [value]="paciente.id">
              {{paciente.nombre}} {{paciente.apellido}} - DNI: {{paciente.dni}}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="especialidadId">Especialidad*</label>
          <select class="form-control" id="especialidadId" formControlName="especialidadId" required>
            <option value="">Seleccione una especialidad</option>
            <option *ngFor="let esp of especialidades" [value]="esp.id">
              {{esp.nombre}}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="centroAtencionId">Centro de Atención*</label>
          <select class="form-control" id="centroAtencionId" formControlName="centroAtencionId" required>
            <option value="">Seleccione un centro</option>
            <option *ngFor="let centro of centros" [value]="centro.id">
              {{centro.nombre}}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="medicoId">Médico Preferido</label>
          <select class="form-control" id="medicoId" formControlName="medicoId">
            <option value="">Sin preferencia</option>
            <option *ngFor="let medico of medicos" [value]="medico.id">
              {{medico.nombre}} {{medico.apellido}}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="fechaDeseadaDesde">Fecha Deseada Desde</label>
            <input type="date" class="form-control" id="fechaDeseadaDesde" 
                   formControlName="fechaDeseadaDesde">
          </div>
          <div class="form-group col-md-6">
            <label for="fechaDeseadaHasta">Fecha Deseada Hasta</label>
            <input type="date" class="form-control" id="fechaDeseadaHasta" 
                   formControlName="fechaDeseadaHasta">
          </div>
        </div>

        <div class="form-group">
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="urgenciaMedica" 
                   formControlName="urgenciaMedica">
            <label class="custom-control-label" for="urgenciaMedica">
              Urgencia Médica
            </label>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="cerrar()">Cancelar</button>
      <button type="button" class="btn btn-primary" (click)="guardar()" 
              [disabled]="!form.valid">Guardar</button>
    </div>
  `
})
export class ListaEsperaFormComponent implements OnInit {
  @Input() data?: ListaEspera | null;
  @Output() save = new EventEmitter<ListaEspera>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  pacientes: any[] = [];
  especialidades: any[] = [];
  centros: any[] = [];
  medicos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private especialidadService: EspecialidadService,
    private centroService: CentroAtencionService,
    private medicoService: MedicoService
  ) {
    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      especialidadId: ['', Validators.required],
      centroAtencionId: ['', Validators.required],
      medicoId: [''],
      fechaDeseadaDesde: [''],
      fechaDeseadaHasta: [''],
      urgenciaMedica: [false]
    });
  }

  ngOnInit() {
    // Cargar datos necesarios (pacientes, especialidades, etc.)
    this.cargarDatos();
    // Si se pasó data por input, poblar el formulario
    if (this.data) {
      // convertir fechas si vienen como strings
      const patch = { ...this.data } as any;
      if (patch.fechaDeseadaDesde) patch.fechaDeseadaDesde = this.normalizeDate(patch.fechaDeseadaDesde);
      if (patch.fechaDeseadaHasta) patch.fechaDeseadaHasta = this.normalizeDate(patch.fechaDeseadaHasta);

      // Mapear medicoPreferidoId a medicoId para el formulario
      if (patch.medicoPreferidoId !== undefined) {
        patch.medicoId = patch.medicoPreferidoId;
      }

      this.form.patchValue(patch);
    }
  }

  cargarDatos() {
    // Pacientes
    this.pacienteService.all().subscribe({
      next: (res: DataPackage<any[]>) => {
        this.pacientes = res && res.data ? res.data : [];
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        this.pacientes = [];
      }
    });

    // Especialidades
    this.especialidadService.all().subscribe({
      next: (res: DataPackage<any[]>) => {
        this.especialidades = res && res.data ? res.data : [];
      },
      error: (err) => {
        console.error('Error cargando especialidades:', err);
        this.especialidades = [];
      }
    });

    // Centros de Atención
    // Algunos servicios usan `all()` y otros `getAll()`; aquí usamos `all()` y fallback a getAll
    this.centroService.all().subscribe({
      next: (res: DataPackage<any[]>) => {
        this.centros = res && res.data ? res.data : [];
      },
      error: (err) => {
        console.error('Error cargando centros:', err);
        // Intentar alternativa getAll si existe
        try {
          (this.centroService as any).getAll()?.subscribe?.((r: any) => {
            this.centros = r && r.data ? r.data : r || [];
          });
        } catch (e) {
          this.centros = [];
        }
      }
    });

    // Médicos
    this.medicoService.getAll().subscribe({
      next: (res: DataPackage<any[]>) => {
        this.medicos = res && res.data ? res.data : [];
      },
      error: (err) => {
        console.error('Error cargando medicos:', err);
        this.medicos = [];
      }
    });
  }

  guardar() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const solicitud: ListaEspera = {
        ...(this.data || {}),
        ...formValue,
        // Asegurar que medicoPreferidoId se establezca desde el medicoId seleccionado
        medicoPreferidoId: formValue.medicoId || null,
        // Si hay un médico seleccionado, obtener su nombre del array de médicos
        medicoPreferidoNombre: formValue.medicoId ?
          this.medicos.find(m => m.id === parseInt(formValue.medicoId))?.nombre + ' ' +
          this.medicos.find(m => m.id === parseInt(formValue.medicoId))?.apellido :
          null
      } as ListaEspera;
      this.save.emit(solicitud);
    }
  }

  cerrar() {
    this.cancel.emit();
  }

  // Utility: normaliza valores de fecha (Date o string) a yyyy-MM-dd (valor aceptado por input[type=date])
  private normalizeDate(value: any): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      const d = value as Date;
      return d.toISOString().substring(0, 10);
    }
    // si viene como string en formato ISO u otro, intentar parsear
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().substring(0, 10);
    }
    return null;
  }
}