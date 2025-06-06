import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from './especialidad.service';
import { Especialidad } from './especialidad';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-especialidad-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './especialidad-detail.component.html',
  styles: [`
    .card {
      border-radius: 1.15rem;
      overflow: hidden;
    }
    .card-header {
      border-top-left-radius: 1rem !important;
      border-top-right-radius: 1rem !important;
      padding-top: 0.75rem;      
      padding-bottom: 0.75rem;  
      padding-right: 0.7rem!important;
      padding-left: 0.7rem!important;  
      overflow: hidden;
    }
    .form-control-lg {
      border-radius: 0.7rem;
      font-size: 1.1rem;
    }
    .form-control {
      border-radius: 0.5rem;
      border: 1px solid #dee2e6;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    .form-control:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    .btn {
      border-radius: 0.5rem;
      font-weight: 500;
    }
    .badge {
      font-size: 0.85rem;
    }
  `]
})
export class EspecialidadDetailComponent {
  especialidad: Especialidad = { id: 0, nombre: '', descripcion: '' };
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private especialidadService: EspecialidadService,
    private modalService: ModalService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.get();
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'especialidades/new') {
      this.modoEdicion = true;
      this.esNuevo = true;
      this.especialidad = {
        id: 0,
        nombre: '',
        descripcion: ''
      } as Especialidad;
    } else if (path === 'especialidades/:id') {
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;

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

  save(): void {
    if (this.esNuevo) {
      this.especialidadService.create(this.especialidad).subscribe({
        next: () => {
          this.router.navigate(['/especialidades']);
        },
        error: (error) => {
          console.error('Error al crear la especialidad:', error);
          alert('Error al crear la especialidad.');
        }
      });
    } else {
      this.especialidadService.update(this.especialidad.id, this.especialidad).subscribe({
        next: () => {
          this.router.navigate(['/especialidades']);
        },
        error: (error) => {
          console.error('Error al actualizar la especialidad:', error);
          alert('Error al actualizar la especialidad.');
        }
      });
    }
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  allFieldsEmpty(): boolean {
    return !this.especialidad?.nombre && !this.especialidad?.descripcion;
  }

  goBack(): void {
    this.location.back();
  }
}