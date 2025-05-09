import { Component, AfterViewInit } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAtencion } from './centroAtencion';
import { ActivatedRoute } from '@angular/router';
import { CentroAtencionService } from './centroAtencion.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import { ModalService } from '../modal/modal.service';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient para realizar solicitudes HTTP

@Component({
  selector: 'app-centro-atencion-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
<div *ngIf="centroAtencion">
  <h2>{{ centroAtencion.name | uppercase }}</h2>
  <form #form="ngForm">
    <div class="form-group">
      <label for="name">Nombre:</label>
      <input name="name" required placeholder="Nombre" class="form-control" [(ngModel)]="centroAtencion.name" [ngModelOptions]="{standalone: true}" #name="ngModel">
      <div *ngIf="name.invalid && (name.dirty || name.touched)" class="alert">
        <div *ngIf="name.errors?.['required']">
          El nombre del centro es requerido
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="code">Código:</label>
      <input name="code" placeholder="Código" class="form-control" [(ngModel)]="centroAtencion.code" [ngModelOptions]="{standalone: true}">
    </div>

    <div class="form-group">
      <label for="direccion">Dirección:</label>
      <input name="direccion" placeholder="Dirección" class="form-control" [(ngModel)]="centroAtencion.direccion" [ngModelOptions]="{standalone: true}" readonly>
    </div>

    <div class="form-group">
      <button type="button" class="btn btn-primary" (click)="toggleMap()">Marcar en el mapa</button>
    </div>

    <div *ngIf="showMap">
      <div class="form-group">
        <label for="search">Buscar lugar:</label>
        <input id="search" type="text" class="form-control" [(ngModel)]="searchQuery" [ngModelOptions]="{standalone: true}" placeholder="Buscar lugar...">
        <button type="button" class="btn btn-secondary mt-2" (click)="searchLocation()">Buscar</button>
      </div>
      <div id="map" style="height: 400px; width: 100%; margin-top: 20px;"></div>
    </div>

    <button (click)="goBack()" class="btn btn-danger">Atrás</button>
    <button (click)="save()" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
  </form>
</div>
  `,
  styles: ``
})
export class CentroAtencionDetailComponent implements AfterViewInit {
  centroAtencion!: CentroAtencion;
  showMap: boolean = false;
  private map!: L.Map;
  searchQuery: string = ''; // Campo para la búsqueda

  constructor(
    private route: ActivatedRoute,
    private centroAtencionService: CentroAtencionService,
    private location: Location,
    private modalService: ModalService,
    private http: HttpClient // Inyectar HttpClient
  ) {}

  ngAfterViewInit(): void {
    if (this.showMap) {
      this.initializeMap();
    }
  }

  toggleMap(): void {
    this.showMap = !this.showMap;

    if (this.showMap) {
      // Inicializar el mapa si no existe
      if (!this.map) {
        setTimeout(() => this.initializeMap(), 0); // Asegurarse de que el DOM esté listo
      }
    } else {
      // Si el mapa se oculta, destruirlo para liberar recursos
      if (this.map) {
        this.map.remove();
        this.map = undefined!;
      }
    }
  }

  initializeMap(): void {
    this.map = L.map('map').setView([-38.4161, -63.6167], 5); // Coordenadas iniciales (Centro de Argentina)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.centroAtencion.coordenadas = `${lat},${lng}`; // Guardar las coordenadas como una sola variable
      this.centroAtencion.direccion = `Coordenadas: ${lat}, ${lng}`; // Mostrar en el campo "direccion"
      console.log(`Coordenadas seleccionadas: ${this.centroAtencion.coordenadas}`);
      alert(`Ubicación marcada: ${this.centroAtencion.coordenadas}`);
    });
  }

  searchLocation(): void {
    if (!this.searchQuery) {
      alert('Por favor, ingrese un término de búsqueda.');
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

  goBack(): void {
    this.location.back();
  }

  save(): void {
    console.log('Datos enviados al servicio:', this.centroAtencion);
    this.centroAtencionService.save(this.centroAtencion).subscribe({
      next: (dataPackage) => {
        this.centroAtencion = <CentroAtencion>dataPackage.data;
        this.goBack();
      },
      error: (err) => {
        console.error('Error al guardar el centro de atención:', err);
        alert('No se pudo guardar el centro de atención. Intente nuevamente.');
      }
    });
  }

  remove(centro: CentroAtencion): void {
    this.modalService
      .confirm(
        "Eliminar centro de atención",
        "¿Está seguro que desea eliminar el centro de atención?",
        "Si elimina el centro no lo podrá utilizar luego"
      )
      .then(() => {
        this.centroAtencionService.delete(centro.code).subscribe({
          next: () => {
            this.goBack(); // Redirige al usuario a la lista
          },
          error: (err) => {
            console.error('Error al eliminar el centro de atención:', err);
            alert('No se pudo eliminar el centro de atención. Intente nuevamente.');
          }
        });
      });
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'centrosAtencion/new') {
      this.centroAtencion = {
        id: 0, 
        name: '',
        code: '',
        direccion: '',
        localidad: '',
        provincia: '',  
        coordenadas: ''
      } as CentroAtencion;
    } else {
      const code = this.route.snapshot.paramMap.get('code')!;
      this.centroAtencionService.get(code).subscribe(dataPackage => {
        this.centroAtencion = <CentroAtencion>dataPackage.data;
      });
    }
  }

  ngOnInit(): void {
    this.get();
  }
}
