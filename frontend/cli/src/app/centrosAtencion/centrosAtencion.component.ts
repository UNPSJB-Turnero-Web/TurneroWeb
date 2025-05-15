import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-hospital-o me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Centros de Atención</h2>
          </div>
          <button 
            class="btn btn-light btn-sm nuevo-centro-btn"
            (click)="router.navigate(['/centrosAtencion/new'])"
          >
            <i class="fa fa-plus me-1"></i> Nuevo Centro
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Localidad</th>
                <th>Provincia</th>
                <th>Teléfono</th>
                <th>Coordenadas</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let centro of resultsPage.content; index as i"
                (click)="goToDetail(centro.id)"
                style="cursor:pointer"
                [class.table-active]="centro.id === selectedId"
              >
                <td class="fw-semibold">{{ centro.id }}</td>
                <td>{{ centro.name }}</td>
                <td>{{ centro.direccion }}</td>
                <td>{{ centro.localidad }}</td>
                <td>{{ centro.provincia }}</td>
                <td>{{ centro.telefono }}</td> 
                <td><span class="badge bg-light text-dark border">{{ centro.latitud }},{{ centro.longitud }}</span></td>
                <td class="text-center">
                  <button (click)="goToEdit(centro.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="remove(centro); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-remove"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer bg-white">
          <app-pagination
            [totalPages]="resultsPage.totalPages"
            [currentPage]="currentPage"
            (pageChangeRequested)="onPageChangeRequested($event)"
            [number]="resultsPage.number"
            [hidden]="resultsPage.numberOfElements < 1"
          >
          </app-pagination>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-hover tbody tr:hover {
      background-color: #f5f7fa;
    }
    .btn-outline-primary, .btn-outline-danger {
      min-width: 32px;
    }
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
    .nuevo-centro-btn {
      border-radius: 0.7rem !important;
      padding: 0.3rem 1rem !important;
      font-size: 1rem;
      font-weight: 500;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
      background-color: #f8f9fa;
      color: #0d6efd;

      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;    
      
      
    }
    .nuevo-centro-btn:active, .nuevo-centro-btn:focus {

      outline: none;
      box-shadow: 0 0 0 0.15rem #0d6efd33;
    }
  `]
})
export class CentrosAtencionComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;
  modoEdicion: boolean = false;
  selectedId?: number;

  constructor(
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
  }

  ngOnInit() {
    this.getCentrosAtencion();
  }

  getCentrosAtencion(): void {
    this.centroAtencionService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(centro: CentroAtencion): void {
    if (centro.id === undefined) {
      alert('No se puede eliminar: el centro no tiene ID.');
      return;
    }
    this.modalService
      .confirm(
        "Eliminar centro de atención",
        "¿Está seguro que desea eliminar el centro de atención?",
        "Si elimina el centro no lo podrá utilizar luego"
      )
      .then(() => {
        this.centroAtencionService.delete(centro.id!).subscribe({
          next: (response: any) => {
            if (response?.status_code === 400) {
              alert('No se puede eliminar el centro porque tiene dependencias asociadas.');
            } else {
              this.getCentrosAtencion();
            }
          },
          error: (err) => {
            alert('No se pudo eliminar el centro. Intente nuevamente.');
          }
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getCentrosAtencion();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/centrosAtencion', id]);
  }

  goToEdit(id: number): void {
  this.router.navigate(['/centrosAtencion', id], { queryParams: { edit: true } });
}
}