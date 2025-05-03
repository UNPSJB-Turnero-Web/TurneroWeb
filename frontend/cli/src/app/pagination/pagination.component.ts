import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav aria-label="Page navigation">
      <ul class="pagination pagination-centered">
        <li class="page-item">
          <a class="page-link" (click)="onPageChange(-2)">&laquo;</a>
        </li>
        <li class="page-item">
          <a class="page-link" (click)="onPageChange(-1)">&lsaquo;</a>
        </li>
        <li *ngFor="let t of pages" [ngClass]="t === number ? 'active' : ''">
          <a class="page-link" (click)="onPageChange(t + 1)">{{ t + 1 }}</a>
        </li>
        <li class="page-item">
          <a class="page-link" (click)="onPageChange(-3)">&rsaquo;</a>
        </li>
        <li class="page-item">
          <a class="page-link" (click)="onPageChange(-4)">&raquo;</a>
        </li>
      </ul>
    </nav>
  `,
  styles: ``
})
export class PaginationComponent {
  @Input() totalPages: number = 0;
  @Input() last: boolean = false;
  @Input() currentPage: number = 1;
  @Input() number: number = 1;

  @Output() pageChangeRequested = new EventEmitter<number>();

  pages: number[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages']) {
      this.pages = Array.from(Array(this.totalPages).keys());
    }
  }

  onPageChange(pageId: number): void {
    if (!this.currentPage) this.currentPage = 1;
  
    let page = this.currentPage;
  
    switch (pageId) {
      case -2: // « Primera
        page = 1;
        break;
      case -1: // ‹ Anterior
        if (this.currentPage > 1) page = this.currentPage - 1;
        break;
      case -3: // › Siguiente
        if (!this.last && this.currentPage < this.totalPages) page = this.currentPage + 1;
        break;
      case -4: // » Última
        page = this.totalPages;
        break;
      default: // Página específica (número real)
        page = pageId;
    }
  
    this.currentPage = page;
    this.pageChangeRequested.emit(page);
  }
}  