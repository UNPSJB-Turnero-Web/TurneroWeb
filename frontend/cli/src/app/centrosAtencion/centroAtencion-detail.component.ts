import { Component, AfterViewInit, OnInit } from '@angular/core';
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
import { ConsultorioService } from '../consultorios/consultorio.service';
import { Consultorio } from '../consultorios/consultorio';
import { RouterModule } from '@angular/router';
import { Especialidad } from '../especialidades/especialidad';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { Medico } from '../medicos/medico';
import { MedicoService } from '../medicos/medico.service';

@Component({
  selector: 'app-centro-atencion-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule, MapModalComponent, RouterModule],
  templateUrl: './centroAtencion-detail.component.html',
  styles: `
  .card {
      border-radius: 1rem ;
      overflow: hidden;
      }

.custom-tabs .nav-link {
  font-weight: 500;
  color: #1565c0;
  border: none;
  background: none;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  margin-right: 0.2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.08rem;
  box-shadow: none;
}

.custom-tabs .nav-link.active {
  color: #fff !important;
  background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%);
  box-shadow: 0 4px 16px -8px #1976d2;
  border: none;
}

.custom-tabs .nav-link:hover:not(.active) {
  background: #e3f2fd;
  color: #1976d2;
}
  `
})
export class CentroAtencionDetailComponent implements AfterViewInit, OnInit {
  centroAtencion!: CentroAtencion;
  coordenadas: string = '';
  showMap: boolean = false;
  private map!: L.Map;
  searchQuery: string = '';
  consultorios: Consultorio[] = [];
  staffMedicoCentro: StaffMedico[] = [];
  medicosDisponibles: Medico[] = [];

  modoEdicion = false;
  especialidadesAsociadas: Especialidad[] = [];
  especialidadSeleccionada: Especialidad | null = null;
  activeTab: string = 'detalle';

  mensaje: string = '';
  tipoMensaje: 'info' | 'danger' | 'success' = 'info';

  mensajeStaff: string = '';
  tipoMensajeStaff: 'info' | 'danger' | 'success' = 'info';

  modoCrearConsultorio = false;
  nuevoConsultorio = { numero: null, name: '' };
  mensajeConsultorio: string = '';
  tipoMensajeConsultorio: 'info' | 'danger' | 'success' = 'info';
  editConsultorioIndex: number | null = null;

  // Nuevas variables para médicos y especialidades
  medicoSeleccionado: Medico | null = null;
  especialidadesDisponibles: Especialidad[] = [];

  constructor(
    private route: ActivatedRoute,
    private centroAtencionService: CentroAtencionService,
    private location: Location,
    private modalService: ModalService,
    private http: HttpClient,
    private consultorioService: ConsultorioService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private medicoService: MedicoService // Inyectar el servicio de médicos

  ) { }

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
    if (this.coordenadas) {
      const [lat, lng] = this.coordenadas.split(',').map(c => Number(c.trim()));
      this.centroAtencion.latitud = lat;
      this.centroAtencion.longitud = lng;
    }
    // El código siempre es el id (si existe)
    if (this.centroAtencion.id) {
      this.centroAtencion.code = String(this.centroAtencion.id);
    }
    this.centroAtencionService.save(this.centroAtencion).subscribe({
      next: (dataPackage) => {
        this.centroAtencion = <CentroAtencion>dataPackage.data;
        this.modoEdicion = false;
        this.getConsultorios();

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
            this.goBack();
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
      // Nuevo centro
      this.modoEdicion = true;
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
      this.consultorios = [];
    } else if (path === 'centrosAtencion/:id') {
      // Detalle o edición
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) return;
      const id = Number(idParam);
      if (isNaN(id)) return;
      this.centroAtencionService.get(id).subscribe({
        next: (dataPackage) => {
          this.centroAtencion = <CentroAtencion>dataPackage.data;
          this.centroAtencion.code = String(this.centroAtencion.id);
          if (
            this.centroAtencion.latitud !== undefined &&
            this.centroAtencion.longitud !== undefined &&
            this.centroAtencion.latitud !== 0 &&
            this.centroAtencion.longitud !== 0
          ) {
            this.coordenadas = `${this.centroAtencion.latitud},${this.centroAtencion.longitud}`;
          } else {
            this.coordenadas = '';
          }
          this.getConsultorios();
          this.cargarEspecialidades();
          this.cargarEspecialidadesAsociadas();
          this.loadStaffMedico();
          this.cargarMedicosYEspecialidades(); // Cargar médicos y especialidades disponibles
        },
        error: (err) => {
          alert('No se pudo cargar el centro de atención. Intente nuevamente.');
        }
      });
    } else {
      // Ruta no reconocida
      this.modoEdicion = false;
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

  allFieldsEmpty(): boolean {
    return !this.centroAtencion?.name?.trim() &&
      !this.centroAtencion?.direccion?.trim() &&
      !this.centroAtencion?.localidad?.trim() &&
      !this.centroAtencion?.provincia?.trim() &&
      !this.centroAtencion?.telefono?.trim() &&
      !this.coordenadas?.trim();
  }

  getConsultorios(): void {
    if (this.centroAtencion?.id) {
      this.consultorioService.getByCentroAtencion(this.centroAtencion.id).subscribe({
        next: (data: any) => this.consultorios = data.data,
        error: () => this.consultorios = []
      });
    }
  }
  getEspecialidades(): void {
    if (this.centroAtencion?.id) {
      this.especialidadService.getByCentroAtencion(this.centroAtencion.id).subscribe({
        next: (data: any) => this.consultorios = data.data,
        error: () => this.consultorios = []
      });
    }
  }

  // Inicialización de variables

  // Método para cargar especialidades disponibles
  cargarEspecialidades() {
    if (!this.centroAtencion?.id) return;
    this.especialidadService.getDisponibles(this.centroAtencion.id!).subscribe(disp => {
      this.especialidadesDisponibles = Array.isArray(disp) ? disp : [];
    });
  }

  cargarEspecialidadesAsociadas() {
    if (!this.centroAtencion?.id) return;
    this.especialidadService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (data: any) => {
        // Si tu backend responde { data: [...] }
        this.especialidadesAsociadas = Array.isArray(data.data) ? data.data : [];
      },
      error: () => this.especialidadesAsociadas = []
    });
  }

