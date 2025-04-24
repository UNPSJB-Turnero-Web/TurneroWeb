// src/app/playType/play-types.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayTypeService } from './playType.service';
import { PlayType } from './playType';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-play-types',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
<h2>Tipos de Obra</h2>&nbsp;
<a routerLink="/playtypes/new" class="btn btn-success">Nuevo tipo</a>

<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Tipo</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let playType of resultsPage.content; index as i">
        <td>{{ playType.id }}</td>
        <td>{{ playType.type }}</td>
        <td>
          <a [routerLink]="['/playtypes', playType.id]" class="btn btn-sm btn-outline-primary">
            <i class="fa fa-pencil"></i>
          </a>
          <a (click)="remove(playType.id)" class="btn btn-sm btn-outline-danger ms-1">
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
      ></app-pagination>
    </tfoot>
  </table>
</div>
  `,
  styles: ``
})
export class PlayTypesComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private playTypeService: PlayTypeService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getPlayTypes();
  }

  getPlayTypes(): void {
    this.playTypeService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getPlayTypes();
  }

  remove(id: number): void {
    this.modalService
      .confirm("Eliminar tipo", "¿Está seguro que desea eliminar este tipo?", "Esta acción no se puede deshacer")
      .then(() => {
        this.playTypeService.remove(id).subscribe(() => this.getPlayTypes());
      });
  }
}
