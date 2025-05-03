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
    <div class="container">
      <h2 *ngIf="!paciente.id">Nuevo Paciente</h2>
      <h2 *ngIf="paciente.id">Editar Paciente #{{ paciente.id }}</h2>

      <form (ngSubmit)="save()" #form="ngForm">
        <div class="mb-3">
          <label for="name" class="form-label">Nombre</label>
          <input
            type="text"
            id="name"
            class="form-control"
            required
            [(ngModel)]="paciente.name"
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
            [(ngModel)]="paciente.apellido"
            name="apellido"
          />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            class="form-control"
            required
            [(ngModel)]="paciente.email"
            name="email"
          />
        </div>
        <div class="mb-3">
          <label for="telefono" class="form-label">Teléfono</label>
          <input
            type="text"
            id="telefono"
            class="form-control"
            required
            [(ngModel)]="paciente.telefono"
            name="telefono"
          />
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="!form.valid">Guardar</button>
        <button class="btn btn-secondary ms-2" type="button" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
  styles: []
})
export class PacienteDetailComponent implements OnInit {
  paciente: Paciente = { id: 0, name: '', apellido: '', email: '', telefono: '' };

  constructor(
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.pacienteService.get(id).subscribe((dp: DataPackage) => {
        this.paciente = dp.data as Paciente;
      });
    }
  }

  save(): void {
    this.pacienteService.save(this.paciente).subscribe(() => {
      this.router.navigate(['/pacientes']);
    });
  }

  goBack(): void {
    this.router.navigate(['/pacientes']);
  }
}