  asociarEspecialidad() {
    if (!this.especialidadSeleccionada || !this.centroAtencion?.id) return;
    this.especialidadService.asociar(this.centroAtencion.id!, this.especialidadSeleccionada.id!)
      .subscribe({
        next: () => {
          this.mostrarMensaje('Especialidad asociada correctamente.', 'success');
          this.cargarEspecialidades();
          this.cargarEspecialidadesAsociadas(); // <--- refresca la lista
          this.especialidadSeleccionada = null;
        },
        error: err => {
          this.mostrarMensaje('No se pudo asociar la especialidad.', 'danger');
        }
      });
  }

  desasociarEspecialidad(esp: Especialidad) {
    if (!this.centroAtencion?.id || !esp.id) return;
    this.especialidadService.desasociar(this.centroAtencion.id!, esp.id!)
      .subscribe({
        next: () => {
          this.mensaje = 'Especialidad desasociada correctamente';
          this.cargarEspecialidades();
          this.cargarEspecialidadesAsociadas(); // <--- refresca la lista
        },
        error: err => {
          this.mensaje = err.error?.status_text || 'No se pudo desasociar la especialidad';
        }
      });
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    // Opcional: recargar datos originales
  }

  crearConsultorio() {
    if (!this.nuevoConsultorio.numero || !this.nuevoConsultorio.name) return;
    if (this.consultorios.some(c => c.numero === this.nuevoConsultorio.numero)) {
      this.mensajeConsultorio = 'Ya existe un consultorio con ese número en este centro.';
      setTimeout(() => this.mensajeConsultorio = '', 5000);
      return;
    }
    const consultorio: Consultorio = {
      numero: this.nuevoConsultorio.numero,
      name: this.nuevoConsultorio.name,
      centroAtencion: { id: this.centroAtencion.id } as CentroAtencion

    };
    this.consultorioService.create(consultorio)
      .subscribe({
        next: () => {
          this.mensajeConsultorio = 'Consultorio creado correctamente';
          setTimeout(() => this.mensajeConsultorio = '', 3000);
          this.getConsultorios();
          this.nuevoConsultorio = { numero: null, name: '' };
          this.modoCrearConsultorio = false;
        },
        error: (err: any) => {
          this.mensajeConsultorio = err.error?.status_text || 'No se pudo crear el consultorio';
          setTimeout(() => this.mensajeConsultorio = '', 5000);
        }
      });
  }

  editarConsultorio(i: number) {
    this.editConsultorioIndex = i;
  }

