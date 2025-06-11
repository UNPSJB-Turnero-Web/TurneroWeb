import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination-wrapper" aria-label="Navegación de páginas">
      <div class="pagination-container">
        <!-- Primera página -->
        <button 
          class="pagination-btn pagination-btn-nav" 
          [disabled]="currentPage === 1"
          (click)="onPageChange(-2)"
          title="Primera página">
          <i class="fas fa-angle-double-left"></i>
        </button>

        <!-- Página anterior -->
        <button 
          class="pagination-btn pagination-btn-nav" 
          [disabled]="currentPage === 1"
          (click)="onPageChange(-1)"
          title="Página anterior">
          <i class="fas fa-angle-left"></i>
        </button>

        <!-- Páginas numéricas -->
        <div class="pagination-numbers">
          <ng-container *ngFor="let pageNum of getVisiblePages()">
            <button 
              *ngIf="pageNum !== -1"
              class="pagination-btn pagination-btn-number"
              [class.active]="pageNum === currentPage"
              [class.current]="pageNum === currentPage"
              (click)="onPageChange(pageNum)"
              [title]="'Ir a página ' + pageNum">
              {{ pageNum }}
            </button>
            <span 
              *ngIf="pageNum === -1"
              class="pagination-dots">
              ...
            </span>
          </ng-container>
        </div>

        <!-- Página siguiente -->
        <button 
          class="pagination-btn pagination-btn-nav" 
          [disabled]="currentPage >= totalPages || last"
          (click)="onPageChange(-3)"
          title="Página siguiente">
          <i class="fas fa-angle-right"></i>
        </button>

        <!-- Última página -->
        <button 
          class="pagination-btn pagination-btn-nav" 
          [disabled]="currentPage >= totalPages || last"
          (click)="onPageChange(-4)"
          title="Última página">
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>

      <!-- Información de paginación -->
      <div class="pagination-info" *ngIf="totalPages > 0">
        <span class="page-info-text">
          Página <strong>{{ currentPage }}</strong> de <strong>{{ totalPages }}</strong>
        </span>
      </div>
    </nav>
  `,
  styles: [`
    .pagination-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin: 2rem 0;
    }

    .pagination-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 0.75rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .pagination-numbers {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0 0.5rem;
    }

    .pagination-btn {
      min-width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #6c757d;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .pagination-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      transition: left 0.5s;
    }

    .pagination-btn:hover::before {
      left: 100%;
    }

    .pagination-btn:hover {
      background: #f8f9fa;
      color: #495057;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .pagination-btn:active {
      transform: translateY(0);
    }

    .pagination-btn:disabled {
      color: #dee2e6;
      cursor: not-allowed;
      background: #f8f9fa;
      transform: none;
      box-shadow: none;
    }

    .pagination-btn:disabled::before {
      display: none;
    }

    .pagination-btn:disabled:hover {
      background: #f8f9fa;
      transform: none;
      box-shadow: none;
    }

    .pagination-btn-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    .pagination-btn-nav:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .pagination-btn-nav:disabled {
      background: #e9ecef;
      color: #adb5bd;
    }

    .pagination-btn-number {
      font-weight: 600;
      position: relative;
    }

    .pagination-btn-number:hover:not(.active) {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #495057;
    }

    .pagination-btn-number.active {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      font-weight: 700;
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
      z-index: 1;
    }

    .pagination-btn-number.active::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 10px;
      z-index: -1;
      opacity: 0.2;
    }

    .pagination-btn-number.active:hover {
      transform: scale(1.1);
      background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
    }

    .pagination-dots {
      color: #6c757d;
      font-weight: 600;
      font-size: 1rem;
      padding: 0 0.5rem;
      display: flex;
      align-items: center;
      user-select: none;
    }

    .pagination-info {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .page-info-text {
      color: #495057;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .page-info-text strong {
      color: #28a745;
      font-weight: 700;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .pagination-container {
        padding: 0.5rem;
        gap: 0.25rem;
      }

      .pagination-btn {
        min-width: 35px;
        height: 35px;
        font-size: 0.8rem;
      }

      .pagination-numbers {
        margin: 0 0.25rem;
      }

      .pagination-info {
        padding: 0.4rem 0.8rem;
      }

      .page-info-text {
        font-size: 0.8rem;
      }
    }

    @media (max-width: 480px) {
      .pagination-wrapper {
        margin: 1rem 0;
      }

      .pagination-container {
        flex-wrap: wrap;
        justify-content: center;
      }

      .pagination-numbers {
        order: -1;
        margin: 0.25rem 0;
      }
    }

    /* Animaciones adicionales */
    @keyframes pageChange {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .pagination-btn-number.active {
      animation: pageChange 0.3s ease-in-out;
    }

    /* Efectos de hover mejorados */
    .pagination-btn {
      position: relative;
      z-index: 1;
    }

    .pagination-btn:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s;
      z-index: -1;
    }

    .pagination-btn:hover:before {
      transform: translateX(100%);
    }

    /* Estados de loading */
    .pagination-btn.loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .pagination-btn.loading::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
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

  getVisiblePages(): number[] {
    if (this.totalPages <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const current = this.currentPage;
    const total = this.totalPages;
    let start: number;
    let end: number;

    if (current <= 4) {
      // Al principio: mostrar 1-5 ... total
      start = 1;
      end = 5;
    } else if (current >= total - 3) {
      // Al final: mostrar 1 ... (total-4)-total
      start = total - 4;
      end = total;
    } else {
      // En el medio: mostrar 1 ... (current-1)-(current+1) ... total
      start = current - 1;
      end = current + 1;
    }

    const pages: number[] = [];
    
    // Agregar primera página si no está incluida
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push(-1); // Placeholder para "..."
      }
    }

    // Agregar páginas del rango
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Agregar última página si no está incluida
    if (end < total) {
      if (end < total - 1) {
        pages.push(-1); // Placeholder para "..."
      }
      pages.push(total);
    }

    return pages;
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