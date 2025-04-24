import { ResultsPage } from '../results-page';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BorderoService } from './bordero.service';
import { Bordero } from './bordero';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-borderos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
<h2>Borderos</h2>&nbsp;<a routerLink="/borderos/new" class="btn btn-success">Nuevo bordero</a>
<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th></th> <!-- Acciones -->
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let bordero of resultsPage.content; index as i">
        <td>{{ bordero.id }}</td>
        <td>{{ bordero.date | date }}</td>
        <td>{{ bordero.customer.name }}</td>
        <td>
          <a [routerLink]="['/borderos', bordero.id]" class="btn btn-sm btn-outline-secondary">
            <i class="fa fa-eye"></i>
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
export class BorderosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(private borderoService: BorderoService) {}

  ngOnInit() {
    this.getBorderos();
  }

  getBorderos(): void {
    this.borderoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getBorderos();
  }
}