  guardarEdicionConsultorio(i: number) {
    const c = this.consultorios[i];
    if (this.consultorios.some((x, idx) => x.numero === c.numero && idx !== i)) {
      this.mensajeConsultorio = 'Ya existe un consultorio con ese número.';
      return;
    }
    if (!c.id) {
      this.mensajeConsultorio = 'No se puede actualizar un consultorio sin ID.';
      return;
    }
    this.consultorioService.update(c.id, {
      ...c,
      centroAtencion: { id: this.centroAtencion.id } as CentroAtencion
    }).subscribe({
      next: () => {
        this.mensajeConsultorio = 'Consultorio actualizado correctamente';
        this.getConsultorios();
        this.editConsultorioIndex = null;
      },
      error: (err: any) => {
        this.mensajeConsultorio = err.error?.status_text || 'No se pudo actualizar el consultorio';
      }
    });
  }

  cancelarEdicionConsultorio() {
    this.editConsultorioIndex = null;
    this.getConsultorios();

  }

  loadStaffMedico() {
    if (!this.centroAtencion?.id) return;
    this.staffMedicoService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dp) => this.staffMedicoCentro = dp.data as StaffMedico[],
      error: (err) => {
        this.staffMedicoCentro = [];
        console.error('Error al cargar staff médico:', err);
      }
    });
  }

  cargarMedicosYEspecialidades() {
    this.medicoService.getAll().subscribe(dp => this.medicosDisponibles = dp.data as Medico[]);
    this.especialidadService.all().subscribe(dp => this.especialidadesDisponibles = dp.data as Especialidad[]);
  }

  medicoYaAsociado(): boolean {
    return !!this.staffMedicoCentro.find(staff =>
      staff.medicoId === this.medicoSeleccionado?.id
    );
  }

  asociarMedico() {
    if (!this.centroAtencion?.id || !this.medicoSeleccionado || !this.especialidadSeleccionada) return;
    if (this.medicoYaAsociado()) {
      this.mensajeStaff = 'El médico ya está asociado a este centro.';
      return;
    }
    const nuevoStaff: StaffMedico = {
      id: 0,
      centroAtencionId: this.centroAtencion.id,
      medicoId: this.medicoSeleccionado.id,
      especialidadId: this.especialidadSeleccionada.id,
      medicoNombre: this.medicoSeleccionado.nombre,
      especialidadNombre: this.especialidadSeleccionada.nombre,
      centroAtencionName: this.centroAtencion.name
    };
    this.staffMedicoService.create(nuevoStaff).subscribe({
      next: () => {
        this.mensajeStaff = 'Médico asociado correctamente.';
        this.loadStaffMedico();
        this.medicoSeleccionado = null;
        this.especialidadSeleccionada = null;
      },
      error: (err) => {
        this.mensajeStaff = err?.error?.message || 'Error al asociar médico.';
      }
    });
  }

  desasociarMedico(staff: StaffMedico) {
    if (!staff.id) return;
    if (!confirm('¿Está seguro que desea desasociar este médico?')) return;
    this.staffMedicoService.remove(staff.id).subscribe({
      next: () => {
        this.mensajeStaff = 'Médico desasociado correctamente.';
        this.loadStaffMedico();
      },
      error: (err) => {
        // El backend debe devolver un mensaje claro si hay turnos activos
        this.mensajeStaff = err?.error?.status_text || 'No se puede desasociar: el médico tiene turnos activos o hubo un error.';
      }
    });
  }

  mostrarMensaje(mensaje: string, tipo: 'info' | 'danger' | 'success' = 'info', ms: number = 3500) {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => this.mensaje = '', ms);
  }

  mostrarMensajeStaff(mensaje: string, tipo: 'info' | 'danger' | 'success' = 'info', ms: number = 3500) {
    this.mensajeStaff = mensaje;
    this.tipoMensajeStaff = tipo;
    setTimeout(() => this.mensajeStaff = '', ms);
  }

  mostrarMensajeConsultorio(mensaje: string, tipo: 'info' | 'danger' | 'success' = 'info', ms: number = 3500) {
    this.mensajeConsultorio = mensaje;
    this.tipoMensajeConsultorio = tipo;
    setTimeout(() => this.mensajeConsultorio = '', ms);
  }

  onMedicoSeleccionado() {
    if (!this.medicoSeleccionado) {
      this.especialidadesDisponibles = [];
      this.especialidadSeleccionada = null;
      return;
    }
    // IDs de especialidades ya asociadas a este médico en este centro
    const especialidadesAsociadasIds = this.staffMedicoCentro
      .filter(s => s.medicoId === this.medicoSeleccionado!.id)
      .map(s => s.especialidadId);

    // Mostrar solo las especialidades que NO están asociadas aún
    this.especialidadesDisponibles = this.especialidadesAsociadas
      .filter(e => !especialidadesAsociadasIds.includes(e.id));
    this.especialidadSeleccionada = null;
  }
}