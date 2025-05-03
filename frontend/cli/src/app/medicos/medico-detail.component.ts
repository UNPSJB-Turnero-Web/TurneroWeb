import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    <div class="container">
      <h2 *ngIf="!medico.id">Nuevo Médico</h2>
      <h2 *ngIf="medico.id">Editar Médico #{{ medico.id }}</h2>

      <form (ngSubmit)="save()" #form="ngForm">
        <div class="mb-3">
          <label for="name" class="form-label">Nombre</label>
          <input
            type="text"
            id="name"
            class="form-control"
            required
            [(ngModel)]="medico.name"
            name="name"
          />
        </div>
        <div class="mb-3">
          <label for="apellido" class="form-label">Apellido</label>
          <input
            type="text"
            id="apellido"
            class="form-control"
            required
            [(ngModel)]="medico.apellido"
            name="apellido"
          />
        </div>
        <div class="mb-3">
          <label for="especialidad" class="form-label">Especialidad</label>
          <select
            id="especialidad"
            class="form-control"
            required
            [(ngModel)]="medico.especialidad"
            name="especialidad"
          >
            <option *ngFor="let especialidad of especialidades" [ngValue]="especialidad">
              {{ especialidad.name }}
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
export class MedicoDetailComponent implements OnInit {
  medico: Medico = { id: 0, name: '', apellido: '', especialidad: null as any };
  especialidades: Especialidad[] = [];

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.medicoService.get(id).subscribe((dp: DataPackage) => {
        this.medico = dp.data as Medico;
      });
    }
    this.loadEspecialidades();
  }

  loadEspecialidades(): void {
    this.especialidadService.all().subscribe((dp: DataPackage) => {
      this.especialidades = dp.data as Especialidad[];
    });
  }

  save(): void {
    this.medicoService.save(this.medico).subscribe(() => {
      this.router.navigate(['/medicos']);
    });
  }

  goBack(): void {
    this.router.navigate(['/medicos']);
  }
}
