import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAtencion } from './centroAtencion';
import { ActivatedRoute, Router } from '@angular/router';
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
  imports: [FormsModule, CommonModule, NgbTypeaheadModule, MapModalComponent, RouterModule],
  templateUrl: './centroAtencion-detail.component.html',
  styles: `
    /* Global CSS Variables Integration */
    .card {
      border-radius: 1.5rem;
      border: none;
      box-shadow: var(--centro-atencion-shadow);
      backdrop-filter: blur(10px);
      overflow: hidden;
      position: relative;
      background: rgba(255, 255, 255, 0.95);
      animation: fadeInUp 0.6s ease-out;
    }

    .card-header {
      background: var(--centro-atencion-gradient);
      padding: 2rem;
      border: none;
      position: relative;
      overflow: hidden;
    }

    .card-body {
      padding: 2.5rem;
    }

    .card-footer {
      background: rgba(248, 249, 250, 0.8);
      border-top: 1px solid var(--centro-atencion-light);
      padding: 1.5rem;
    }

    /* Info Display Items */
    .info-item {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid var(--centro-atencion-primary);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .info-item:hover {
      transform: translateY(-3px);
      box-shadow: var(--centro-atencion-shadow);
      border-left-color: var(--centro-atencion-secondary);
    }

    .info-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .info-label {
      font-weight: 600;
      color: var(--centro-atencion-primary);
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1.1rem;
      color: #495057;
      font-weight: 500;
    }

    /* Form Groups */
    .form-group-modern {
      margin-bottom: 2rem;
      position: relative;
    }

    .form-label-modern {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--centro-atencion-primary);
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .form-icon {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
      margin-right: 0.75rem;
    }

    .form-control {
      border-radius: 15px;
      border: 2px solid var(--centro-atencion-light);
      padding: 15px 20px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      background: rgba(255,255,255,0.9);
    }

    .form-control:focus {
      border-color: var(--centro-atencion-primary);
      box-shadow: 0 0 0 0.2rem var(--centro-atencion-light);
      background: white;
      transform: translateY(-2px);
      outline: none;
    }

    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.5rem;
      font-style: italic;
    }

    /* Modern Buttons */
    .btn-modern {
      border-radius: 50px;
      padding: 12px 30px;
      font-weight: 600;
      border: none;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .btn-back {
      background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%);
      color: white;
    }

    .btn-edit {
      background: var(--disponibilidad-gradient);
      color: white;
    }

    .btn-delete {
      background: var(--obra-social-gradient);
      color: white;
    }

    .btn-save {
      background: var(--medicos-gradient);
      color: white;
    }

    .btn-cancel {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    /* Modern Tab Styling */
    .modern-tabs .nav-link {
      font-weight: 600;
      color: var(--centro-atencion-primary);
      border: none;
      background: none;
      border-radius: 15px 15px 0 0;
      transition: all 0.3s ease;
      margin-right: 0.25rem;
      padding: 1rem 2rem;
      font-size: 1rem;
      position: relative;
      overflow: hidden;
    }

    .modern-tabs .nav-link::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 3px;
      background: var(--centro-atencion-gradient);
      transition: width 0.3s ease;
    }

    .modern-tabs .nav-link.active::before {
      width: 100%;
    }

    .modern-tabs .nav-link.active {
      color: #fff !important;
      background: var(--centro-atencion-gradient);
      box-shadow: var(--centro-atencion-shadow);
      border: none;
    }

    .modern-tabs .nav-link:hover:not(.active) {
      background: var(--centro-atencion-light);
      color: var(--centro-atencion-secondary);
      transform: translateY(-2px);
    }

    /* Table Styling */
    .modern-table {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: var(--centro-atencion-shadow);
      background: white;
    }

    .modern-table thead th {
      background: var(--centro-atencion-gradient);
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.9rem;
      padding: 1.25rem 1rem;
      border: none;
    }

    .modern-table tbody tr {
      transition: all 0.3s ease;
      border: none;
    }

    .modern-table tbody tr:hover {
      background: var(--centro-atencion-light);
      transform: translateY(-1px);
    }

    .modern-table tbody td {
      padding: 1.25rem 1rem;
      border: none;
      border-bottom: 1px solid var(--centro-atencion-light);
      vertical-align: middle;
    }

    /* Map Container */
    .map-container {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: var(--centro-atencion-shadow);
      height: 400px;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Alert Messages */
    .modern-alert {
      border-radius: 15px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      border: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .modern-alert.alert-success {
      background: var(--medicos-light);
      color: var(--medicos-primary);
      border-left: 4px solid var(--medicos-primary);
    }

    .modern-alert.alert-danger {
      background: var(--obra-social-light);
      color: var(--obra-social-primary);
      border-left: 4px solid var(--obra-social-primary);
    }

    .modern-alert.alert-info {
      background: var(--centro-atencion-light);
      color: var(--centro-atencion-primary);
      border-left: 4px solid var(--centro-atencion-primary);
    }

    /* Action Buttons */
    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      font-size: 1rem;
      transition: all 0.3s ease;
      margin: 0 2px;
      position: relative;
      overflow: hidden;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .action-btn.btn-edit {
      background: var(--disponibilidad-gradient);
      color: white;
    }

    .action-btn.btn-delete {
      background: var(--obra-social-gradient);
      color: white;
    }

    .action-btn.btn-add {
      background: var(--medicos-gradient);
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .card-body {
        padding: 1.5rem;
      }
      
      .modern-tabs .nav-link {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
      }
      
      .info-item {
        padding: 1rem;
      }
      
      .btn-modern {
        padding: 10px 20px;
        font-size: 0.8rem;
      }
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
  form: any = { invalid: false, valid: true };

  modoEdicion = false;
  especialidadesAsociadas: Especialidad[] = [];
  especialidadSeleccionada: Especialidad | null = null;
  activeTab: string = 'detalle';

  mensaje: string = '';
  tipoMensaje: 'info' | 'danger' | 'success' = 'info';

  mensajeStaff: string = '';
  tipoMensajeStaff: 'info' | 'danger' | 'success' = 'info';

  modoCrearConsultorio = false;
  nuevoConsultorio = { numero: null, nombre: '' };
  mensajeConsultorio: string = '';
  tipoMensajeConsultorio: 'info' | 'danger' | 'success' = 'info';
  editConsultorioIndex: number | null = null;

  // Nuevas variables para médicos y especialidades
  medicoSeleccionado: Medico | null = null;
  especialidadesDisponibles: Especialidad[] = []; // Para el tab de Especialidades
  especialidadesMedico: Especialidad[] = []; // Para el tab de Staff Médico
  constructor(
    private route: ActivatedRoute,
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService,
    private http: HttpClient,
    private consultorioService: ConsultorioService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private medicoService: MedicoService,
    private router: Router
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
    this.router.navigate(['/centrosAtencion']);
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.get(); // Reload original data
  }

  confirmDelete(centro: CentroAtencion): void {
    if (centro.id === undefined) {
      this.modalService.alert('Error', 'No se puede eliminar: el centro no tiene ID.');
      return;
    }
    
    this.modalService
      .confirm(
        "Eliminar centro de atención",
        "¿Está seguro que desea eliminar el centro de atención?",
        "Si elimina el centro no lo podrá utilizar luego"
      )
      .then(() => {
        this.remove(centro);
      })
      .catch(() => {
        // User cancelled
      });
  }

  save(): void {
    try {
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
          this.modalService.alert('Éxito', 'Centro de atención guardado correctamente.');
        },
        error: (err) => {
          console.error('Error al guardar el centro de atención:', err);
          this.modalService.alert('Error', 'No se pudo guardar el centro de atención. Intente nuevamente.');
        }
      });
    } catch (error) {
      console.error('Error en save():', error);
      this.modalService.alert('Error', 'Ocurrió un error inesperado al guardar.');
    }
  }

  remove(centro: CentroAtencion): void {
    if (centro.id === undefined) {
      this.modalService.alert('Error', 'No se puede eliminar: el centro no tiene ID.');
      return;
    }
    
    this.centroAtencionService.delete(centro.id!).subscribe({
      next: () => {
        this.modalService.alert('Éxito', 'Centro de atención eliminado correctamente.');
        this.goBack();
      },
      error: (err) => {
        console.error('Error al eliminar el centro de atención:', err);
        this.modalService.alert('Error', 'No se pudo eliminar el centro de atención. Intente nuevamente.');
      }
    });
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'centrosAtencion/new') {
      // Nuevo centro
      this.modoEdicion = true;
      this.centroAtencion = {
        nombre: '',
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
    // Check if the minimum required fields are empty
    return !this.centroAtencion.nombre || !this.centroAtencion.direccion || 
           !this.centroAtencion.localidad || !this.centroAtencion.provincia;
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

    this.especialidadService.all().subscribe({
      next: (todasEspecialidades) => {
        const especialidadesAsociadasIds = this.especialidadesAsociadas.map(e => e.id);
        this.especialidadesDisponibles = todasEspecialidades.data.filter(
          (esp: Especialidad) => !especialidadesAsociadasIds.includes(esp.id)
        );
      },
      error: () => {
        this.especialidadesDisponibles = [];
      }
    });
  }
  cargarEspecialidadesAsociadas() {
    if (!this.centroAtencion?.id) return;

    this.especialidadService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (data: any) => {
        this.especialidadesAsociadas = Array.isArray(data.data) ? data.data : [];
        console.log('Especialidades asociadas al centro:', this.especialidadesAsociadas);
      },
      error: () => {
        this.especialidadesAsociadas = [];
        console.log('Error al cargar las especialidades asociadas al centro.');
      }
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



  cancelarEdicion() {
    this.modoEdicion = false;
    // Opcional: recargar datos originales
  }

  crearConsultorio() {
    if (!this.nuevoConsultorio.numero || !this.nuevoConsultorio.nombre) return;

    // Verificar si ya existe un consultorio con el mismo número
    if (this.consultorios.some(c => c.numero === this.nuevoConsultorio.numero)) {
      this.mensajeConsultorio = 'Ya existe un consultorio con ese número en este centro.';
      setTimeout(() => this.mensajeConsultorio = '', 5000);
      return;
    }

    // Crear el objeto consultorio con la referencia al centro de atención
    const consultorio: Consultorio = {
      numero: this.nuevoConsultorio.numero,
      nombre: this.nuevoConsultorio.nombre,
      centroId: this.centroAtencion.id // Asignar el ID del centro
    };

    // Enviar el consultorio al backend
    this.consultorioService.create(consultorio).subscribe({
      next: () => {
        this.mensajeConsultorio = 'Consultorio creado correctamente';
        setTimeout(() => this.mensajeConsultorio = '', 3000);
        this.getConsultorios(); // Recargar la lista de consultorios
        this.nuevoConsultorio = { numero: null, nombre: '' }; // Limpiar el formulario
        this.modoCrearConsultorio = false; // Salir del modo de creación
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

    // Validar si la especialidad seleccionada está asociada al centro
    const especialidadAsociada = this.especialidadesAsociadas.some(
      e => e.id === this.especialidadSeleccionada!.id
    );

    if (!especialidadAsociada) {
      this.mostrarMensajeStaff(
        `La especialidad "${this.especialidadSeleccionada.nombre}" no está asociada al centro.`,
        'danger'
      );
      return;
    }

    const nuevoStaff: StaffMedico = {
      id: 0,
      centroAtencionId: this.centroAtencion.id,
      medicoId: this.medicoSeleccionado.id,
      especialidadId: this.especialidadSeleccionada.id,
      medico: this.medicoSeleccionado,
      especialidad: this.especialidadSeleccionada,
      centro: { id: this.centroAtencion.id, nombre: this.centroAtencion.nombre }
    };

    this.staffMedicoService.create(nuevoStaff).subscribe({
      next: () => {
        this.mostrarMensajeStaff('Médico asociado correctamente.', 'success');
        this.loadStaffMedico();
        this.medicoSeleccionado = null;
        this.especialidadSeleccionada = null;
      },
      error: (err) => {
        const mensajeError = err?.error?.message || 'Error al asociar médico.';
        this.mostrarMensajeStaff(mensajeError, 'danger');
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

  eliminarConsultorio(consultorio: Consultorio): void {
  if (!consultorio.id) {
    alert('No se puede eliminar un consultorio sin ID.');
    return;
  }

  const confirmar = confirm(`¿Está seguro que desea eliminar el consultorio "${consultorio.nombre}"?`);
  if (!confirmar) return;

  this.consultorioService.delete(consultorio.id).subscribe({
    next: () => {
      this.mostrarMensajeConsultorio('Consultorio eliminado correctamente.', 'success');
      this.getConsultorios(); // Recargar la lista de consultorios
    },
    error: (err) => {
      const mensajeError = err?.error?.status_text || 'No se pudo eliminar el consultorio.';
      this.mostrarMensajeConsultorio(mensajeError, 'danger');
    }
  });
}
agregarDisponibilidad(staff: any): void {
  this.router.navigate(['/disponibilidades-medico/new'], { queryParams: { staffMedicoId: staff.id } });
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
    // Si no hay médico seleccionado, limpiar las especialidades del médico
    console.log('No hay médico seleccionado.');
    this.especialidadesMedico = [];
    this.especialidadSeleccionada = null;
    return;
  }

  // Obtener la especialidad del médico seleccionado directamente del objeto
  const especialidadMedico = this.medicoSeleccionado.especialidad;

  if (!especialidadMedico) {
    // Si el médico no tiene especialidad, limpiar las especialidades del médico
    console.log('El médico seleccionado no tiene especialidad.');
    this.especialidadesMedico = [];
    this.especialidadSeleccionada = null;
    return;
  }

  console.log('Especialidad del médico seleccionado:', especialidadMedico);

  // Asignar la especialidad del médico al desplegable
  this.especialidadesMedico = [especialidadMedico];
  this.especialidadSeleccionada = especialidadMedico;

  // IDs de especialidades asociadas al centro
  const especialidadesCentroIds = this.especialidadesAsociadas.map(e => e.id);

  // Validar si la especialidad del médico está asociada al centro
  if (!especialidadesCentroIds.includes(especialidadMedico.id)) {
    // Si no está asociada, mostrar mensaje de confirmación
    console.log('La especialidad del médico no está asociada al centro.');
    const confirmar = confirm(`La especialidad "${especialidadMedico.nombre}" no está asociada al centro. ¿Desea agregarla?`);
    if (confirmar) {
      this.asociarEspecialidadAlCentro(especialidadMedico);
    }
  } else {
    console.log('La especialidad del médico está asociada al centro.');
  }
}
asociarEspecialidadAlCentro(especialidad: Especialidad) {
  if (!this.centroAtencion?.id || !especialidad.id) return;

  this.especialidadService.asociar(this.centroAtencion.id, especialidad.id).subscribe({
    next: () => {
      this.mostrarMensaje(`Especialidad "${especialidad.nombre}" asociada al centro correctamente.`, 'success');
      // Recargar las especialidades asociadas
      this.cargarEspecialidadesAsociadas();
      // Actualizar las especialidades disponibles
      this.cargarEspecialidades();
    },
    error: (err) => {
      const mensajeError = err?.error?.status_text || 'No se pudo asociar la especialidad al centro.';
      this.mostrarMensaje(mensajeError, 'danger');
    }
  });
}
}