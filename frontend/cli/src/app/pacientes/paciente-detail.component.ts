import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4" *ngIf="paciente">
      <!-- MODO VISTA -->
      <div *ngIf="!modoEdicion">
        <h2>Paciente: {{ paciente.nombre }} {{ paciente.apellido }}</h2>
        <p><b>Email:</b> {{ paciente.email }}</p>
        <p><b>Teléfono:</b> {{ paciente.telefono }}</p>
        <p><b>DNI:</b> {{ paciente.dni }}</p>
        <p><b>Fecha de Nacimiento:</b> {{ paciente.fechaNacimiento | date: 'dd/MM/yyyy' }}</p>
        <p><b>Obra Social:</b> {{ paciente.obraSocial?.nombre || 'Sin obra social' }}</p>
        <button class="btn btn-danger" (click)="goBack()">Atrás</button>
        <button class="btn btn-primary ms-2" (click)="activarEdicion()">Editar</button>
      </div>

      <!-- MODO EDICIÓN -->
      <form *ngIf="modoEdicion" #form="ngForm" (ngSubmit)="save()">
        <h2>
          <ng-container *ngIf="paciente && paciente.id; else nuevo">
            Editando paciente: {{ paciente.nombre }} {{ paciente.apellido }}
          </ng-container>
          <ng-template #nuevo>
            Nuevo Paciente
          </ng-template>
        </h2>
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            [(ngModel)]="paciente.nombre"
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
            [(ngModel)]="paciente.apellido"
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
            [(ngModel)]="paciente.dni"
            name="dni"
            class="form-control"
            required
            #dni="ngModel"
          />
          <div *ngIf="dni.invalid && (dni.dirty || dni.touched)" class="alert">
            <div *ngIf="dni.errors?.['required']">El dni es requerido</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            [(ngModel)]="paciente.email"
            name="email"
            class="form-control"
            required
            type="email"
            #email="ngModel"
          />
          <div *ngIf="email.invalid && (email.dirty || email.touched)" class="alert">
            <div *ngIf="email.errors?.['required']">El email es requerido</div>
            <div *ngIf="email.errors?.['email']">Debe ser un email válido</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Teléfono</label>
          <input
            [(ngModel)]="paciente.telefono"
            name="telefono"
            class="form-control"
            required
            #telefono="ngModel"
          />
          <div *ngIf="telefono.invalid && (telefono.dirty || telefono.touched)" class="alert">
            <div *ngIf="telefono.errors?.['required']">El teléfono es requerido</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Fecha de Nacimiento</label>
          <input
            [(ngModel)]="paciente.fechaNacimiento"
            name="fechaNacimiento"
            class="form-control"
            type="date"
            required
            #fechaNacimiento="ngModel"
          />
          <div *ngIf="fechaNacimiento.invalid && (fechaNacimiento.dirty || fechaNacimiento.touched)" class="alert">
            <div *ngIf="fechaNacimiento.errors?.['required']">La fecha de nacimiento es requerida</div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Obra Social</label>
          <select
            [(ngModel)]="paciente.obraSocial"
            name="obraSocial"
            class="form-control"
            required
            #obraSocial="ngModel"
          >
            <option *ngFor="let obraSocial of obrasSociales" [ngValue]="obraSocial">
              {{ obraSocial.nombre }}
            </option>
          </select>
          <div *ngIf="obraSocial.invalid && (obraSocial.dirty || obraSocial.touched)" class="alert">
            <div *ngIf="obraSocial.errors?.['required']">La obra social es requerida</div>
          </div>
        </div>
        <button type="submit" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="cancelar()">Cancelar</button>
        <button *ngIf="paciente.id" type="button" class="btn btn-outline-danger ms-2" (click)="remove()">Eliminar</button>
      </form>
    </div>
  `,
  styles: []
})
export class PacienteDetailComponent implements OnInit {
  paciente: Paciente = { id: 0, nombre: '', apellido: '', email: '', telefono: '', dni: 0, fechaNacimiento: '' };
  modoEdicion = false;
  obrasSociales: { id: number; nombre: string; codigo: string }[] = [];

  constructor(
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pacienteService.getObrasSociales().subscribe((dp: DataPackage<{ id: number; nombre: string; codigo: string }[]>) => {
      this.obrasSociales = dp.data;
    });

    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'pacientes/new') {
      this.modoEdicion = true;
    } else {
      const id = +this.route.snapshot.paramMap.get('id')!;
      this.pacienteService.get(id).subscribe((dp: DataPackage<Paciente>) => {
        this.paciente = dp.data;

        // Asignar la obra social asociada al paciente
        if (this.paciente.obraSocial) {
          const obraSocial = this.obrasSociales.find(os => os.id === this.paciente.obraSocial?.id);
          if (obraSocial) {
            this.paciente.obraSocial = obraSocial;
          }
        }

        this.route.queryParams.subscribe(params => {
          this.modoEdicion = params['edit'] === 'true';
        });
      });
    }
  }

  save(): void {
    const op = this.paciente.id
      ? this.pacienteService.update(this.paciente.id, this.paciente)
      : this.pacienteService.create(this.paciente);
    op.subscribe(() => {
      this.router.navigate(['/pacientes']);
    });
  }

  goBack(): void {
    this.router.navigate(['/pacientes']);
  }

  cancelar(): void {
    if (this.paciente.id) {
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

  remove(): void {
    if (!this.paciente.id) return;
    if (confirm('¿Está seguro que desea eliminar este paciente?')) {
      this.pacienteService.remove(this.paciente.id).subscribe(() => {
        this.goBack();
      });
    }
  }
}
