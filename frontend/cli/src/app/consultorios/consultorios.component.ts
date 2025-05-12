import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConsultorioService } from './consultorio.service';
import { Consultorio } from './consultorio';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Listado de Consultorios</h2>
        <button class="btn btn-primary" (click)="router.navigate(['/consultorios/new'])">
          + Nuevo Consultorio
        </button>
      </div>

      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Nombre</th>
            <th scope="col">Centro Atención</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of consultorios">
            <td>{{ c.numero }}</td>
            <td>{{ c.name | uppercase }}</td>
            <td>{{ c.centroAtencion.name }}</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary me-2"
                      (click)="router.navigate(['/consultorios', c.id])">
                Editar
              </button>
              <button class="btn btn-sm btn-outline-danger"
                      (click)="confirmDelete(c.id)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ConsultoriosComponent implements OnInit {
  consultorios: Consultorio[] = [];

  page = 0;
  size = 10;
  totalElements = 0;

  constructor(
    private consultorioService: ConsultorioService,
    public router: Router,
    private modal: ModalService
  ) {}

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(page = 0, size = 10) {
    this.consultorioService
      .getPage(page, size)
      .subscribe(pkg => {
        this.consultorios = pkg.content;
        this.totalElements = pkg.totalElements;
      }, err => this.modal.alert('Error', 'No se pudo cargar'));
  }
  

confirmDelete(id: number): void {
  this.modal
    .confirm('Eliminando centro de atencion','Eliminar consultorio', '¿Estás seguro que deseas eliminarlo?')
    .then(() => this.delete(id))
    .catch(() => {}); // si cancela, no hacemos nada
}

  delete(id: number): void {
    this.consultorioService.delete(id).subscribe(
      () => this.loadPage(),              // recarga la página actual
      () => this.modal.alert('Error', 'No se pudo eliminar el consultorio')
    );
  }
}
