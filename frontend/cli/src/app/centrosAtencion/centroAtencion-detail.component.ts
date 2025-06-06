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
import { EsquemaTurno } from '../esquemaTurno/esquemaTurno';
import { EsquemaTurnoService } from '../esquemaTurno/esquemaTurno.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';

@Component({
  selector: 'app-centro-atencion-detail',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbTypeaheadModule, MapModalComponent, RouterModule],
  templateUrl: './centroAtencion-detail.component.html',
  styleUrls: ['./centroAtencion-detail.component.css'],

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
  especialidadesDisponibles: Especialidad[] = [];
  especialidadesMedico: Especialidad[] = [];
  mensaje: string = '';
  tipoMensaje: string = '';
  mensajeConsultorio: string = '';
  tipoMensajeConsultorio: string = '';
  mensajeStaff: string = '';
  tipoMensajeStaff: string = '';
  activeTab: string = 'detalle';
  modoCrearConsultorio: boolean = false;
  editConsultorioIndex: number | null = null;
  nuevoConsultorio: { numero: number | null, nombre: string } = { numero: null, nombre: '' };
  medicoSeleccionado: Medico | null = null;
  consultorioExpandido: { [consultorioId: number]: boolean } = {};
  esquemasConsultorio: { [consultorioId: number]: EsquemaTurno[] } = {};
  disponibilidadesMedico: DisponibilidadMedico[] = [];
  esquemasDisponibles: EsquemaTurno[] = [];
  esquemaSeleccionado: { [consultorioId: number]: number } = {};
  constructor(
    private route: ActivatedRoute,
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService,
    private http: HttpClient,
    private consultorioService: ConsultorioService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private medicoService: MedicoService,
    private esquemaTurnoService: EsquemaTurnoService,
    private disponibilidadMedicoService: DisponibilidadMedicoService,
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
          this.cargarEsquemasTurno(); // Cargar esquemas de turno
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
  
  /**
   * Controla la expansión y colapso del panel de consultorios
   */
  toggleConsultorioExpansion(consultorio: Consultorio): void {
    if (!consultorio.id) return;
    
    // Invierte el estado de expansión del consultorio
    this.consultorioExpandido[consultorio.id] = !this.consultorioExpandido[consultorio.id];
    
    // Si se está expandiendo, cargar esquemas disponibles y recargar esquemas asignados
    if (this.consultorioExpandido[consultorio.id]) {
      this.cargarEsquemasDisponibles(consultorio);
      // Recargar esquemas específicos para este consultorio
      this.cargarEsquemasConsultorio(consultorio);
    }
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

  cargarEsquemasTurno() {
    if (!this.centroAtencion?.id) {
      console.log('No hay centro de atención ID para cargar esquemas');
      return;
    }
    
    console.log('Cargando esquemas de turno para centro ID:', this.centroAtencion.id);
    
    // Primero intentar cargar todos los esquemas para ver si hay datos
    this.esquemaTurnoService.all().subscribe({
      next: (dataPackage) => {
        console.log('Todos los esquemas disponibles:', dataPackage);
      },
      error: (err) => {
        console.error('Error cargando todos los esquemas:', err);
      }
    });
    
    // Cargar esquemas de turno del centro
    this.esquemaTurnoService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dataPackage) => {
        console.log('Respuesta esquemas de turno:', dataPackage);
        const esquemas = dataPackage.data as EsquemaTurno[];
        console.log('Esquemas obtenidos:', esquemas);
        
        // Agrupar esquemas por consultorio
        this.esquemasConsultorio = {};
        esquemas.forEach(esquema => {
          console.log('Procesando esquema:', esquema);
          if (esquema.consultorioId) {
            if (!this.esquemasConsultorio[esquema.consultorioId]) {
              this.esquemasConsultorio[esquema.consultorioId] = [];
            }
            this.esquemasConsultorio[esquema.consultorioId].push(esquema);
          }
        });
        console.log('Esquemas agrupados por consultorio:', this.esquemasConsultorio);
      },
      error: (err) => {
        console.error('Error cargando esquemas de turno:', err);
        console.error('Detalles del error:', err.message, err.status);
      }
    });

    // Cargar todas las disponibilidades médicas y filtrar por centro
    this.disponibilidadMedicoService.all().subscribe({
      next: (dataPackage) => {
        console.log('Respuesta disponibilidades médicas:', dataPackage);
        const todasDisponibilidades = dataPackage.data as DisponibilidadMedico[];
        this.disponibilidadesMedico = todasDisponibilidades.filter(disp => 
          disp.staffMedico?.centroAtencionId === this.centroAtencion.id
        );
        console.log('Disponibilidades filtradas para el centro:', this.disponibilidadesMedico);
      },
      error: (err) => {
        console.error('Error cargando disponibilidades médicas:', err);
      }
    });
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

  /**
   * Edita un esquema de turno, navegando al componente de edición
   */
  editarEsquema(esquema: EsquemaTurno): void {
    if (!esquema.id) {
      this.mostrarMensajeConsultorio('No se puede editar un esquema sin ID', 'danger');
      return;
    }
    
    // Navegar al componente de edición de esquemas de turno
    this.router.navigate(['/esquemas-turno', esquema.id], { 
      queryParams: { 
        edit: 'true',
        centroAtencionId: this.centroAtencion.id
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

// Métodos para gestión de esquemas de turno

debugEsquemas(): void {
  console.log('=== DEBUG ESQUEMAS ===');
  console.log('Centro de atención:', this.centroAtencion);
  console.log('Consultorios:', this.consultorios);
  console.log('Esquemas por consultorio:', this.esquemasConsultorio);
  console.log('Disponibilidades médico:', this.disponibilidadesMedico);
  console.log('Staff médico centro:', this.staffMedicoCentro);
  
  // Forzar recarga de esquemas
  this.cargarEsquemasTurno();
}

gestionarEsquemaTurno(consultorio: Consultorio): void {
  // Navegar al componente de esquemas de turno con parámetros del consultorio
  this.router.navigate(['/esquemas-turno/new'], { 
    queryParams: { 
      centroAtencionId: this.centroAtencion.id,
      consultorioId: consultorio.id,
      consultorioNombre: consultorio.nombre
    } 
  });
}

verEsquemasConsultorio(consultorio: Consultorio): EsquemaTurno[] {
  return this.esquemasConsultorio[consultorio.id!] || [];
}

/**
 * Carga los esquemas disponibles para asignar a un consultorio
 */
cargarEsquemasDisponibles(consultorio: Consultorio): void {
  if (!this.centroAtencion?.id) return;
  
  this.esquemaTurnoService.getDisponibles(this.centroAtencion.id).subscribe({
    next: (esquemas) => {
      this.esquemasDisponibles = esquemas || [];
    },
    error: (err) => {
      console.error('Error al cargar esquemas disponibles:', err);
      this.esquemasDisponibles = [];
    }
  });
}

/**
 * Maneja la selección de un esquema en el dropdown
 */
onEsquemaSeleccionado(consultorio: Consultorio, event: any): void {
  const esquemaId = parseInt(event.target.value);
  if (esquemaId && consultorio.id) {
    this.esquemaSeleccionado[consultorio.id] = esquemaId;
  }
}

/**
 * Verifica si un esquema ya está asignado a un consultorio
 */
yaEstaAsignado(consultorio: Consultorio, esquema: EsquemaTurno): boolean {
  const esquemasAsignados = this.verEsquemasConsultorio(consultorio);
  return esquemasAsignados.some(e => e.id === esquema.id);
}

/**
 * Asigna un esquema seleccionado al consultorio
 */
asignarEsquemaConsultorio(consultorio: Consultorio): void {
  if (!consultorio.id || !this.esquemaSeleccionado[consultorio.id]) {
    return;
  }

  const esquemaId = this.esquemaSeleccionado[consultorio.id];
  const esquemaSeleccionado = this.esquemasDisponibles.find(e => e.id === esquemaId);
  
  if (!esquemaSeleccionado) {
    this.mostrarMensajeConsultorio('Esquema no encontrado', 'danger');
    return;
  }

  // Crear una copia del esquema con el nuevo consultorio
  const esquemaParaAsignar: EsquemaTurno = {
    ...esquemaSeleccionado,
    id: 0, // Nuevo registro
    consultorioId: consultorio.id
  };

  this.esquemaTurnoService.create(esquemaParaAsignar).subscribe({
    next: (dataPackage) => {
      this.mostrarMensajeConsultorio(
        `Esquema asignado exitosamente al consultorio ${consultorio.nombre}`,
        'success'
      );
      // Limpiar selección
      delete this.esquemaSeleccionado[consultorio.id!];
      // Recargar esquemas
      this.cargarEsquemasTurno();
    },
    error: (err) => {
      const mensajeError = err?.error?.status_text || 'Error al asignar el esquema';
      this.mostrarMensajeConsultorio(mensajeError, 'danger');
    }
  });
}

/**
 * Desasigna un esquema de un consultorio
 */
desasignarEsquemaConsultorio(consultorio: Consultorio, esquema: EsquemaTurno): void {
  if (confirm(`¿Está seguro de quitar el esquema de Dr. ${esquema.staffMedico?.medico?.apellido} del consultorio ${consultorio.nombre}?`)) {
    this.esquemaTurnoService.remove(esquema.id).subscribe({
      next: () => {
        this.mostrarMensajeConsultorio(
          `Esquema desasignado del consultorio ${consultorio.nombre}`,
          'success'
        );
        this.cargarEsquemasTurno(); // Recargar esquemas
      },
      error: (err) => {
        const mensajeError = err?.error?.status_text || 'Error al desasignar el esquema';
        this.mostrarMensajeConsultorio(mensajeError, 'danger');
      }
    });
  }
}

/**
 * Crea un nuevo esquema rápido para un consultorio
 */
crearNuevoEsquemaRapido(consultorio: Consultorio): void {
  // Navegar al formulario de creación de esquemas
  this.router.navigate(['/esquemas-turno/new'], { 
    queryParams: { 
      consultorioId: consultorio.id,
      centroAtencionId: this.centroAtencion.id,
      modo: 'rapido'
    } 
  });
}

gestionarDisponibilidadAvanzada(staff: StaffMedico): void {
  // Navegar a disponibilidad médica con más opciones
  this.router.navigate(['/disponibilidades-medico/new'], { 
    queryParams: { 
      staffMedicoId: staff.id,
      centroAtencionId: this.centroAtencion.id,
      modo: 'avanzado'
    } 
  });
}  /**
   * Carga los esquemas asignados específicamente a un consultorio
   */
  cargarEsquemasConsultorio(consultorio: Consultorio): void {
    if (!consultorio.id || !this.centroAtencion?.id) return;
    
    // Filtrar esquemas ya cargados por consultorio
    const esquemasFiltrados = Object.values(this.esquemasConsultorio).flat()
      .filter(esquema => esquema.consultorioId === consultorio.id);
    
    this.esquemasConsultorio[consultorio.id] = esquemasFiltrados;
    
    // Si no hay esquemas cargados, intentar recargar desde el servidor
    if (esquemasFiltrados.length === 0) {
      this.cargarEsquemasTurno();
    }
  }
}