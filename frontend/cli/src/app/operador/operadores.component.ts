import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { OperadorService } from "./operador.service";
import { Operador } from "./operador";
import { ModalService } from "../modal/modal.service";
import { ResultsPage } from "../results-page";
import { PaginationComponent } from "../pagination/pagination.component";

@Component({
  selector: "app-operadores",
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container-fluid px-3 py-4">
      <div
        class="banner-operadores d-flex align-items-center justify-content-between mb-4"
      >
        <div class="title-section d-flex align-items-center">
          <div class="header-icon me-3">
            <i class="fas fa-user-cog"></i>
          </div>
          <div>
            <h1 class="mb-0 fw-bold">Operadores</h1>
            <p class="mb-0 opacity-75">Gestión de operadores del sistema</p>
          </div>
        </div>
        <button class="btn-new" (click)="router.navigate(['/operadores/new'])">
          <i class="fas fa-plus me-2"></i>
          <span class="d-none d-sm-inline">Nuevo Operador</span>
        </button>
      </div>

      <div class="modern-table">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="border-0 py-3 ps-4">ID</th>
              <th class="border-0 py-3">Nombre</th>
              <th class="border-0 py-3">Apellido</th>
              <th class="border-0 py-3 text-center">Activo</th>
              <th class="border-0 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let operador of resultsPage.content || []; let i = index"
              (click)="goToDetail(operador.id)"
              class="hover-operators cursor-pointer"
            >
              <td class="ps-4 py-3">{{ operador.id }}</td>
              <td class="py-3">{{ operador.nombre }}</td>
              <td class="py-3">{{ operador.apellido }}</td>
              <td class="py-3 text-center">
                <span
                  [class.active-badge]="operador.activo"
                  [class.inactive-badge]="!operador.activo"
                >
                  {{ operador.activo ? "Sí" : "No" }}
                </span>
              </td>
              <td class="py-3 text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button
                    (click)="goToEdit(operador.id); $event.stopPropagation()"
                    class="btn-action btn-edit"
                    title="Editar operador"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    (click)="
                      confirmDelete(operador.id); $event.stopPropagation()
                    "
                    class="btn-action btn-delete"
                    title="Eliminar operador"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr
              *ngIf="!resultsPage.content || resultsPage.content.length === 0"
            >
              <td colspan="6" class="text-center py-5">
                <div class="empty-state">
                  <i class="fas fa-user-cog fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay operadores registrados</h5>
                  <p class="text-muted small">
                    Comience agregando un nuevo operador al sistema
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4">
        <app-pagination
          [totalPages]="resultsPage.totalPages"
          [currentPage]="currentPage"
          (pageChangeRequested)="onPageChangeRequested($event)"
          [number]="resultsPage.number"
          [hidden]="resultsPage.numberOfElements < 1"
        ></app-pagination>
      </div>
    </div>
  `,
  styles: [
    `
      .cursor-pointer {
        cursor: pointer;
      }
      .empty-state {
        padding: 3rem 2rem;
      }
      .active-badge {
        color: white;
        background-color: green;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
      }
      .inactive-badge {
        color: white;
        background-color: red;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
      }
      @media (max-width: 768px) {
        .modern-table {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class OperadoresComponent {
  resultsPage: ResultsPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    numberOfElements: 0,
    first: true,
    last: true,
  };
  currentPage: number = 1;

  constructor(
    private operadorService: OperadorService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getOperadores();
  }

  getOperadores(): void {
    this.operadorService
      .byPage(this.currentPage, 10)
      .subscribe((dataPackage) => {
        this.resultsPage = <ResultsPage>dataPackage.data;
      });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar operador",
        "Eliminar operador",
        "¿Está seguro que desea eliminar el operador?"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.operadorService.remove(id).subscribe({
      next: () => this.getOperadores(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el operador.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar operador:", err);
      },
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getOperadores();
  }

  goToDetail(id: number): void {
    this.router.navigate(["/operadores", id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(["/operadores", id], { queryParams: { edit: true } });
  }
}
