import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacionService, NotificacionDTO, PageNotificacion } from '../services/notificacion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-paciente-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><i class="fas fa-bell me-2"></i>Notificaciones</h2>
          <p class="text-muted mb-0">
            <span *ngIf="contadorNoLeidas > 0" class="badge bg-danger me-2">{{contadorNoLeidas}}</span>
            Gestione sus notificaciones del sistema
          </p>
        </div>
        <div>
          <button 
            class="btn btn-outline-primary me-2"
            (click)="marcarTodasComoLeidas()"
            [disabled]="contadorNoLeidas === 0">
            <i class="fas fa-check-double me-1"></i>
            Marcar todas como leídas
          </button>
          <button class="btn btn-secondary" (click)="actualizarNotificaciones()">
            <i class="fas fa-sync-alt me-1"></i>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
                <option value="">Todas</option>
                <option value="no-leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Tipo</label>
              <select class="form-select" [(ngModel)]="filtroTipo" (change)="aplicarFiltros()">
                <option value="">Todos los tipos</option>
                <option value="CONFIRMACION">Confirmaciones</option>
                <option value="CANCELACION">Cancelaciones</option>
                <option value="REAGENDAMIENTO">Reagendamientos</option>
                <option value="NUEVO_TURNO">Nuevos turnos</option>
                <option value="RECORDATORIO">Recordatorios</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Buscar</label>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar en título o mensaje..."
                [(ngModel)]="textoBusqueda"
                (input)="aplicarFiltros()">
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <!-- Lista de Notificaciones -->
      <div *ngIf="!loading" class="row">
        <div class="col-12" *ngIf="notificacionesFiltradas.length === 0">
          <div class="alert alert-info text-center">
            <i class="fas fa-info-circle fa-2x mb-3"></i>
            <h4>No hay notificaciones</h4>
            <p>No se encontraron notificaciones que coincidan con los filtros aplicados.</p>
          </div>
        </div>

        <div class="col-12" *ngIf="notificacionesFiltradas.length > 0">
          <div class="card">
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div 
                  *ngFor="let notif of notificacionesFiltradas; trackBy: trackByNotificacion"
                  class="list-group-item list-group-item-action"
                  [class.bg-light]="!notif.leida"
                  [class.border-start]="!notif.leida"
                  [class.border-primary]="!notif.leida"
                  [class.border-5]="!notif.leida"
                  (click)="marcarComoLeida(notif)">
                  
                  <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2">
                        <i [class]="notif.iconoTipo + ' me-2 ' + obtenerClaseTipo(notif.tipo)"></i>
                        <h6 class="mb-0 me-2">{{notif.titulo}}</h6>
                        <span *ngIf="!notif.leida" class="badge bg-primary">Nuevo</span>
                        <span *ngIf="notif.esNueva && !notif.leida" class="badge bg-warning ms-1">Reciente</span>
                      </div>
                      <p class="mb-2 text-muted">{{notif.mensaje}}</p>
                      <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        {{formatearFecha(notif.fechaCreacion)}}
                        <span *ngIf="notif.leida && notif.fechaLeida" class="ms-3">
                          <i class="fas fa-check me-1"></i>
                          Leída el {{formatearFecha(notif.fechaLeida)}}
                        </span>
                      </small>
                    </div>
                    <div class="text-end">
                      <button 
                        *ngIf="notif.turnoId"
                        class="btn btn-sm btn-outline-primary me-2"
                        (click)="verTurno(notif.turnoId, $event)">
                        <i class="fas fa-eye me-1"></i>
                        Ver Turno
                      </button>
                      <button 
                        *ngIf="!notif.leida"
                        class="btn btn-sm btn-primary"
                        (click)="marcarComoLeida(notif, $event)">
                        <i class="fas fa-check me-1"></i>
                        Marcar leída
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <nav aria-label="Paginación de notificaciones" class="mt-4" *ngIf="totalPages > 1">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="currentPage === 0">
                <button class="page-link" (click)="cambiarPagina(currentPage - 1)" [disabled]="currentPage === 0">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              
              <li class="page-item" 
                  *ngFor="let page of getPageNumbers()" 
                  [class.active]="page === currentPage">
                <button class="page-link" (click)="cambiarPagina(page)">
                  {{page + 1}}
                </button>
              </li>
              
              <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
                <button class="page-link" (click)="cambiarPagina(currentPage + 1)" [disabled]="currentPage === totalPages - 1">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .border-5 {
      border-width: 5px !important;
    }
    
    .list-group-item {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .list-group-item:hover {
      background-color: #f8f9fa !important;
    }
    
    .list-group-item.bg-light {
      background-color: #f8f9fa !important;
    }
    
    .badge {
      font-size: 0.75rem;
    }
    
    .text-success { color: #198754 !important; }
    .text-danger { color: #dc3545 !important; }
    .text-warning { color: #fd7e14 !important; }
    .text-info { color: #0dcaf0 !important; }
    .text-primary { color: #0d6efd !important; }
  `]
})
export class PacienteNotificacionesComponent implements OnInit, OnDestroy {

  notificaciones: NotificacionDTO[] = [];
  notificacionesFiltradas: NotificacionDTO[] = [];
  contadorNoLeidas = 0;
  loading = false;
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Filtros
  filtroEstado = '';
  filtroTipo = '';
  textoBusqueda = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.cargarContadorNoLeidas();
    
    // Suscribirse al contador de notificaciones no leídas
    const contadorSub = this.notificacionService.contadorNoLeidas$.subscribe(
      count => this.contadorNoLeidas = count
    );
    this.subscriptions.push(contadorSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private getPacienteId(): number | null {
    const pacienteId = localStorage.getItem('pacienteId');
    return pacienteId ? parseInt(pacienteId) : null;
  }

  cargarNotificaciones(): void {
    const pacienteId = this.getPacienteId();
    if (!pacienteId) {
      console.error('No se pudo obtener el ID del paciente');
      return;
    }

    this.loading = true;
    this.notificacionService.obtenerNotificacionesPorPaciente(pacienteId, this.currentPage, this.pageSize)
      .subscribe({
        next: (page: PageNotificacion) => {
          this.notificaciones = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar notificaciones:', error);
          this.loading = false;
        }
      });
  }

  cargarContadorNoLeidas(): void {
    const pacienteId = this.getPacienteId();
    if (pacienteId) {
      this.notificacionService.actualizarContador(pacienteId);
    }
  }

  aplicarFiltros(): void {
    let filtradas = [...this.notificaciones];

    // Filtro por estado
    if (this.filtroEstado === 'leidas') {
      filtradas = filtradas.filter(n => n.leida);
    } else if (this.filtroEstado === 'no-leidas') {
      filtradas = filtradas.filter(n => !n.leida);
    }

    // Filtro por tipo
    if (this.filtroTipo) {
      filtradas = filtradas.filter(n => n.tipo === this.filtroTipo);
    }

    // Filtro por texto
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      filtradas = filtradas.filter(n => 
        n.titulo.toLowerCase().includes(texto) || 
        n.mensaje.toLowerCase().includes(texto)
      );
    }

    this.notificacionesFiltradas = filtradas;
  }

  marcarComoLeida(notificacion: NotificacionDTO, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (notificacion.leida) {
      return;
    }

    const pacienteId = this.getPacienteId();
    if (!pacienteId) {
      return;
    }

    this.notificacionService.marcarComoLeida(notificacion.id, pacienteId)
      .subscribe({
        next: () => {
          notificacion.leida = true;
          notificacion.fechaLeida = new Date().toISOString();
          this.aplicarFiltros();
        },
        error: (error) => {
          console.error('Error al marcar notificación como leída:', error);
        }
      });
  }

  marcarTodasComoLeidas(): void {
    if (this.contadorNoLeidas === 0) {
      return;
    }

    const pacienteId = this.getPacienteId();
    if (!pacienteId) {
      return;
    }

    this.notificacionService.marcarTodasComoLeidas(pacienteId)
      .subscribe({
        next: () => {
          this.notificaciones.forEach(n => {
            if (!n.leida) {
              n.leida = true;
              n.fechaLeida = new Date().toISOString();
            }
          });
          this.aplicarFiltros();
        },
        error: (error) => {
          console.error('Error al marcar todas las notificaciones como leídas:', error);
        }
      });
  }

  actualizarNotificaciones(): void {
    this.cargarNotificaciones();
    this.cargarContadorNoLeidas();
  }

  verTurno(turnoId: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/paciente-turnos'], { 
      queryParams: { turnoId: turnoId } 
    });
  }

  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.cargarNotificaciones();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  trackByNotificacion(index: number, notificacion: NotificacionDTO): number {
    return notificacion.id;
  }

  formatearFecha(fecha: string): string {
    return this.notificacionService.formatearFecha(fecha);
  }

  obtenerClaseTipo(tipo: string): string {
    return this.notificacionService.obtenerClaseTipo(tipo);
  }
}
