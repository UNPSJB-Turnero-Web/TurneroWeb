import { ResultsPage } from '../results-page';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgendaService } from './agenda.service';
import { Agenda } from './agenda';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
<h2>Agendas</h2>&nbsp;<a routerLink="/agendas/new" class="btn btn-success">Nueva Agenda</a>
<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Fecha</th>
        <th>Paciente</th>
        <th></th> <!-- Acciones -->
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let agenda of resultsPage.content; index as i">
        <td>{{ agenda.id }}</td>
        <td>{{ agenda.date | date }}</td>
        <td>{{ agenda.paciente.name }}</td>
        <td>
          <a [routerLink]="['/agendas', agenda.id]" class="btn btn-sm btn-outline-secondary">
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
export class AgendasComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(private agendaService: AgendaService) {}

  ngOnInit() {
    this.getAgendas();
  }

  getAgendas(): void {
    this.agendaService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getAgendas();
  }
}