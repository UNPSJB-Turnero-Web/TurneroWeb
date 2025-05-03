import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from './especialidad.service';
import { Especialidad } from './especialidad';

@Component({
  selector: 'app-especialidad-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>{{ especialidad.id ? 'Editar Especialidad' : 'Nueva Especialidad' }}</h2>
      <form (ngSubmit)="save()">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            [(ngModel)]="especialidad.name"
            name="name"
            class="form-control"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">Guardar</button>
        <a routerLink="/especialidades" class="btn btn-secondary ms-2">Cancelar</a>
      </form>
    </div>
  `,
})
export class EspecialidadDetailComponent {
  especialidad: Especialidad = { id: 0, name: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private especialidadService: EspecialidadService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.especialidadService.get(id).subscribe((dataPackage) => {
        this.especialidad = dataPackage.data as Especialidad;
      });
    }
  }

  save(): void {
    this.especialidadService.save(this.especialidad).subscribe(() => {
      this.router.navigate(['/especialidades']);
    });
  }
}
