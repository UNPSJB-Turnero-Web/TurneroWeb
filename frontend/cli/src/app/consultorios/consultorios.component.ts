import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Consultorio } from './consultorio';
import { ConsultorioService } from './consultorio.service';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container mt-4">
      <h2>Consultorios</h2>
      <a routerLink="/consultorios/new" class="btn btn-success mb-3">Nuevo Consultorio</a>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Número</th>
              <th>Nombre</th>
              <th>Centro de Atención</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let consultorio of consultorios">
              <td>{{ consultorio.id }}</td>
              <td>{{ consultorio.numero }}</td>
              <td>{{ consultorio.name }}</td>
              <td>{{ consultorio.centroAtencion?.name || 'Sin Centro' }}</td>
              <td>
                <a [routerLink]="['/consultorios', consultorio.id]" class="btn btn-primary btn-sm">Editar</a>
                <button (click)="delete(consultorio.id)" class="btn btn-danger btn-sm">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class ConsultoriosComponent implements OnInit {
  consultorios: Consultorio[] = [];

  constructor(
    private consultorioService: ConsultorioService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadConsultorios();
  }

  loadConsultorios(): void {
    this.consultorioService.getAll().subscribe((response) => {
      this.consultorios = response.data;
    });
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar este consultorio?')) {
      this.consultorioService.delete(id).subscribe(() => this.loadConsultorios());
    }
  }
}