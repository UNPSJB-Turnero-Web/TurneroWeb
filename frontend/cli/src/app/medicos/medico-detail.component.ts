import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicoService } from './medico.service';
import { Medico } from './medico';
import { Especialidad } from '../especialidades/especialidad';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4" *ngIf="medico">
      <!-- MODO VISTA -->
      <div *ngIf="!modoEdicion">
        <h2>Médico: {{ medico.nombre }} {{ medico.apellido }}</h2>
        <p><b>DNI:</b> {{ medico.dni }}</p>
        <p><b>Matrícula:</b> {{ medico.matricula }}</p>
        <p><b>Especialidad:</b> {{ medico.especialidades.nombre }}</p>
        <button class="btn btn-danger" (click)="goBack()">Atrás</button>
        <button class="btn btn-primary ms-2" (click)="activarEdicion()">Editar</button>
      </div>

      <!-- MODO EDICIÓN -->
      <form *ngIf="modoEdicion" #form="ngForm" (ngSubmit)="save()">
        <h2>
          <ng-container *ngIf="medico && medico.id; else nuevo">
            Editando médico: {{ medico.nombre }} {{ medico.apellido }}
          </ng-container>
          <ng-template #nuevo>
            Nuevo Médico
          </ng-template>
        </h2>
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            [(ngModel)]="medico.nombre"
            name="nombre"
            class="form-control"
            required
            #nombre="ngModel"
          />
          <div *ngIf="nombre.invalid && (nombre.dirty || nombre.touched)" class="alert">
            <div *ngIf="nombre.errors?.['required']">El nombre es requerido</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Apellido</label>
          <input
            [(ngModel)]="medico.apellido"
            name="apellido"
            class="form-control"
            required
            #apellido="ngModel"
          />
          <div *ngIf="apellido.invalid && (apellido.dirty || apellido.touched)" class="alert">
            <div *ngIf="apellido.errors?.['required']">El apellido es requerido</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">DNI</label>
          <input
            [(ngModel)]="medico.dni"
            name="dni"
            class="form-control"
            required
            #dni="ngModel"
          />
          <div *ngIf="dni.invalid && (dni.dirty || dni.touched)" class="alert">
            <div *ngIf="dni.errors?.['required']">El DNI es requerido</div>
            <div *ngIf="dni.errors?.['min']">El DNI debe ser mayor a 0</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Matrícula</label>
          <input
            [(ngModel)]="medico.matricula"
            name="matricula"
            class="form-control"
            required
            #matricula="ngModel"
          />
          <div *ngIf="matricula.invalid && (matricula.dirty || matricula.touched)" class="alert">
            <div *ngIf="matricula.errors?.['required']">La matrícula es requerida</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Especialidad</label>
          <select
            [(ngModel)]="selectedEspecialidad"
            name="especialidad"
            class="form-control"
            required
            [compareWith]="compareEspecialidad"
            #especialidad="ngModel"
          >
            <option *ngFor="let especialidad of especialidades" [ngValue]="especialidad">
              {{ especialidad.nombre }}
            </option>
          </select>
          <div *ngIf="especialidad.invalid && (especialidad.dirty || especialidad.touched)" class="alert">
            <div *ngIf="especialidad.errors?.['required']">La especialidad es requerida</div>
          </div>
        </div>
        <button type="submit" class="btn btn-success"
          [disabled]="form.invalid || allFieldsEmpty()">Guardar</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="cancelar()">Cancelar</button>
        <button *ngIf="medico.id" type="button" class="btn btn-outline-danger ms-2" (click)="remove()">Eliminar</button>
      </form>
    </div>
  `,
  styles: []
})
export class MedicoDetailComponent implements OnInit {
  medico: Medico = { id: 0, nombre: '', apellido: 'ASDASD', dni: '', matricula: '', especialidades: { id: 0, nombre: '', descripcion: '' } };
  especialidades: Especialidad[] = [];
  selectedEspecialidad!: Especialidad;
  modoEdicion = false;

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "medicos/new") {
      this.modoEdicion = true;
      this.especialidadService.all().subscribe((dp: DataPackage<Especialidad[]>) => {
        this.especialidades = dp.data;
        this.selectedEspecialidad = this.especialidades[0];
        this.medico = {
          id: 0,
          nombre: "",
          apellido: "",
          dni: '',
          matricula: "",
          especialidades: this.selectedEspecialidad
        };
      });
    } else {
      this.especialidadService.all().subscribe((dp: DataPackage<Especialidad[]>) => {
        this.especialidades = dp.data;
        console.log('Especialidades:', this.especialidades);
        if (!this.especialidades.length) {
          alert('No hay especialidades cargadas. Debe crear al menos una.');
          this.goBack();
          return;
        }
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.medicoService.getById(id).subscribe((resp: DataPackage<Medico>) => {
          this.medico = resp.data;
          console.log('Medico:', this.medico);
          // --- CRÍTICO: Verificación robusta ---
          if (!this.medico.especialidades) {
            this.selectedEspecialidad = this.especialidades[0];
            this.medico.especialidades = this.selectedEspecialidad;
          } else {
            // Solo buscar si especialidad existe y tiene id
            const especialidadId = this.medico.especialidades?.id;
            const especialidadEncontrada = especialidadId
              ? this.especialidades.find(e => e.id === especialidadId)
              : undefined;
            this.selectedEspecialidad = especialidadEncontrada || this.especialidades[0];
            this.medico.especialidades = this.selectedEspecialidad;
          }
        });
        this.route.queryParams.subscribe(params => {
          this.modoEdicion = params['edit'] === 'true';
        });
      });
    }
  }

  save(): void {
    if (!this.selectedEspecialidad?.id) {
      alert("Debe seleccionar una especialidad válida.");
      return;
    }
    this.medico.especialidades= this.selectedEspecialidad;
    const op = this.medico.id
      ? this.medicoService.update(this.medico.id, this.medico)
      : this.medicoService.create(this.medico);
    op.subscribe(() => {
      this.router.navigate(['/medicos']);
    });
  }

  goBack(): void {
    this.router.navigate(['/medicos']);
  }

  cancelar(): void {
    if (this.medico.id) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: 'merge'
      });
      this.modoEdicion = false;
    } else {
      this.goBack();
    }
  }

  activarEdicion(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: true },
      queryParamsHandling: 'merge'
    });
    this.modoEdicion = true;
  }

  compareEspecialidad(e1: Especialidad, e2: Especialidad): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }

  allFieldsEmpty(): boolean {
    return !this.medico?.nombre &&
      !this.medico?.apellido &&
      !this.medico?.dni &&
      !this.medico?.matricula &&
      !this.selectedEspecialidad;
  }

  remove(): void {
    if (!this.medico.id) return;
    if (confirm('¿Está seguro que desea eliminar este médico?')) {
      this.medicoService.delete(this.medico.id).subscribe(() => {
        this.goBack();
      });
    }
  }
}
