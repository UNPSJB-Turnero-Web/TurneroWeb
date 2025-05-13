import { Component, AfterViewInit } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAtencion } from './centroAtencion';
import { ActivatedRoute } from '@angular/router';
import { CentroAtencionService } from './centroAtencion.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import { ModalService } from '../modal/modal.service';
import { HttpClient } from '@angular/common/http'; 
import { MapModalComponent } from '../modal/map-modal.component'; 
@Component({
  selector: 'app-centro-atencion-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule, MapModalComponent],
  template: `
<div *ngIf="centroAtencion">
  <h2>{{ centroAtencion.id === 0 ? 'Agregando Centro de Atención' : centroAtencion.name | uppercase }}</h2>
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
      <input name="direccion" required placeholder="Dirección" class="form-control" [(ngModel)]="centroAtencion.direccion" [ngModelOptions]="{standalone: true}">
    </div>

    <div class="form-group">
      <label for="localidad">Localidad:</label>
      <input name="localidad" required placeholder="Localidad" class="form-control" [(ngModel)]="centroAtencion.localidad" [ngModelOptions]="{standalone: true}">
    </div>

    <div class="form-group">
      <label for="provincia">Provincia:</label>
      <input name="provincia" required placeholder="Provincia" class="form-control" [(ngModel)]="centroAtencion.provincia" [ngModelOptions]="{standalone: true}">
    </div>
    <div class="form-group">
      <label for="telefono">Teléfono:</label>
      <input
        name="telefono"
        placeholder="Teléfono"
        class="form-control"
        [(ngModel)]="centroAtencion.telefono"
        [ngModelOptions]="{standalone: true}"
        pattern="^[0-9]*$"
        #telefono="ngModel"
        required
      >
      <div *ngIf="telefono.invalid && (telefono.dirty || telefono.touched)" class="alert">
        <div *ngIf="telefono.errors?.['pattern']">
          Solo se permiten números en el teléfono.
        </div>
        <div *ngIf="telefono.errors?.['required']">
          El teléfono es requerido.
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label for="coordenadas">Coordenadas:</label>
      <input name="coordenadas" placeholder="latitud,longitud" class="form-control" [(ngModel)]="coordenadas" [ngModelOptions]="{standalone: true}">
    </div>
    <div class="form-group">
      <button type="button" class="btn btn-primary" (click)="toggleMap()">Marcar en el mapa</button>
    </div>

    <button (click)="goBack()" class="btn btn-danger">Atrás</button>
    <button (click)="save()" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
    <!-- Solo muestra el botón si el centro ya existe -->
    <button *ngIf="centroAtencion.id" (click)="remove(centroAtencion)" class="btn btn-danger">Eliminar</button>
  </form>
</div>
<app-map-modal *ngIf="showMap" (locationSelected)="onLocationSelected($event)"></app-map-modal>
  `,
  styles: ``
})
export class CentroAtencionDetailComponent implements AfterViewInit {
  centroAtencion!: CentroAtencion;
  coordenadas: string = ''; // <-- Agrega esta línea
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
  }

  initializeMap(): void {
    this.map = L.map('map').setView([-38.4161, -63.6167], 5); // Coordenadas iniciales (Centro de Argentina)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.centroAtencion.latitud = +lat.toFixed(3);
      this.centroAtencion.longitud = +lng.toFixed(3);
      alert(`Ubicación marcada: ${this.centroAtencion.latitud}, ${this.centroAtencion.longitud}`);
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
    // Si hay coordenadas, separarlas y asignarlas a latitud/longitud
    if (this.centroAtencion.coordenadas) {
      const [lat, lng] = this.centroAtencion.coordenadas.split(',').map(c => Number(c.trim()));
      this.centroAtencion.latitud = lat;
      this.centroAtencion.longitud = lng;
    }
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
    if (centro.id === undefined) {
      alert('No se puede eliminar: el centro no tiene ID.');
      return;
    }
    this.modalService
      .confirm(
        "Eliminar centro de atención",
        "¿Está seguro que desea eliminar el centro de atención?",
        "Si elimina el centro no lo podrá utilizar luego"
      )
      .then(() => {
        this.centroAtencionService.delete(centro.id!).subscribe({
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
      // Configuración para un nuevo centro de atención
      this.centroAtencion = {
        name: '',
        code: '',
        direccion: '',
        localidad: '',
        provincia: '',
        telefono: '', 
        latitud: 0,
        longitud: 0
      } as CentroAtencion;
      this.coordenadas = '';
    } else if (path === 'centrosAtencion/:id') {
      // Configuración para editar un centro de atención existente
      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) {
        console.error('El ID proporcionado no es válido.');
        return;
      }
  
      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }
  
      this.centroAtencionService.get(id).subscribe({
        next: (dataPackage) => {
          this.centroAtencion = <CentroAtencion>dataPackage.data;
        },
        error: (err) => {
          console.error('Error al obtener el centro de atención:', err);
          alert('No se pudo cargar el centro de atención. Intente nuevamente.');
        }
      });
    } else {
      console.error('Ruta no reconocida.');
    }
  }
  ngOnInit(): void {
    this.get();
  }

  onLocationSelected(coords: { latitud: number, longitud: number } | null): void {
    if (coords) {
      this.centroAtencion.latitud = coords.latitud;
      this.centroAtencion.longitud = coords.longitud;
      this.coordenadas = `${coords.latitud},${coords.longitud}`;
      alert(`Ubicación marcada: ${this.coordenadas}`);
    }
    this.showMap = false;
  }
}