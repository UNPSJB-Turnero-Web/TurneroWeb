import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CentroAtencionService } from './centroAtencion.service';
import { CentroAtencion } from './centroAtencion';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';


@Component({
  selector: 'app-centros-atencion',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <h2>Centros de Atención</h2>&nbsp;<a routerLink="/centrosAtencion/new" class="btn btn-success">Nuevo Centro</a> 
    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Localidad</th>
            <th>Provincia</th>
            <th>Teléfono</th>
            <th>Coordenadas</th>

            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let centro of resultsPage.content; index as i">
            <td>{{ centro.id }}</td>
            <td>{{ centro.name }}</td>
            <td>{{ centro.direccion }}</td>
            <td>{{ centro.localidad }}</td>
            <td>{{ centro.provincia }}</td>
            <td>{{ centro.telefono }}</td> 
            <td>{{ centro.coordenadas }}</td>

            <td>
              <a [routerLink]="['/centrosAtencion', centro.id]" class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a (click)="remove(centro)" class="btn btn-sm btn-outline-danger ms-1">
                <i class="fa fa-remove"></i>
              </a>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <app-pagination
          [totalPages]="resultsPage.totalPages"
          [currentPage]="currentPage"
          (pageChangeRequested)="onPageChangeRequested($event)"
          [number]="resultsPage.number"
          [hidden]="resultsPage.numberOfElements < 1"
          >
          </app-pagination> 
        </tfoot>
      </table>
    </div>

  `,
  styles: ``
})
export class CentrosAtencionComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getCentrosAtencion();
  }

  getCentrosAtencion(): void {
    this.centroAtencionService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;

      // Asegúrate de que las coordenadas se procesen correctamente
      this.resultsPage.content.forEach((centro: CentroAtencion) => {
        if (centro.coordenadas) {
          const [lat, lng] = centro.coordenadas.split(',').map(coord => parseFloat(coord).toFixed(4));
          centro.coordenadas = `${lat},${lng}`; // Formato correcto sin espacios
        } else {
          centro.coordenadas = 'N/A'; // Manejo de coordenadas faltantes
        }
      });
    });
  }

  remove(centro: CentroAtencion): void {
    this.modalService
      .confirm(
        "Eliminar centro de atención",
        "¿Está seguro que desea eliminar el centro de atención?",
        "Si elimina el centro no lo podrá utilizar luego"
      )
      .then(() => {
        this.centroAtencionService.delete(centro.id).subscribe(() => {
          this.getCentrosAtencion();
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getCentrosAtencion();
  }
}