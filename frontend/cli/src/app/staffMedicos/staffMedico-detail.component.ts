import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffMedicoService } from './staffmedico.service';
import { StaffMedico } from './staffmedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Medico } from '../medicos/medico';
import { Especialidad } from '../especialidades/especialidad';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { MedicoService } from '../medicos/medico.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-staff-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2 *ngIf="!staffMedico.id">Nuevo Staff Médico</h2>
      <h2 *ngIf="staffMedico.id">Editar Staff Médico #{{ staffMedico.id }}</h2>

      <form (ngSubmit)="save()" #form="ngForm">
        <div class="mb-3">
          <label for="centro" class="form-label">Centro de Atención</label>
          <select
            id="centro"
            class="form-control"
            required
            [(ngModel)]="staffMedico.centro"
            name="centro"
          >
            <option *ngFor="let centro of centros" [ngValue]="centro">
              {{ centro.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="medico" class="form-label">Médico</label>
          <select
            id="medico"
            class="form-control"
            required
            [(ngModel)]="staffMedico.medico"
            name="medico"
          >
            <option *ngFor="let medico of medicos" [ngValue]="medico">
              {{ medico.name }} {{ medico.apellido }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="especialidad" class="form-label">Especialidad</label>
          <select
            id="especialidad"
            class="form-control"
            required
            [(ngModel)]="staffMedico.especialidad"
            name="especialidad"
          >
            <option *ngFor="let especialidad of especialidades" [ngValue]="especialidad">
              {{ especialidad.nombre }}
            </option>
          </select>
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="!form.valid">Guardar</button>
        <button class="btn btn-secondary ms-2" type="button" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
  styles: []
})
export class StaffMedicoDetailComponent implements OnInit {
  staffMedico: StaffMedico = { id: 0, centro: null as any, medico: null as any, especialidad: null as any };
  centros: CentroAtencion[] = [];
  medicos: Medico[] = [];
  especialidades: Especialidad[] = [];

  constructor(
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.staffMedicoService.get(id).subscribe((dp: DataPackage) => {
        this.staffMedico = dp.data as StaffMedico;
      });
    }
    this.loadCentros();
    this.loadMedicos();
    this.loadEspecialidades();
  }

  loadCentros(): void {
    this.centroAtencionService.all().subscribe((dp: DataPackage) => {
      this.centros = dp.data as CentroAtencion[];
    });
  }

  loadMedicos(): void {
    this.medicoService.all().subscribe((dp: DataPackage) => {
      this.medicos = dp.data as Medico[];
    });
  }

  loadEspecialidades(): void {
    this.especialidadService.all().subscribe((dp: DataPackage) => {
      this.especialidades = dp.data as Especialidad[];
    });
  }

  save(): void {
    this.staffMedicoService.save(this.staffMedico).subscribe(() => {
      this.router.navigate(['/staffMedico']);
    });
  }

  goBack(): void {
    this.router.navigate(['/staffMedico']);
  }
}