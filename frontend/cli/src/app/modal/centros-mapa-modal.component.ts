import { Component, EventEmitter, Output, ViewChild, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Especialidad } from '../especialidades/especialidad';
import { GeolocationService, UserLocation } from '../services/geolocation.service';

interface CentroMapaInfo extends CentroAtencion {
  distanciaKm?: number;
  especialidadesDisponibles?: string[];
}

@Component({
  selector: 'app-centros-mapa-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="centros-modal-backdrop" (click)="close()">
      <div class="centros-modal-content" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="centros-modal-header">
          <div class="header-info">
            <h3><i class="fas fa-map-marked-alt"></i> Centros de Atención</h3>
            <p>Encuentra el centro más cercano a tu ubicación</p>
          </div>
          <button type="button" class="btn-close" (click)="close()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- FILTROS Y CONTROLES -->
        <div class="centros-modal-filters">
          
          <!-- FILTRO POR ESPECIALIDAD -->
          <div class="filter-group">
            <label><i class="fas fa-stethoscope"></i> Filtrar por Especialidad:</label>
            <select class="form-control" [(ngModel)]="especialidadFiltro" (change)="aplicarFiltros()">
              <option value="">Todas las especialidades</option>
              <option *ngFor="let esp of especialidadesDisponibles" [value]="esp.nombre">
                {{ esp.nombre }}
              </option>
            </select>
          </div>

          <!-- CONTROLES DE UBICACIÓN -->
          <div class="location-controls">
            <div class="location-group">
              <button 
                class="btn btn-location"
                [class.active]="userLocation"
                (click)="obtenerUbicacionUsuario()"
                [disabled]="isLoadingLocation">
                <i class="fas fa-map-marker-alt"></i>
                {{ isLoadingLocation ? 'Ubicando...' : (userLocation ? 'Ubicado' : 'Mi Ubicación') }}
                <i class="fas fa-spinner fa-spin" *ngIf="isLoadingLocation"></i>
              </button>
              
              <button 
                class="btn btn-location-manual"
                (click)="showManualLocationForm = !showManualLocationForm">
                <i class="fas fa-edit"></i>
                Ubicación Manual
              </button>
            </div>

            <!-- FORMULARIO DE UBICACIÓN MANUAL -->
            <div class="manual-location-form" *ngIf="showManualLocationForm">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control"
                  [(ngModel)]="direccionBusqueda"
                  placeholder="Ingresa tu dirección o ciudad"
                  (keyup.enter)="buscarDireccion()">
                <button class="btn btn-search" (click)="buscarDireccion()" [disabled]="!direccionBusqueda">
                  <i class="fas fa-search"></i>
                </button>
              </div>
              
              <div class="coord-inputs">
                <input 
                  type="number" 
                  class="form-control"
                  [(ngModel)]="latitudManual"
                  placeholder="Latitud"
                  step="any">
                <input 
                  type="number" 
                  class="form-control"
                  [(ngModel)]="longitudManual"
                  placeholder="Longitud"
                  step="any">
                <button 
                  class="btn btn-set-coords"
                  (click)="establecerCoordenadas()"
                  [disabled]="!latitudManual || !longitudManual">
                  <i class="fas fa-map-pin"></i>
                </button>
              </div>
            </div>

            <!-- STATUS DE UBICACIÓN -->
            <div class="location-status" *ngIf="userLocation">
              <small class="location-info">
                <i class="fas fa-check-circle"></i>
                Ubicación establecida
                <span *ngIf="userLocation.source === 'geolocation'">(GPS)</span>
                <span *ngIf="userLocation.source === 'ip'">(aproximada)</span>
                <span *ngIf="userLocation.source === 'manual'">(manual)</span>
              </small>
            </div>
            
            <div class="location-error" *ngIf="locationError">
              <small class="error-text">
                <i class="fas fa-exclamation-triangle"></i>
                {{ locationError }}
              </small>
            </div>
          </div>

          <!-- RADIO DE BÚSQUEDA -->
          <div class="filter-group" *ngIf="userLocation">
            <label><i class="fas fa-circle"></i> Radio de búsqueda:</label>
            <select class="form-control" [(ngModel)]="radioMaximo" (change)="aplicarFiltros()">
              <option [value]="10">10 km</option>
              <option [value]="25">25 km</option>
              <option [value]="50">50 km</option>
              <option [value]="100">100 km</option>
              <option [value]="0">Sin límite</option>
            </select>
          </div>

        </div>

        <!-- MAPA -->
        <div class="centros-modal-body">
          <div #mapContainer class="map-container"></div>
        </div>

        <!-- LISTA DE CENTROS -->
        <div class="centros-modal-footer">
          <div class="centros-list-header">
            <h4>
              <i class="fas fa-hospital"></i> 
              Centros Encontrados ({{ centrosFiltrados.length }})
            </h4>
            <div class="sort-controls" *ngIf="userLocation">
              <button 
                class="btn btn-sort"
                [class.active]="ordenadoPorDistancia"
                (click)="toggleOrdenarPorDistancia()">
                <i class="fas fa-sort-amount-down"></i>
                {{ ordenadoPorDistancia ? 'Por distancia' : 'Ordenar por distancia' }}
              </button>
            </div>
          </div>

          <!-- MENSAJE SI NO HAY CENTROS -->
          <div class="no-centros-message" *ngIf="centrosFiltrados.length === 0">
            <div class="no-centros-content">
              <i class="fas fa-map-marker-alt"></i>
              <h5>No se encontraron centros</h5>
              <p *ngIf="radioMaximo > 0 && userLocation">
                No hay centros dentro de {{ radioMaximo }}km de tu ubicación.
              </p>
              <p *ngIf="especialidadFiltro">
                No hay centros con la especialidad "{{ especialidadFiltro }}" disponible.
              </p>
              <div class="suggestions">
                <button 
                  class="btn btn-suggestion" 
                  *ngIf="radioMaximo < 100"
                  (click)="ampliarRadio()">
                  <i class="fas fa-expand-arrows-alt"></i>
                  Ampliar radio de búsqueda
                </button>
                <button 
                  class="btn btn-suggestion" 
                  *ngIf="especialidadFiltro"
                  (click)="limpiarFiltros()">
                  <i class="fas fa-filter"></i>
                  Quitar filtros
                </button>
              </div>
            </div>
          </div>

          <!-- LISTA DE CENTROS -->
          <div class="centros-list" *ngIf="centrosFiltrados.length > 0">
            <div 
              class="centro-item"
              *ngFor="let centro of centrosFiltrados; let i = index"
              [class.highlighted]="centroActualSeleccionado?.id === centro.id"
              (click)="seleccionarCentro(centro)">
              
              <div class="centro-info">
                <div class="centro-header">
                  <h5>{{ centro.nombre }}</h5>
                  <div class="centro-badges">
                    <span class="distance-badge" *ngIf="centro.distanciaKm !== undefined">
                      <i class="fas fa-route"></i>
                      {{ formatDistance(centro.distanciaKm) }}
                    </span>
                    <span class="index-badge">{{ i + 1 }}</span>
                  </div>
                </div>
                
                <div class="centro-details">
                  <div class="detail-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ centro.direccion }}</span>
                  </div>
                  <div class="detail-row" *ngIf="centro.localidad">
                    <i class="fas fa-city"></i>
                    <span>{{ centro.localidad }}, {{ centro.provincia }}</span>
                  </div>
                  <div class="detail-row" *ngIf="centro.telefono">
                    <i class="fas fa-phone"></i>
                    <span>{{ centro.telefono }}</span>
                  </div>
                </div>

                <!-- ESPECIALIDADES DISPONIBLES -->
                <div class="especialidades-centro" *ngIf="centro.especialidadesDisponibles && centro.especialidadesDisponibles.length > 0">
                  <div class="especialidades-header">
                    <i class="fas fa-stethoscope"></i>
                    <span>Especialidades disponibles:</span>
                  </div>
                  <div class="especialidades-tags">
                    <span 
                      class="especialidad-tag"
                      *ngFor="let esp of centro.especialidadesDisponibles"
                      [class.highlighted]="esp === especialidadFiltro">
                      {{ esp }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="centro-actions">
                <button 
                  class="btn btn-center-on-map"
                  (click)="centrarEnMapa(centro, $event)"
                  title="Ver en mapa">
                  <i class="fas fa-crosshairs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* MODAL BACKDROP */
    .centros-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
      padding: 1rem;
    }

    .centros-modal-content {
      background: white;
      border-radius: 15px;
      width: 95%;
      max-width: 1200px;
      height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }

    /* HEADER */
    .centros-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-info p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .btn-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-close:hover {
      background: rgba(255,255,255,0.3);
    }

    /* FILTROS */
    .centros-modal-filters {
      background: #f8f9fa;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .filter-group label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-control {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    /* CONTROLES DE UBICACIÓN */
    .location-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 300px;
    }

    .location-group {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-location {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .btn-location:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-location.active {
      background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
    }

    .btn-location-manual {
      background: #6c757d;
      color: white;
    }

    .btn-location-manual:hover {
      background: #5a6268;
    }

    .manual-location-form {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    .input-group .form-control {
      flex: 1;
    }

    .btn-search, .btn-set-coords {
      background: #667eea;
      color: white;
      padding: 0.5rem;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-search:hover, .btn-set-coords:hover {
      background: #5a6fd8;
    }

    .coord-inputs {
      display: flex;
      gap: 0.5rem;
    }

    .coord-inputs .form-control {
      flex: 1;
    }

    .location-status, .location-error {
      font-size: 0.85rem;
    }

    .location-info {
      color: #28a745;
    }

    .error-text {
      color: #dc3545;
    }

    /* MAPA */
    .centros-modal-body {
      flex: 1;
      min-height: 300px;
      overflow: hidden;
    }

    .map-container {
      width: 100%;
      height: 100%;
    }

    /* LISTA DE CENTROS */
    .centros-modal-footer {
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .centros-list-header {
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .centros-list-header h4 {
      margin: 0;
      color: #495057;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-sort {
      background: transparent;
      border: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 0.85rem;
    }

    .btn-sort.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    /* NO CENTROS */
    .no-centros-message {
      padding: 3rem 2rem;
      text-align: center;
    }

    .no-centros-content {
      color: #6c757d;
    }

    .no-centros-content i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #adb5bd;
    }

    .no-centros-content h5 {
      margin-bottom: 1rem;
      color: #495057;
    }

    .suggestions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .btn-suggestion {
      background: #667eea;
      color: white;
      font-size: 0.9rem;
    }

    .btn-suggestion:hover {
      background: #5a6fd8;
    }

    /* CENTRO ITEMS */
    .centros-list {
      padding: 1rem 0;
    }

    .centro-item {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: white;
    }

    .centro-item:hover {
      background: rgba(102, 126, 234, 0.05);
      border-left: 4px solid #667eea;
    }

    .centro-item.highlighted {
      background: rgba(102, 126, 234, 0.1);
      border-left: 4px solid #667eea;
    }

    .centro-info {
      flex: 1;
    }

    .centro-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .centro-header h5 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }

    .centro-badges {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .distance-badge {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .index-badge {
      background: #6c757d;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .centro-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .detail-row i {
      width: 16px;
      color: #667eea;
    }

    .especialidades-centro {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .especialidades-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #495057;
    }

    .especialidades-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .especialidad-tag {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .especialidad-tag.highlighted {
      background: #667eea;
      color: white;
    }

    .centro-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-left: 1rem;
    }

    .btn-center-on-map {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 1px solid rgba(102, 126, 234, 0.3);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .btn-center-on-map:hover {
      background: #667eea;
      color: white;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .centros-modal-content {
        width: 100%;
        height: 100vh;
        border-radius: 0;
      }

      .centros-modal-filters {
        flex-direction: column;
        gap: 1rem;
      }

      .filter-group, .location-controls {
        min-width: auto;
        width: 100%;
      }

      .coord-inputs {
        flex-direction: column;
      }

      .centro-item {
        flex-direction: column;
        gap: 1rem;
      }

      .centro-actions {
        align-self: flex-end;
        flex-direction: row;
        margin-left: 0;
      }

      .suggestions {
        flex-direction: column;
        align-items: center;
      }
    }

    /* ESTILOS GLOBALES PARA LEAFLET */
    :host ::ng-deep .leaflet-popup-content-wrapper {
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    :host ::ng-deep .centro-popup {
      font-family: inherit;
      min-width: 200px;
    }

    :host ::ng-deep .popup-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    :host ::ng-deep .popup-number {
      background: #667eea;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
    }

    :host ::ng-deep .popup-body {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    :host ::ng-deep .popup-body > div {
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    :host ::ng-deep .popup-body i {
      width: 14px;
      color: #667eea;
    }

    :host ::ng-deep .popup-distance {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-weight: 600;
      margin-top: 0.5rem;
      border: 1px solid rgba(40, 167, 69, 0.2);
    }

    :host ::ng-deep .user-location-marker {
      background: #28a745;
      color: white;
      border-radius: 50%;
      width: 30px !important;
      height: 30px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.4);
      border: 3px solid white;
      font-size: 14px;
    }

    :host ::ng-deep .user-location-marker:before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(40, 167, 69, 0.3);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `]
})
export class CentrosMapaModalComponent implements OnInit, OnDestroy {
  @Input() centros: CentroAtencion[] = [];
  @Input() especialidades: Especialidad[] = [];
  @Input() especialidadSeleccionadaInicial: string = '';
  @Output() centroSeleccionado = new EventEmitter<CentroAtencion>();
  @Output() modalCerrado = new EventEmitter<void>();
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  // Mapa
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private userMarker: L.Marker | null = null;

  // Filtros
  especialidadFiltro: string = '';
  radioMaximo: number = 50; // km
  
  // Ubicación
  userLocation: UserLocation | null = null;
  isLoadingLocation = false;
  locationError: string | null = null;
  showManualLocationForm = false;
  direccionBusqueda = '';
  latitudManual: number | null = null;
  longitudManual: number | null = null;

  // Estado
  centrosFiltrados: CentroMapaInfo[] = [];
  centroActualSeleccionado: CentroMapaInfo | null = null;
  especialidadesDisponibles: Especialidad[] = [];
  ordenadoPorDistancia = false;

  constructor(
    private http: HttpClient,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit() {
    this.especialidadFiltro = this.especialidadSeleccionadaInicial;
    this.especialidadesDisponibles = this.especialidades;
    this.inicializarDatos();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  inicializarDatos() {
    // Procesar centros y obtener especialidades disponibles
    this.procesarCentros();
    this.aplicarFiltros();
  }

  procesarCentros() {
    // Aquí podrías hacer una llamada al backend para obtener las especialidades de cada centro
    // Por ahora, simulamos que todos los centros tienen todas las especialidades
    this.centrosFiltrados = this.centros.map(centro => ({
      ...centro,
      especialidadesDisponibles: this.especialidades.map(e => e.nombre)
    }));
  }

  inicializarMapa() {
    if (!this.mapContainer?.nativeElement) {
      return;
    }

    // Centrar en Argentina por defecto
    this.map = L.map(this.mapContainer.nativeElement).setView([-34.6037, -58.3816], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Agregar marcadores de centros
    this.agregarMarcadoresCentros();
  }

  agregarMarcadoresCentros() {
    // Limpiar marcadores existentes
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    this.centrosFiltrados.forEach((centro, index) => {
      if (centro.latitud && centro.longitud) {
        const marker = L.marker([centro.latitud, centro.longitud])
          .bindPopup(this.crearPopupCentro(centro, index + 1))
          .addTo(this.map);

        marker.on('click', () => {
          this.seleccionarCentro(centro);
        });

        this.markers.push(marker);
      }
    });

    // Ajustar vista si hay centros
    if (this.centrosFiltrados.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      if (this.userMarker) {
        group.addLayer(this.userMarker);
      }
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  crearPopupCentro(centro: CentroMapaInfo, numero: number): string {
    const distancia = centro.distanciaKm !== undefined 
      ? `<div class="popup-distance"><i class="fas fa-route"></i> ${this.formatDistance(centro.distanciaKm)}</div>`
      : '';

    return `
      <div class="centro-popup">
        <div class="popup-header">
          <span class="popup-number">${numero}</span>
          <strong>${centro.nombre}</strong>
        </div>
        <div class="popup-body">
          <div><i class="fas fa-map-marker-alt"></i> ${centro.direccion}</div>
          ${centro.localidad ? `<div><i class="fas fa-city"></i> ${centro.localidad}, ${centro.provincia}</div>` : ''}
          ${centro.telefono ? `<div><i class="fas fa-phone"></i> ${centro.telefono}</div>` : ''}
          ${distancia}
        </div>
      </div>
    `;
  }

  obtenerUbicacionUsuario() {
    this.isLoadingLocation = true;
    this.locationError = null;

    this.geolocationService.getCurrentLocation({
      timeout: 15000,
      enableHighAccuracy: true,
      useIPFallback: true
    }).then(location => {
      this.userLocation = location;
      this.isLoadingLocation = false;
      this.mostrarUbicacionUsuarioEnMapa();
      this.calcularDistancias();
      this.aplicarFiltros();
    }).catch(error => {
      this.isLoadingLocation = false;
      this.locationError = error.message || 'No se pudo obtener la ubicación';
    });
  }

  mostrarUbicacionUsuarioEnMapa() {
    if (!this.userLocation) return;

    // Remover marcador anterior si existe
    if (this.userMarker) {
      this.userMarker.remove();
    }

    // Crear icono personalizado para el usuario
    const userIcon = L.divIcon({
      html: '<i class="fas fa-user"></i>',
      iconSize: [30, 30],
      className: 'user-location-marker'
    });

    this.userMarker = L.marker([this.userLocation.latitude, this.userLocation.longitude], {
      icon: userIcon
    }).bindPopup('Tu ubicación').addTo(this.map);

    // Centrar el mapa en la ubicación del usuario si es la primera vez
    if (this.userLocation.source === 'geolocation') {
      this.map.setView([this.userLocation.latitude, this.userLocation.longitude], 12);
    }
  }

  buscarDireccion() {
    if (!this.direccionBusqueda.trim()) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.direccionBusqueda)}&format=json&limit=1&countrycodes=ar`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          this.latitudManual = parseFloat(lat);
          this.longitudManual = parseFloat(lon);
          this.establecerCoordenadas();
        } else {
          this.locationError = 'No se encontró la dirección especificada';
        }
      },
      error: () => {
        this.locationError = 'Error al buscar la dirección';
      }
    });
  }

  establecerCoordenadas() {
    if (!this.latitudManual || !this.longitudManual) return;

    this.userLocation = this.geolocationService.setManualLocation(
      this.latitudManual,
      this.longitudManual
    );

    this.mostrarUbicacionUsuarioEnMapa();
    this.calcularDistancias();
    this.aplicarFiltros();
    this.showManualLocationForm = false;
    this.locationError = null;
  }

  calcularDistancias() {
    if (!this.userLocation) return;

    this.centrosFiltrados.forEach(centro => {
      if (centro.latitud && centro.longitud) {
        centro.distanciaKm = this.geolocationService.calculateDistance(
          this.userLocation!.latitude,
          this.userLocation!.longitude,
          centro.latitud,
          centro.longitud
        );
      }
    });
  }

  aplicarFiltros() {
    let centrosFiltrados = [...this.centros] as CentroMapaInfo[];

    // Filtrar por especialidad
    if (this.especialidadFiltro) {
      // Aquí filtrarías basado en las especialidades reales de cada centro
      // Por ahora asumimos que todos tienen todas las especialidades
    }

    // Filtrar por radio de distancia
    if (this.userLocation && this.radioMaximo > 0) {
      centrosFiltrados = centrosFiltrados.filter(centro => {
        if (!centro.latitud || !centro.longitud) return false;
        
        const distancia = this.geolocationService.calculateDistance(
          this.userLocation!.latitude,
          this.userLocation!.longitude,
          centro.latitud,
          centro.longitud
        );
        
        centro.distanciaKm = distancia;
        return distancia <= this.radioMaximo;
      });
    } else if (this.userLocation) {
      // Calcular distancias aunque no haya límite
      centrosFiltrados.forEach(centro => {
        if (centro.latitud && centro.longitud) {
          centro.distanciaKm = this.geolocationService.calculateDistance(
            this.userLocation!.latitude,
            this.userLocation!.longitude,
            centro.latitud,
            centro.longitud
          );
        }
      });
    }

    // Ordenar por distancia si está habilitado
    if (this.ordenadoPorDistancia && this.userLocation) {
      centrosFiltrados.sort((a, b) => {
        const distA = a.distanciaKm || 999999;
        const distB = b.distanciaKm || 999999;
        return distA - distB;
      });
    }

    this.centrosFiltrados = centrosFiltrados;
    
    // Actualizar marcadores en el mapa
    if (this.map) {
      this.agregarMarcadoresCentros();
    }
  }

  toggleOrdenarPorDistancia() {
    this.ordenadoPorDistancia = !this.ordenadoPorDistancia;
    this.aplicarFiltros();
  }

  seleccionarCentro(centro: CentroMapaInfo) {
    this.centroActualSeleccionado = centro;
    this.centroSeleccionado.emit(centro);
  }

  centrarEnMapa(centro: CentroMapaInfo, event: Event) {
    event.stopPropagation();
    
    if (centro.latitud && centro.longitud) {
      this.map.setView([centro.latitud, centro.longitud], 15);
      
      // Encontrar y abrir el popup del marcador
      const marker = this.markers.find(m => {
        const pos = m.getLatLng();
        return pos.lat === centro.latitud && pos.lng === centro.longitud;
      });
      
      if (marker) {
        marker.openPopup();
      }
    }
  }

  ampliarRadio() {
    if (this.radioMaximo === 10) this.radioMaximo = 25;
    else if (this.radioMaximo === 25) this.radioMaximo = 50;
    else if (this.radioMaximo === 50) this.radioMaximo = 100;
    else if (this.radioMaximo === 100) this.radioMaximo = 0;
    
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.especialidadFiltro = '';
    this.radioMaximo = 50;
    this.aplicarFiltros();
  }

  formatDistance(distance: number): string {
    return this.geolocationService.formatDistance(distance);
  }

  close() {
    this.modalCerrado.emit();
  }
}
