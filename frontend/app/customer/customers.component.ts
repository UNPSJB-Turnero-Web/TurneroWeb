import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from './customer.service';
import { Customer } from './customer';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
<h2>Clientes</h2>&nbsp;<a routerLink="/customers/new" class="btn btn-success">Nuevo cliente</a>
<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th></th> <!-- Acciones -->
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let customer of resultsPage.content; index as i">
      <td>{{ customer.id }}</td>
        <td>{{ customer.name }}</td>
        <td>
          <a [routerLink]="['/customers', customer.id]" class="btn btn-sm btn-outline-primary">
            <i class="fa fa-pencil"></i>
          </a>
          <a (click)="remove(customer.id)" [routerLink]="" class="btn btn-sm btn-outline-danger ms-1">
            <i class="fa fa-trash"></i>
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
export class CustomersComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private customerService: CustomerService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getCustomers();
  }

  getCustomers(): void {
    this.customerService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }
  remove(id: number): void {
    this.modalService
      .confirm(
        "Eliminar cliente",
        "¿Está seguro que desea eliminar el cliente?",
        "Si elimina el cliente no lo podrá utilizar luego"
      )
      .then(() => {
        this.customerService.remove(id).subscribe({
          next: () => this.getCustomers(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el cliente, asociado a bordero";
            alert(msg); // ⛔️ Esto muestra el error personalizado del backend
            console.error("Error al eliminar cliente:", err);
          }
        });
      });
  }
  
  
  

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getCustomers();
  }
}