import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({
  selector: 'app-map-modal',
  standalone: true, // Declarar como componente standalone
  imports: [FormsModule], // Importar FormsModule aquí
  template: `
    <div class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar ubicación</h5>
          <button type="button" class="btn-close" (click)="close()"></button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-3">
            <label for="search">Buscar ubicación:</label>
            <input id="search" type="text" class="form-control" [(ngModel)]="searchQuery" placeholder="Ingrese una dirección">
            <button class="btn btn-primary mt-2" (click)="searchLocation()">Buscar</button>
          </div>
          <div #mapContainer style="height: 500px; width: 100%;"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
    }
    .modal-content {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      width: 80%;
      max-width: 600px;
      z-index: 1051;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }
    .modal-body {
      padding: 1rem;
    }
  `]
})
export class MapModalComponent {
  @Output() locationSelected = new EventEmitter<{ latitud: number, longitud: number } | null>();
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map!: L.Map;
  searchQuery: string = ''; // Campo para la búsqueda

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([-38.4161, -63.6167], 5); // Coordenadas iniciales (Centro de Argentina)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      // Redondear las coordenadas a 4 decimales
      const latRounded = lat.toFixed(3);
      const lngRounded = lng.toFixed(3);

      const coordenadas = { latitud: +latRounded, longitud: +lngRounded };
      this.locationSelected.emit(coordenadas); // Emitir las coordenadas seleccionadas
      this.close(); // Cerrar el modal automáticamente
    });
  }

  searchLocation(): void {
    if (!this.searchQuery) {
      alert('Por favor, ingrese una dirección para buscar.');
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery)}&format=json&limit=1`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          this.map.setView([+lat, +lon], 15); // Centrar el mapa en las coordenadas encontradas
          L.marker([+lat, +lon]).addTo(this.map).bindPopup(this.searchQuery).openPopup();
        } else {
          alert('No se encontraron resultados para la búsqueda.');
        }
      },
      error: (err) => {
        console.error('Error al buscar la ubicación:', err);
        alert('Ocurrió un error al buscar la ubicación. Intente nuevamente.');
      }
    });
  }

  close(): void {
    this.map.remove(); // Destruir el mapa para liberar recursos
    this.locationSelected.emit(null); // Emitir null si se cierra sin seleccionar
  }
}