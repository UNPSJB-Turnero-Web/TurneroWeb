import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtros-dashboard.component.html',
  styleUrls: ['./filtros-dashboard.component.css']
})
export class FiltrosDashboardComponent {
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;

  @Output() aplicar = new EventEmitter<any>();

  submit() {
    this.aplicar.emit({ fechaDesde: this.fechaDesde, fechaHasta: this.fechaHasta });
  }
}
