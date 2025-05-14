import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from './especialidad.service';
import { Especialidad } from './especialidad';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-especialidad-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Elimina ModalService de aquí
  template: `
    <div class="container mt-4">
      <h2>
        <ng-container *ngIf="especialidad.id && especialidad.id !== 0; else nueva">
          Editando especialidad: {{ especialidad.nombre }}
        </ng-container>
        <ng-template #nueva>
          Nueva Especialidad
        </ng-template>
      </h2>
      <form (ngSubmit)="save()" #form="ngForm">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            [(ngModel)]="especialidad.nombre"
            name="nombre"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Descripción</label>
          <textarea
            [(ngModel)]="especialidad.descripcion"
            name="descripcion"
            class="form-control"
            rows="3"
            placeholder="Ingrese una descripción"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || allFieldsEmpty()">Guardar</button>
        <a routerLink="/especialidades" class="btn btn-secondary ms-2">Cancelar</a>
      </form>
    </div>
  `,
})
export class EspecialidadDetailComponent {
  especialidad: Especialidad = { id: 0, nombre: '', descripcion: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private especialidadService: EspecialidadService,
    private modalService: ModalService
  ) {}

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'especialidades/new') {
      // Configuración para una nueva especialidad
      this.especialidad = {
        id: 0,
        nombre: '',
        descripcion: ''
      } as Especialidad;
    } else if (path === 'especialidades/:id') {
      // Configuración para editar una especialidad existente
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

      this.especialidadService.get(id).subscribe({
        next: (dataPackage) => {
          this.especialidad = <Especialidad>dataPackage.data;
        },
        error: (err) => {
          console.error('Error al obtener la especialidad:', err);
          alert('No se pudo cargar la especialidad. Intente nuevamente.');
        }
      });
    } else {
      console.error('Ruta no reconocida.');
    }
  }

  ngOnInit(): void {
    this.get();
  }

  save(): void {
    this.especialidadService.save(this.especialidad).subscribe({
      next: () => {
        this.router.navigate(['/especialidades']);
      },
      error: (error) => {
        console.error('Error al guardar la especialidad:', error);
        if (error.error && error.error.message) {
          alert(`Error: ${error.error.message}`); // Muestra el mensaje de error al usuario
        } else {
          alert('Error desconocido al guardar la especialidad.');
        }
      }
    });
  }

  allFieldsEmpty(): boolean {
    return !this.especialidad?.nombre && !this.especialidad?.descripcion;
  }
}