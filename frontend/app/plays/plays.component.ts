import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayService } from './play.service';
import { Play } from './play';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';


@Component({
  selector: 'app-plays',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <h2>Plays</h2>&nbsp;<a routerLink="/plays/new" class="btn btn-success">Nueva Obra</a> 
    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let play of resultsPage.content; index as i">
            <td>{{ play.id }}</td>

            <td>{{ play.code }}</td>
            <td>{{ play.name }}</td>
            <td>{{ play.type?.type || 'Sin tipo' }}</td>
            <td>
              <a [routerLink]="['/plays/code', play.code]" class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a (click)="remove(play)" class="btn btn-sm btn-outline-danger ms-1">
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
export class PlaysComponent {
  resultsPage: ResultsPage = <ResultsPage>{}
  currentPage: number = 1;

  constructor(
    private playService: PlayService,
    private modalService: ModalService,) { }

  ngOnInit() {
    this.getPlays();
  }

  getPlays(): void {
    this.playService.byPage(this.currentPage, 10).subscribe
      (dataPackage => {
        this.resultsPage = <ResultsPage>dataPackage.data;
      });
  }

  remove(play: Play): void {
    let that = this;
    this.modalService.confirm("Eliminar obra", "¿Estás seguro de eliminar la obra ?", "Si elimina la obra sera irrecuperable")
      .then(
        function () {
          that.playService.delete(play.code).subscribe(dataPackage => {
            that.getPlays();
          })
        })
  }
  onPageChangeRequested(page: number): void{
    this.currentPage = page
    this.getPlays();
  }
}