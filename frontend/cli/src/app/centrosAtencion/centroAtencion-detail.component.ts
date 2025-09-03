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
  // ==================== PROPIEDADES PRINCIPALES ====================
  centroAtencion!: CentroAtencion;
  form: any = { invalid: false, valid: true };
  activeTab: string = 'detalle';
  modoEdicion = false;

  // ==================== DATOS DE DOMINIO (SRP) ====================
  consultorios: Consultorio[] = [];
  staffMedicoCentro: StaffMedico[] = [];
  medicosDisponibles: Medico[] = [];
  especialidadesAsociadas: Especialidad[] = [];
  especialidadesDisponibles: Especialidad[] = [];
  esquemasSemana: EsquemaTurno[] = [];
  disponibilidadesMedico: DisponibilidadMedico[] = [];

  // ==================== ESTADO DE UI (SRP) ====================
  especialidadSeleccionada: Especialidad | null = null;
  especialidadesMedico: Especialidad[] = [];
  medicoSeleccionado: Medico | null = null;
  consultorioExpandido: { [consultorioId: number]: boolean } = {};
  esquemasConsultorio: { [consultorioId: number]: EsquemaTurno[] } = {};
  staffMedicoExpandido: { [staffMedicoId: number]: boolean } = {};
  disponibilidadesStaff: { [staffMedicoId: number]: DisponibilidadMedico[] } = {};

  // ==================== ESTADO DE CONSULTORIOS (SRP) ====================
  modoCrearConsultorio: boolean = false;
  editConsultorioIndex: number | null = null;
  nuevoConsultorio: { numero: number | null, nombre: string } = { numero: null, nombre: '' };

  // ==================== ESTADO DE MAPA (SRP) ====================
  coordenadas: string = '';
  showMap: boolean = false;
  private map!: L.Map;
  searchQuery: string = '';

  // ==================== GESTIÓN DE PORCENTAJES (SRP) ====================
  totalPorcentajeMedicos: number = 0;
  porcentajeDisponibleMedicos: number = 100;
  porcentajesOriginalesMedicos: { [staffMedicoId: number]: number } = {};
  semanaSeleccionada: string = '';

  // ==================== FILTROS DE ESQUEMAS (SRP) ====================
  filtroConsultorioSeleccionado: number | null = null;
  mostrarTodosLosConsultorios: boolean = true;

  // ==================== MENSAJES DE UI (SRP) ====================
  mensaje: string = '';
  tipoMensaje: string = '';
  mensajeConsultorio: string = '';
  tipoMensajeConsultorio: string = '';
  mensajeStaff: string = '';
  tipoMensajeStaff: string = '';

  // ==================== CONTROL DE CARGA (SRP) ====================
  private loadingState = {
    esquemas: { loading: false, loaded: false },
    especialidades: { loading: false, loaded: false },
    medicos: { loading: false, loaded: false },
    disponibilidades: { loading: false, loaded: false }
  };

  // Legacy properties for compatibility
  private get isLoadingEsquemas(): boolean { return this.loadingState.esquemas.loading; }
  private set isLoadingEsquemas(value: boolean) { this.loadingState.esquemas.loading = value; }
  private get esquemasLoaded(): boolean { return this.loadingState.esquemas.loaded; }
  private set esquemasLoaded(value: boolean) { this.loadingState.esquemas.loaded = value; }
  private get isLoadingEspecialidades(): boolean { return this.loadingState.especialidades.loading; }
  private set isLoadingEspecialidades(value: boolean) { this.loadingState.especialidades.loading = value; }
  private get especialidadesLoaded(): boolean { return this.loadingState.especialidades.loaded; }
  private set especialidadesLoaded(value: boolean) { this.loadingState.especialidades.loaded = value; }
  private get isLoadingMedicos(): boolean { return this.loadingState.medicos.loading; }
  private set isLoadingMedicos(value: boolean) { this.loadingState.medicos.loading = value; }
  private get medicosLoaded(): boolean { return this.loadingState.medicos.loaded; }
  private set medicosLoaded(value: boolean) { this.loadingState.medicos.loaded = value; }

  // ==================== HELPERS ESPECIALIZADOS (SRP) ====================
  private readonly dataLoader = this.createDataLoader();
  private readonly uiManager = this.createUIManager();
  private readonly validationHelper = this.createValidationHelper();
  private readonly messageHandler = this.createMessageHandler();
  private readonly percentageCalculator = this.createPercentageCalculator();
  private readonly dataProcessor = this.createDataProcessor();
  private readonly mapHandler = this.createMapHandler();
  private readonly consultorioManager = this.createConsultorioManager();
  private readonly staffManager = this.createStaffManager();
  private readonly esquemaManager = this.createEsquemaManager();

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

  // ==================== FACTORY METHODS PARA HELPERS (SRP) ====================
  
  private createDataLoader() {
    return {
      loadAllData: () => this.cargarTodosLosDatos(),
      loadConsultorios: () => this.getConsultorios(),
      loadEspecialidades: () => this.cargarEspecialidades(),
      loadEspecialidadesAsociadas: () => this.cargarEspecialidadesAsociadas(),
      loadStaffMedico: () => this.loadStaffMedico(),
      loadMedicosYEspecialidades: () => this.cargarMedicosYEspecialidades(),
      loadPorcentajesMedicos: () => this.cargarPorcentajesMedicos(),
      loadEsquemasParaSemana: () => this.cargarEsquemasParaSemana(),
      invalidateCache: {
        esquemas: () => this.invalidateEsquemasCache(),
        especialidades: () => this.invalidateEspecialidadesCache(),
        medicos: () => this.invalidateMedicosCache(),
        disponibilidades: () => this.invalidateDisponibilidadesCache()
      }
    };
  }

  private createMessageHandler() {
    return {
      alert: (title: string, message: string) => this.modalService.alert(title, message),
      confirm: (title: string, message: string, details?: string) => 
        details ? this.modalService.confirm(title, message, details) : this.modalService.confirm(title, message, ''),
      mostrarMensaje: (mensaje: string, tipo: string) => this.mostrarMensaje(mensaje, tipo),
      mostrarMensajeConsultorio: (mensaje: string, tipo: string) => this.mostrarMensajeConsultorio(mensaje, tipo),
      mostrarMensajeStaff: (mensaje: string, tipo: string) => this.mostrarMensajeStaff(mensaje, tipo)
    };
  }

  private createStaffManager() {
    return {
      expandir: (staffMedico: StaffMedico) => this.toggleStaffMedicoExpansion(staffMedico)
    };
  }

  private createUIManager() {
    return {
      toggleMap: () => this.toggleMap(),
      activarEdicion: () => this.activarEdicion(),
      cancelarEdicion: () => this.cancelarEdicion(),
      setActiveTab: (tab: string) => this.setActiveTab(tab)
    };
  }

  private createValidationHelper() {
    return {
      validarPorcentaje: (porcentaje: number) => this.validarPorcentaje(porcentaje),
      validarPorcentajesTotales: () => this.validarPorcentajesTotales(),
      validarConsultorio: (consultorio: Consultorio) => this.validarNumeroConsultorio(consultorio.numero),
      validateConsultorio: (numero: number, nombre: string) => ({
        numeroExists: !this.validarNumeroConsultorio(numero),
        nombreExists: this.consultorios.some(c => c.nombre === nombre)
      }),
      validatePorcentajeSum: (staffMedico: StaffMedico) => {
        const totalOtros = this.staffMedicoCentro
          .filter(s => s.id !== staffMedico.id)
          .reduce((sum, s) => sum + (s.porcentaje || 0), 0);
        return (totalOtros + (staffMedico.porcentaje || 0)) <= 100;
      }
    };
  }

  private createPercentageCalculator() {
    return {
      calcularPorcentajeTotal: () => this.calcularPorcentajeTotal(),
      calcularPorcentajeRestante: () => 100 - this.calcularPorcentajeTotal(),
      calcularTotales: () => this.calcularTotalesPorcentajeMedicos()
    };
  }

  private createDataProcessor() {
    return {
      procesarEspecialidades: () => this.cargarEspecialidadesAsociadas(),
      procesarStaff: () => this.loadStaffMedico(),
      procesarConsultorios: () => this.getConsultorios(),
      formatCoordinates: (lat: number, lng: number) => `${lat}, ${lng}`,
      processCoordinates: (coords: string) => {
        const parts = coords.split(',').map(p => parseFloat(p.trim()));
        return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? { latitud: parts[0], longitud: parts[1] } : null;
      }
    };
  }

  private createMapHandler() {
    return {
      initialize: () => this.initializeMap(),
      toggle: () => this.toggleMap()
    };
  }

  private createConsultorioManager() {
    return {
      crear: () => this.crearConsultorio(),
      validar: (numero: number) => this.validarNumeroConsultorio(numero)
    };
  }

  private createEsquemaManager() {
    return {
      cargar: () => this.cargarEsquemasTurno(),
      cargarParaConsultorio: (consultorio: Consultorio) => this.cargarEsquemasConsultorio(consultorio),
      cargarParaSemana: () => this.cargarEsquemasParaSemana()
    };
  }

  // ==================== CACHE INVALIDATION METHODS (SRP) ====================
  
  private invalidateEsquemasCache(): void {
    this.loadingState.esquemas.loaded = false;
    this.loadingState.esquemas.loading = false;
  }

  private invalidateEspecialidadesCache(): void {
    this.loadingState.especialidades.loaded = false;
    this.loadingState.especialidades.loading = false;
  }

  private invalidateMedicosCache(): void {
    this.loadingState.medicos.loaded = false;
    this.loadingState.medicos.loading = false;
  }

  private invalidateDisponibilidadesCache(): void {
    this.loadingState.disponibilidades.loaded = false;
    this.loadingState.disponibilidades.loading = false;
  }

  // ==================== LIFECYCLE METHODS (SRP) ====================
  
  ngAfterViewInit(): void {
    if (this.showMap) {
      this.mapHandler.initialize();
    }
  }

  ngOnInit(): void {
    this.get();
    this.dataLoader.loadEsquemasParaSemana();
    
    // Manejar activación de tab desde query params (para navegación de retorno)
    this.route.queryParams.subscribe(params => {
      const activeTabParam = params['activeTab'];
      if (activeTabParam && ['detalle', 'consultorios', 'especialidades', 'staff'].includes(activeTabParam)) {
        this.activeTab = activeTabParam;
      }
    });
  }

  // ==================== UI MANAGEMENT METHODS (SRP) ====================

  toggleMap(): void {
    this.showMap = !this.showMap;
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.get(); // Reload original data
  }

  goBack(): void {
    this.router.navigate(['/centrosAtencion']);
  }

  // ==================== CENTRO ATENCION CRUD METHODS (SRP) ====================

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'centrosAtencion/new') {
      this.initializeNewCentro();
    } else if (path === 'centrosAtencion/:id') {
      this.loadExistingCentro();
    } else {
      this.modoEdicion = false;
    }
  }

  private initializeNewCentro(): void {
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
  }

  private loadExistingCentro(): void {
    this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;
    
    const id = Number(idParam);
    if (isNaN(id)) return;
    
    this.centroAtencionService.get(id).subscribe({
      next: (dataPackage) => {
        this.centroAtencion = <CentroAtencion>dataPackage.data;
        this.centroAtencion.code = String(this.centroAtencion.id);
        this.processCoordinates();
        this.dataLoader.loadAllData();
      },
      error: (err) => {
        this.messageHandler.alert('Error', 'No se pudo cargar el centro de atención. Intente nuevamente.');
      }
    });
  }

  private processCoordinates(): void {
    if (
      this.centroAtencion.latitud !== undefined &&
      this.centroAtencion.longitud !== undefined &&
      this.centroAtencion.latitud !== 0 &&
      this.centroAtencion.longitud !== 0
    ) {
      this.coordenadas = this.dataProcessor.formatCoordinates(
        this.centroAtencion.latitud, 
        this.centroAtencion.longitud
      );
    } else {
      this.coordenadas = '';
    }
  }

  save(): void {
    try {
      if (this.coordenadas) {
        const coords = this.dataProcessor.processCoordinates(this.coordenadas);
        if (coords) {
          this.centroAtencion.latitud = coords.latitud;
          this.centroAtencion.longitud = coords.longitud;
        }
      }
      
      if (this.centroAtencion.id) {
        this.centroAtencion.code = String(this.centroAtencion.id);
      }
      
      this.centroAtencionService.save(this.centroAtencion).subscribe({
        next: (dataPackage) => {
          this.centroAtencion = <CentroAtencion>dataPackage.data;
          this.modoEdicion = false;
          this.dataLoader.loadConsultorios();
          this.messageHandler.alert('Éxito', 'Centro de atención guardado correctamente.');
        },
        error: (err) => {
          console.error('Error al guardar el centro de atención:', err);
          this.messageHandler.alert('Error', 'No se pudo guardar el centro de atención. Intente nuevamente.');
        }
      });
    } catch (error) {
      console.error('Error en save():', error);
      this.messageHandler.alert('Error', 'Ocurrió un error inesperado al guardar.');
    }
  }

  confirmDelete(centro: CentroAtencion): void {
    if (centro.id === undefined) {
      this.messageHandler.alert('Error', 'No se puede eliminar: el centro no tiene ID.');
      return;
    }
    
    this.messageHandler.confirm(
      "Eliminar centro de atención",
      "¿Está seguro que desea eliminar el centro de atención?",
      "Si elimina el centro no lo podrá utilizar luego"
    ).then(() => {
      this.remove(centro);
    }).catch(() => {
      // User cancelled
    });
  }

  remove(centro: CentroAtencion): void {
    if (centro.id === undefined) {
      this.messageHandler.alert('Error', 'No se puede eliminar: el centro no tiene ID.');
      return;
    }
    
    this.centroAtencionService.delete(centro.id!).subscribe({
      next: () => {
        this.messageHandler.alert('Éxito', 'Centro de atención eliminado correctamente.');
        this.goBack();
      },
      error: (err) => {
        console.error('Error al eliminar el centro de atención:', err);
        this.messageHandler.alert('Error', 'No se pudo eliminar el centro de atención. Intente nuevamente.');
      }
    });
  }

  // ==================== MAP METHODS (SRP) ====================
  
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

  onLocationSelected(coords: { latitud: number, longitud: number } | null): void {
    if (coords) {
      this.centroAtencion.latitud = coords.latitud;
      this.centroAtencion.longitud = coords.longitud;
      this.coordenadas = `${coords.latitud},${coords.longitud}`;
      alert(`Ubicación marcada: ${this.coordenadas}`);
    }
    this.showMap = false;
  }

  // ==================== VALIDATION METHODS (SRP) ====================

  allFieldsEmpty(): boolean {
    // Check if the minimum required fields are empty
    return !this.centroAtencion.nombre || !this.centroAtencion.direccion || 
           !this.centroAtencion.localidad || !this.centroAtencion.provincia;
  }

  medicoYaAsociado(): boolean {
    return !!this.staffMedicoCentro.find(staff =>
      staff.medicoId === this.medicoSeleccionado?.id
    );
  }

  // ==================== DATA LOADING METHODS (SRP) ====================
  
  getConsultorios(): void {
    if (this.centroAtencion?.id) {
      this.consultorioService.getByCentroAtencion(this.centroAtencion.id).subscribe({
        next: (data: any) => this.consultorios = data.data,
        error: () => this.consultorios = []
      });
    }
  }

  // Método para cargar especialidades disponibles
  cargarEspecialidades() {
    if (!this.centroAtencion?.id) return;

    // Evitar llamadas redundantes
    if (this.isLoadingEspecialidades) {
      console.log('Ya se están cargando las especialidades, evitando llamada duplicada');
      return;
    }

    // Si ya se cargaron y no han cambiado los datos, no recargar
    if (this.especialidadesLoaded) {
      console.log('Especialidades ya cargadas, usando datos en caché');
      return;
    }

    this.isLoadingEspecialidades = true;

    this.especialidadService.all().subscribe({
      next: (todasEspecialidades) => {
        const especialidadesAsociadasIds = this.especialidadesAsociadas.map(e => e.id);
        this.especialidadesDisponibles = todasEspecialidades.data.filter(
          (esp: Especialidad) => !especialidadesAsociadasIds.includes(esp.id)
        );
        this.especialidadesLoaded = true;
        this.isLoadingEspecialidades = false;
      },
      error: () => {
        this.especialidadesDisponibles = [];
        this.isLoadingEspecialidades = false;
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

  loadStaffMedico() {
    if (!this.centroAtencion?.id) return;
    this.staffMedicoService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dp) => {
        this.staffMedicoCentro = dp.data as StaffMedico[];
        // Cargar porcentajes después de cargar staff médico
        this.cargarPorcentajesMedicos();
        // Recalcular totales inmediatamente después de cargar los datos
        this.calcularTotalesPorcentajeMedicos();
      },
      error: (err) => {
        this.staffMedicoCentro = [];
        console.error('Error al cargar staff médico:', err);
      }
    });
  }

  cargarMedicosYEspecialidades() {
    // Evitar llamadas redundantes - solo cargar médicos aquí
    // Las especialidades se cargan en cargarEspecialidades() para evitar duplicados
    if (!this.isLoadingMedicos && !this.medicosLoaded) {
      this.isLoadingMedicos = true;
      this.medicoService.getAll().subscribe({
        next: dp => {
          this.medicosDisponibles = dp.data as Medico[];
          this.medicosLoaded = true;
          this.isLoadingMedicos = false;
        },
        error: (err) => {
          console.error('Error cargando médicos:', err);
          this.isLoadingMedicos = false;
        }
      });
    }
    // No cargar especialidades aquí para evitar duplicados - se cargan en cargarEspecialidades()
  }
  
  /**
   * Controla la expansión y colapso del panel de consultorios
   */
  // ==================== UI EXPANSION METHODS (SRP) ====================
  
  /**
   * Controla la expansión y colapso del panel de consultorios
   */
  toggleConsultorioExpansion(consultorio: Consultorio): void {
    if (!consultorio.id) return;
    
    // Invierte el estado de expansión del consultorio
    this.consultorioExpandido[consultorio.id] = !this.consultorioExpandido[consultorio.id];
    
    // Si se está expandiendo, recargar esquemas específicos para este consultorio
    if (this.consultorioExpandido[consultorio.id]) {
      this.cargarEsquemasConsultorio(consultorio);
    }
  }

  /**
   * Controla la expansión y colapso del panel de staff médico
   */
  toggleStaffMedicoExpansion(staffMedico: StaffMedico): void {
    if (!staffMedico.id) return;
    
    // Invierte el estado de expansión del staff médico
    this.staffMedicoExpandido[staffMedico.id] = !this.staffMedicoExpandido[staffMedico.id];
    
    // Si se está expandiendo, cargar disponibilidades específicas para este staff médico
    if (this.staffMedicoExpandido[staffMedico.id]) {
      this.cargarDisponibilidadesStaff(staffMedico);
    }
  }

  cargarDisponibilidadesStaff(staffMedico: StaffMedico): void {
    if (!staffMedico.id) return;
    
    // Cargar disponibilidades específicas para este staff médico
    this.disponibilidadMedicoService.byStaffMedico(staffMedico.id).subscribe({
      next: (response: any) => {
        if (!this.disponibilidadesStaff[staffMedico.id]) {
          this.disponibilidadesStaff[staffMedico.id] = [];
        }
        this.disponibilidadesStaff[staffMedico.id] = response.data as DisponibilidadMedico[] || [];
      },
      error: (error: any) => {
        console.error('Error cargando disponibilidades para staff médico:', error);
        this.disponibilidadesStaff[staffMedico.id] = [];
      }
    });
  }

  // ==================== ESPECIALIDAD MANAGEMENT METHODS (SRP) ====================

  asociarEspecialidad() {
    if (!this.especialidadSeleccionada || !this.centroAtencion?.id) return;
    this.especialidadService.asociar(this.centroAtencion.id!, this.especialidadSeleccionada.id!)
      .subscribe({
        next: () => {
          this.messageHandler.mostrarMensaje('Especialidad asociada correctamente.', 'success');
          // Invalidate cache and reload
          this.dataLoader.invalidateCache.especialidades();
          this.cargarEspecialidades();
          this.cargarEspecialidadesAsociadas(); // <--- refresca la lista
          this.especialidadSeleccionada = null;
        },
        error: err => {
          this.messageHandler.mostrarMensaje('No se pudo asociar la especialidad.', 'danger');
        }
      });
  }

  desasociarEspecialidad(esp: Especialidad) {
    if (!this.centroAtencion?.id || !esp.id) return;
    this.especialidadService.desasociar(this.centroAtencion.id!, esp.id!)
      .subscribe({
        next: () => {
          this.mensaje = 'Especialidad desasociada correctamente';
          // Invalidate cache and reload
          this.dataLoader.invalidateCache.especialidades();
          this.cargarEspecialidades();
          this.cargarEspecialidadesAsociadas(); // <--- refresca la lista
        },
        error: err => {
          this.mensaje = err.error?.status_text || 'No se pudo desasociar la especialidad';
        }
      });
  }

  // ==================== CONSULTORIO MANAGEMENT METHODS (SRP) ====================

  crearConsultorio() {
    if (!this.nuevoConsultorio.numero || !this.nuevoConsultorio.nombre) return;

    // Usar el helper de validación
    const validation = this.validationHelper.validateConsultorio(
      this.nuevoConsultorio.numero, 
      this.nuevoConsultorio.nombre
    );

    if (validation.numeroExists) {
      this.messageHandler.mostrarMensajeConsultorio('Ya existe un consultorio con ese número en este centro.', 'danger');
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
        this.messageHandler.mostrarMensajeConsultorio('Consultorio creado correctamente', 'success');
        this.getConsultorios(); // Recargar la lista de consultorios
        this.nuevoConsultorio = { numero: null, nombre: '' }; // Limpiar el formulario
        this.modoCrearConsultorio = false; // Salir del modo de creación
      },
      error: (err: any) => {
        const mensaje = err.error?.status_text || 'No se pudo crear el consultorio';
        this.messageHandler.mostrarMensajeConsultorio(mensaje, 'danger');
      }
    });
  }

  editarConsultorio(i: number) {
    this.editConsultorioIndex = i;
  }

  guardarEdicionConsultorio(i: number) {
    const c = this.consultorios[i];
    const validation = this.validationHelper.validateConsultorio(c.numero!, c.nombre);
    
    if (this.consultorios.some((x, idx) => x.numero === c.numero && idx !== i)) {
      this.messageHandler.mostrarMensajeConsultorio('Ya existe un consultorio con ese número.', 'danger');
      return;
    }
    
    if (!c.id) {
      this.messageHandler.mostrarMensajeConsultorio('No se puede actualizar un consultorio sin ID.', 'danger');
      return;
    }
    
    this.consultorioService.update(c.id, {
      ...c,
      centroAtencion: { id: this.centroAtencion.id } as CentroAtencion
    }).subscribe({
      next: () => {
        this.messageHandler.mostrarMensajeConsultorio('Consultorio actualizado correctamente', 'success');
        this.getConsultorios();
        this.editConsultorioIndex = null;
      },
      error: (err: any) => {
        const mensaje = err.error?.status_text || 'No se pudo actualizar el consultorio';
        this.messageHandler.mostrarMensajeConsultorio(mensaje, 'danger');
      }
    });
  }

  cancelarEdicionConsultorio() {
    this.editConsultorioIndex = null;
    this.getConsultorios();
  }

  eliminarConsultorio(consultorio: Consultorio): void {
    if (!consultorio.id) {
      this.messageHandler.alert('Error', 'No se puede eliminar un consultorio sin ID.');
      return;
    }

    this.messageHandler.confirm(
      'Eliminar Consultorio',
      `¿Está seguro que desea eliminar el consultorio "${consultorio.nombre}"?`
    ).then(() => {
      this.consultorioService.delete(consultorio.id!).subscribe({
        next: () => {
          this.messageHandler.mostrarMensajeConsultorio('Consultorio eliminado correctamente.', 'success');
          this.getConsultorios(); // Recargar la lista de consultorios
        },
        error: (err) => {
          const mensajeError = err?.error?.status_text || 'No se pudo eliminar el consultorio.';
          this.messageHandler.mostrarMensajeConsultorio(mensajeError, 'danger');
        }
      });
    }).catch(() => {
      // User cancelled
    });
  }

  // ==================== DATA PROCESSING METHODS (SRP) ====================

  // Helper methods for esquemas display
  getMedicoInitials(esquema: any): string {
    // Usar el nombre que viene directamente en la respuesta del esquema
    if (esquema.nombreStaffMedico) {
      const nombres = esquema.nombreStaffMedico.split(' ');
      if (nombres.length >= 2) {
        return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
      } else if (nombres.length === 1) {
        return nombres[0].charAt(0).toUpperCase();
      }
    }
    
    // Fallback: intentar obtener del staffMedico relacionado
    const staffMedico = this.staffMedicoCentro.find(s => s.id === esquema.staffMedicoId);
    if (staffMedico?.medico) {
      const nombre = staffMedico.medico.nombre || '';
      const apellido = staffMedico.medico.apellido || '';
      return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    }
    
    return 'NN';
  }

  getMedicoNombre(esquema: any): string {
    // Usar el nombre que viene directamente en la respuesta del esquema
    if (esquema.nombreStaffMedico) {
      return esquema.nombreStaffMedico;
    }
    
    // Fallback: intentar obtener del staffMedico relacionado
    const staffMedico = this.staffMedicoCentro.find(s => s.id === esquema.staffMedicoId);
    if (staffMedico?.medico) {
      const nombre = staffMedico.medico.nombre || '';
      const apellido = staffMedico.medico.apellido || '';
      return `${apellido}, ${nombre}`.trim();
    }
    
    return 'Sin asignar';
  }

  getEspecialidadNombre(esquema: any): string {
    // Intentar obtener la especialidad del staffMedico relacionado
    const staffMedico = this.staffMedicoCentro.find(s => s.id === esquema.staffMedicoId);
    if (staffMedico?.especialidad?.nombre) {
      return staffMedico.especialidad.nombre;
    }
    
    // Fallback: intentar del médico
    if (staffMedico?.medico?.especialidad?.nombre) {
      return staffMedico.medico.especialidad.nombre;
    }
    
    return 'Sin especialidad';
  }

  getConsultorioNombre(esquema: EsquemaTurno): string {
    const consultorio = this.consultorios.find(c => c.id === esquema.consultorioId);
    return consultorio?.nombre || 'Sin consultorio';
  }

  getConsultorioNumero(esquema: EsquemaTurno): number | null {
    const consultorio = this.consultorios.find(c => c.id === esquema.consultorioId);
    return consultorio?.numero || null;
  }

  getDisponibilidadFromEsquema(esquema: any): DisponibilidadMedico | null {
    return this.disponibilidadesMedico.find(d => d.id === esquema.disponibilidadMedicoId) || null;
  }

  getEstadoBadgeClass(esquema: any): string {
    const estado = esquema.estado?.toLowerCase() || 'activo'; // Default to 'activo' if no estado
    switch (estado) {
      case 'activo':
        return 'badge bg-success';
      case 'inactivo':
        return 'badge bg-secondary';
      case 'suspendido':
        return 'badge bg-warning';
      case 'cancelado':
        return 'badge bg-danger';
      default:
        return 'badge bg-success'; // Default to active
    }
  }

  getEstadoIcon(esquema: any): string {
    const estado = esquema.estado?.toLowerCase() || 'activo'; // Default to 'activo' if no estado
    switch (estado) {
      case 'activo':
        return 'fa-check-circle';
      case 'inactivo':
        return 'fa-pause-circle';
      case 'suspendido':
        return 'fa-exclamation-triangle';
      case 'cancelado':
        return 'fa-times-circle';
      default:
        return 'fa-check-circle'; // Default to active
    }
  }

  getEstadoTexto(esquema: any): string {
    return esquema.estado || 'Activo'; // Default to 'Activo' if no estado
  }

  getEsquemasPorDia(dia: string): EsquemaTurno[] {
    // Filtrar esquemas que tienen horarios para el día específico
    let esquemasFiltrados = this.esquemasSemana.filter(esquema => {
      // Verificar si el esquema tiene horarios para el día solicitado
      if (esquema.horarios && Array.isArray(esquema.horarios)) {
        const tieneHorario = esquema.horarios.some(horario => 
          horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
        );
        if (tieneHorario) {
          return true;
        }
      }
      
      // Si no tiene horarios directos, verificar en la disponibilidad médica
      if (esquema.disponibilidadMedico?.horarios && Array.isArray(esquema.disponibilidadMedico.horarios)) {
        const tieneHorario = esquema.disponibilidadMedico.horarios.some(horario => 
          horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
        );
        if (tieneHorario) {
          return true;
        }
      }
      
      // Si no encuentra horarios específicos, buscar en las disponibilidades cargadas
      const disponibilidad = this.disponibilidadesMedico.find(d => d.id === esquema.disponibilidadMedicoId);
      if (disponibilidad?.horarios && Array.isArray(disponibilidad.horarios)) {
        const tieneHorario = disponibilidad.horarios.some(horario => 
          horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
        );
        if (tieneHorario) {
          return true;
        }
      }
      
      return false;
    });

    // Aplicar filtro por consultorio si está seleccionado
    if (!this.mostrarTodosLosConsultorios && this.filtroConsultorioSeleccionado) {
      esquemasFiltrados = esquemasFiltrados.filter(esquema => 
        esquema.consultorioId === this.filtroConsultorioSeleccionado
      );
    }
    
    return esquemasFiltrados;
  }

  getHorariosPorDia(esquema: EsquemaTurno, dia: string): any[] {
    // Primero intentar obtener horarios del esquema
    if (esquema.horarios && Array.isArray(esquema.horarios)) {
      const horariosEsquema = esquema.horarios.filter(horario => 
        horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
      );
      if (horariosEsquema.length > 0) {
        return horariosEsquema;
      }
    }
    
    // Si no tiene horarios directos, obtener de la disponibilidad médica
    if (esquema.disponibilidadMedico?.horarios && Array.isArray(esquema.disponibilidadMedico.horarios)) {
      const horariosDisponibilidad = esquema.disponibilidadMedico.horarios.filter(horario => 
        horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
      );
      if (horariosDisponibilidad.length > 0) {
        return horariosDisponibilidad;
      }
    }
    
    // Si no encuentra horarios específicos, buscar en las disponibilidades cargadas
    const disponibilidad = this.disponibilidadesMedico.find(d => d.id === esquema.disponibilidadMedicoId);
    if (disponibilidad?.horarios && Array.isArray(disponibilidad.horarios)) {
      return disponibilidad.horarios.filter(horario => 
        horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
      );
    }
    
    return [];
  }

  /**
   * Carga todos los datos necesarios en paralelo para optimizar performance
   */
  cargarTodosLosDatos() { 
    if (!this.centroAtencion?.id) return;
    
    console.log('Cargando todos los datos en paralelo...');
    
    // Usar Promise.all para cargar todos los datos en paralelo
    Promise.all([
      // Consultorios
      this.consultorioService.getByCentroAtencion(this.centroAtencion.id).toPromise(),
      // Especialidades disponibles (todas)
      this.especialidadService.all().toPromise(),
      // Especialidades asociadas al centro
      this.especialidadService.getByCentroAtencion(this.centroAtencion.id).toPromise(),
      // Staff médico del centro
      this.staffMedicoService.getByCentroAtencion(this.centroAtencion.id).toPromise(),
      // Médicos disponibles
      this.medicoService.getAll().toPromise(),
      // Esquemas de turno del centro
      this.esquemaTurnoService.getByCentroAtencion(this.centroAtencion.id).toPromise(),
      // Disponibilidades médicas
      this.disponibilidadMedicoService.all().toPromise()
    ]).then(([
      consultoriosResponse,
      especialidadesResponse,
      especialidadesAsociadasResponse,
      staffMedicoResponse,
      medicosResponse,
      esquemasResponse,
      disponibilidadesResponse
    ]) => {
      // Procesar consultorios
      this.consultorios = consultoriosResponse?.data || [];
      console.log('Consultorios cargados:', this.consultorios.length, this.consultorios);
      
      // Procesar especialidades
      this.especialidadesAsociadas = Array.isArray(especialidadesAsociadasResponse?.data) 
        ? especialidadesAsociadasResponse.data : [];
      
      const especialidadesAsociadasIds = this.especialidadesAsociadas.map(e => e.id);
      this.especialidadesDisponibles = especialidadesResponse?.data?.filter(
        (esp: Especialidad) => !especialidadesAsociadasIds.includes(esp.id)
      ) || [];
      
      // Procesar staff médico
      this.staffMedicoCentro = staffMedicoResponse?.data as StaffMedico[] || [];
      
      // Recalcular porcentajes después de cargar staff médico
      this.calcularTotalesPorcentajeMedicos();
      
      // Procesar médicos
      this.medicosDisponibles = medicosResponse?.data as Medico[] || [];
      
      // Procesar esquemas de turno
      const esquemas = esquemasResponse?.data as EsquemaTurno[] || [];
      console.log('Esquemas de turno cargados:', esquemas.length, esquemas);
      
      // Asignar todos los esquemas al tab de esquemas de turno
      this.esquemasSemana = esquemas;
      
      // Agrupar esquemas por consultorio para el tab de consultorios
      this.esquemasConsultorio = {};
      esquemas.forEach(esquema => {
        if (esquema.consultorioId) {
          if (!this.esquemasConsultorio[esquema.consultorioId]) {
            this.esquemasConsultorio[esquema.consultorioId] = [];
          }
          this.esquemasConsultorio[esquema.consultorioId].push(esquema);
        }
      });
      
      // Procesar disponibilidades médicas
      const todasDisponibilidades = disponibilidadesResponse?.data as DisponibilidadMedico[] || [];
      console.log('Todas las disponibilidades cargadas:', todasDisponibilidades.length, todasDisponibilidades);
      console.log('Staff médico del centro:', this.staffMedicoCentro);
      
      // Obtener IDs del staff médico del centro
      const staffMedicoIds = this.staffMedicoCentro.map(staff => staff.id);
      console.log('IDs de staff médico del centro:', staffMedicoIds);
      
      // Filtrar disponibilidades por staffMedicoId
      this.disponibilidadesMedico = todasDisponibilidades.filter(disp => {
        const pertenece = staffMedicoIds.includes(disp.staffMedicoId);
        console.log(`Disponibilidad ${disp.id} - staffMedicoId: ${disp.staffMedicoId}, pertenece al centro: ${pertenece}`);
        return pertenece;
      });
      
      console.log('Disponibilidades filtradas para el centro:', this.disponibilidadesMedico.length, this.disponibilidadesMedico);
      
      // Marcar todos los datos como cargados
      this.esquemasLoaded = true;
      this.especialidadesLoaded = true;
      this.medicosLoaded = true;
      
    }).catch(error => {
      console.error('Error cargando todos los datos:', error);
    });
  }

  cargarEsquemasParaSemana(): void {
    // Cargar esquemas para la vista semanal
    this.cargarEsquemasTurno();
  }

  cargarPorcentajesMedicos(): void {
    // Asegurar que los porcentajes estén inicializados correctamente
    if (this.staffMedicoCentro && this.staffMedicoCentro.length > 0) {
      // Si algún staff médico no tiene porcentaje, inicializar a 0
      this.staffMedicoCentro.forEach(staff => {
        if (staff.porcentaje === null || staff.porcentaje === undefined) {
          staff.porcentaje = 0;
        }
      });
      // Recalcular totales
      this.percentageCalculator.calcularTotales();
    }
  }

  // ==================== MÉTODOS PARA GESTIÓN DE PORCENTAJES POR MÉDICO ====================

  /**
   * Se ejecuta cuando cambia algún porcentaje de médico para recalcular totales
   */
  onPorcentajeMedicoChange(): void {
    this.calcularTotalesPorcentajeMedicos();
  }

  /**
   * Calcula el total de porcentajes asignados a médicos y disponible
   */
  private calcularTotalesPorcentajeMedicos(): void {
    // Verificar que hay datos para procesar
    if (!this.staffMedicoCentro || this.staffMedicoCentro.length === 0) {
      this.totalPorcentajeMedicos = 0;
      this.porcentajeDisponibleMedicos = 100;
      return;
    }

    // Usar reduce con precisión mejorada
    const total = this.staffMedicoCentro
      .filter(staff => staff.porcentaje != null && staff.porcentaje >= 0)
      .reduce((total, staff) => total + (staff.porcentaje || 0), 0);
    
    // Redondear a 2 decimales para evitar problemas de precisión flotante
    this.totalPorcentajeMedicos = Math.round(total * 100) / 100;
    this.porcentajeDisponibleMedicos = Math.round((100 - this.totalPorcentajeMedicos) * 100) / 100;
    
    console.log('Porcentajes calculados:', {
      staffMedico: this.staffMedicoCentro.map(s => ({ 
        nombre: s.medico?.nombre || 'N/A', 
        porcentaje: s.porcentaje 
      })),
      totalPorcentajeMedicos: this.totalPorcentajeMedicos,
      porcentajeDisponible: this.porcentajeDisponibleMedicos
    });
  }

  /**
   * Guarda el porcentaje de un médico específico
   */
  guardarPorcentajeMedico(staffMedico: StaffMedico): void {
    if (!this.centroAtencion?.id || !staffMedico.id) return;
    
    if (staffMedico.porcentaje != null && (staffMedico.porcentaje < 0 || staffMedico.porcentaje > 100)) {
      this.messageHandler.mostrarMensajeStaff('El porcentaje debe estar entre 0 y 100', 'danger');
      return;
    }
    
    // Validar que no exceda el 100%
    if (!this.validationHelper.validatePorcentajeSum(staffMedico)) {
      this.messageHandler.mostrarMensajeStaff('El total de porcentajes no puede exceder 100%', 'danger');
      return;
    }
    
    const medicosParaActualizar = [staffMedico];
    
    this.staffMedicoService.actualizarPorcentajes(this.centroAtencion.id, medicosParaActualizar).subscribe({
      next: (response) => {
        this.messageHandler.mostrarMensajeStaff('Porcentaje guardado correctamente', 'success');
        this.percentageCalculator.calcularTotales();
      },
      error: (err) => {
        this.messageHandler.mostrarMensajeStaff('Error al guardar el porcentaje', 'danger');
      }
    });
  }

  /**
   * Guarda todos los porcentajes de los médicos
   */
  guardarTodosPorcentajesMedicos(): void {
    if (!this.centroAtencion?.id) return;
    
    this.staffMedicoService.actualizarPorcentajes(this.centroAtencion.id, this.staffMedicoCentro).subscribe({
      next: (response) => {
        this.messageHandler.mostrarMensajeStaff('Todos los porcentajes guardados correctamente', 'success');
        this.percentageCalculator.calcularTotales();
      },
      error: (err) => {
        this.messageHandler.mostrarMensajeStaff('Error al guardar los porcentajes', 'danger');
      }
    });
  }

  /**
   * Redistribuye los porcentajes equitativamente entre todos los médicos del centro
   */
  redistribuirPorcentajesMedicos(): void {
    if (this.staffMedicoCentro.length === 0) return;
    
    // Calcular porcentaje exacto con 2 decimales de precisión
    const porcentajeEquitativo = Math.round((100 / this.staffMedicoCentro.length) * 100) / 100;
    
    // Asignar el mismo porcentaje a todos los médicos
    this.staffMedicoCentro.forEach((staff) => {
      staff.porcentaje = porcentajeEquitativo;
    });
    
    this.percentageCalculator.calcularTotales();
  }

  redistribuirEsquemasExistentes(): void {
    if (!this.centroAtencion?.id) {
      this.mostrarMensaje('Error: No se ha seleccionado un centro de atención válido', 'danger');
      return;
    }

    // Validar que haya esquemas para redistribuir
    if (!this.esquemasSemana || this.esquemasSemana.length === 0) {
      this.mostrarMensaje('No hay esquemas de turno para redistribuir en este centro', 'warning');
      return;
    }

    // Validar que los porcentajes estén correctamente asignados
    if (this.totalPorcentajeMedicos !== 100) {
      this.mostrarMensaje('Los porcentajes deben sumar exactamente 100% antes de redistribuir esquemas', 'warning');
      return;
    }

    // Mostrar confirmación antes de proceder
    this.modalService.confirm(
      'Redistribuir Esquemas de Turno',
      '¿Está seguro que desea redistribuir los consultorios de los esquemas existentes?',
      'Esta acción reasignará automáticamente los consultorios según los porcentajes configurados por médico. Los esquemas mantienen sus horarios pero pueden cambiar de consultorio.'
    ).then(() => {
      // Validación adicional antes de llamar al servicio
      if (!this.centroAtencion?.id) {
        this.mostrarMensaje('Error: ID del centro de atención no válido', 'danger');
        return;
      }

      // Llamar al servicio de redistribución
      this.esquemaTurnoService.redistribuirConsultorios(this.centroAtencion.id).subscribe({
        next: (response) => {
          const esquemasProcesados = response.data || 0;
          this.mostrarMensaje(
            `Redistribución completada exitosamente. ${esquemasProcesados} esquemas procesados.`, 
            'success'
          );
          
          // Recargar los esquemas para mostrar los cambios
          this.cargarEsquemasTurno();
        },
        error: (error) => {
          const mensaje = this.extraerMensajeError(error);
          this.mostrarMensaje(`Error al redistribuir esquemas: ${mensaje}`, 'danger');
          console.error('Error en redistribución:', error);
        }
      });
    }).catch(() => {
      // Usuario canceló la operación
      console.log('Redistribución cancelada por el usuario');
    });
  }

  // ==================== MÉTODOS DE UI MANAGEMENT (SRP) ====================
  
  cancelarEdicion(): void {
    this.modoEdicion = false;
    // Recargar datos originales si es necesario
    this.get();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // ==================== MÉTODOS DE MENSAJERÍA (SRP) ====================
  
  mostrarMensaje(mensaje: string, tipo: string): void {
    // Implementar lógica de mostrado de mensajes
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
  }

  mostrarMensajeConsultorio(mensaje: string, tipo: string): void {
    this.mensajeConsultorio = mensaje;
    this.tipoMensajeConsultorio = tipo;
    setTimeout(() => {
      this.mensajeConsultorio = '';
      this.tipoMensajeConsultorio = '';
    }, 5000);
  }

  mostrarMensajeStaff(mensaje: string, tipo: string): void {
    this.mensajeStaff = mensaje;
    this.tipoMensajeStaff = tipo;
    setTimeout(() => {
      this.mensajeStaff = '';
      this.tipoMensajeStaff = '';
    }, 5000);
  }

  // ==================== MÉTODOS DE VALIDACIÓN (SRP) ====================
  
  validarPorcentaje(porcentaje: number): boolean {
    return porcentaje >= 0 && porcentaje <= 100;
  }

  validarPorcentajesTotales(): boolean {
    const total = this.calcularPorcentajeTotal();
    return total <= 100;
  }

  validarNumeroConsultorio(numero: number): boolean {
    return this.consultorios.every(c => c.numero !== numero);
  }

  // ==================== MÉTODOS DE CÁLCULO (SRP) ====================
  
  calcularPorcentajeTotal(): number {
    return this.staffMedicoCentro
      .filter(staff => staff.porcentaje != null && staff.porcentaje >= 0)
      .reduce((total, staff) => total + (staff.porcentaje || 0), 0);
  }

  // ==================== MÉTODOS DE GESTIÓN DE ESQUEMAS (SRP) ====================
  
  cargarEsquemasTurno(): void {
    if (!this.centroAtencion?.id || this.isLoadingEsquemas) return;
    
    this.isLoadingEsquemas = true;
    this.esquemaTurnoService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (response) => {
        this.esquemasSemana = response.data as EsquemaTurno[] || [];
        this.esquemasLoaded = true;
        this.isLoadingEsquemas = false;
      },
      error: (error) => {
        console.error('Error cargando esquemas:', error);
        this.isLoadingEsquemas = false;
      }
    });
  }

  cargarEsquemasConsultorio(consultorio: Consultorio): void {
    if (!consultorio.id || !this.esquemasLoaded) return;
    
    const esquemas = this.esquemasSemana.filter(e => e.consultorioId === consultorio.id);
    if (!this.esquemasConsultorio[consultorio.id]) {
      this.esquemasConsultorio[consultorio.id] = [];
    }
    this.esquemasConsultorio[consultorio.id] = esquemas;
  }

  // ==================== MÉTODOS PARA ESQUEMAS POR CONSULTORIO ====================

  /**
   * Obtiene los esquemas de un consultorio específico
   */
  getEsquemasDelConsultorio(consultorioId: number): EsquemaTurno[] {
    return this.esquemasSemana.filter(esquema => esquema.consultorioId === consultorioId);
  }

  /**
   * Obtiene los esquemas de un consultorio para un día específico
   */
  getEsquemasDelConsultorioPorDia(consultorioId: number, dia: string): EsquemaTurno[] {
    const esquemasConsultorio = this.getEsquemasDelConsultorio(consultorioId);
    
    return esquemasConsultorio.filter(esquema => {
      // Verificar si el esquema tiene horarios para el día solicitado
      if (esquema.horarios && Array.isArray(esquema.horarios)) {
        const tieneHorario = esquema.horarios.some(horario => 
          horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
        );
        if (tieneHorario) {
          return true;
        }
      }
      
      // Si no tiene horarios directos, verificar en la disponibilidad médica
      if (esquema.disponibilidadMedico?.horarios && Array.isArray(esquema.disponibilidadMedico.horarios)) {
        const tieneHorario = esquema.disponibilidadMedico.horarios.some(horario => 
          horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
        );
        if (tieneHorario) {
          return true;
        }
      }
      
      // Si no encuentra horarios específicos, buscar en las disponibilidades cargadas
      const disponibilidad = this.disponibilidadesMedico.find(d => d.id === esquema.disponibilidadMedicoId);
      if (disponibilidad?.horarios && Array.isArray(disponibilidad.horarios)) {
        const tieneHorario = disponibilidad.horarios.some(horario => 
          horario.dia && horario.dia.toUpperCase() === dia.toUpperCase()
        );
        if (tieneHorario) {
          return true;
        }
      }
      
      return false;
    });
  }

  /**
   * Obtiene un color específico para cada día de la semana
   */
  getColorPorDia(dia: string): string {
    const colores: { [key: string]: string } = {
      'LUNES': 'rgba(54, 185, 204, 0.1)',
      'MARTES': 'rgba(40, 167, 69, 0.1)',
      'MIERCOLES': 'rgba(255, 193, 7, 0.1)',
      'JUEVES': 'rgba(220, 53, 69, 0.1)',
      'VIERNES': 'rgba(111, 66, 193, 0.1)',
      'SABADO': 'rgba(253, 126, 20, 0.1)',
      'DOMINGO': 'rgba(108, 117, 125, 0.1)'
    };
    return colores[dia.toUpperCase()] || 'rgba(108, 117, 125, 0.1)';
  }

  /**
   * Obtiene el color del borde para cada día de la semana
   */
  getColorBorde(dia: string): string {
    const colores: { [key: string]: string } = {
      'LUNES': '#36b9cc',
      'MARTES': '#28a745',
      'MIERCOLES': '#ffc107',
      'JUEVES': '#dc3545',
      'VIERNES': '#6f42c1',
      'SABADO': '#fd7e14',
      'DOMINGO': '#6c757d'
    };
    return colores[dia.toUpperCase()] || '#6c757d';
  }

  /**
   * Verifica si un consultorio tiene un horario específico para un día
   */
  getHorarioEspecifico(consultorio: Consultorio, dia: string): any {
    if (!consultorio.horariosSemanales || consultorio.horariosSemanales.length === 0) {
      return null;
    }
    return consultorio.horariosSemanales.find(h => h.diaSemana.toUpperCase() === dia.toUpperCase());
  }

  /**
   * Obtiene el nombre corto del médico para mostrar en las tarjetas mini
   */
  getMedicoNombreCorto(esquema: EsquemaTurno): string {
    if (esquema.staffMedico?.medico) {
      const nombre = esquema.staffMedico.medico.nombre || '';
      const apellido = esquema.staffMedico.medico.apellido || '';
      return `${nombre.substring(0,1)}. ${apellido.split(' ')[0]}`;
    }
    return 'Dr. N/A';
  }

  /**
   * Crea un nuevo esquema de turno para un consultorio específico
   */
  crearNuevoEsquema(consultorio: Consultorio): void {
    // Navegar al formulario de creación con el consultorio preseleccionado
    this.router.navigate(['/esquema-turno/new'], {
      queryParams: {
        consultorioId: consultorio.id,
        centroId: this.centroAtencion.id,
        fromCentro: this.centroAtencion.id,
        returnTab: 'consultorios'
      }
    });
  }

  /**
   * Edita un esquema existente
   */
  editarEsquema(esquema: EsquemaTurno): void {
    this.router.navigate(['/esquema-turno', esquema.id], {
      queryParams: {
        fromCentro: this.centroAtencion.id,
        returnTab: 'consultorios'
      }
    });
  }

  /**
   * Resetea el filtro para mostrar todos los consultorios
   */
  mostrarTodosLosEsquemas(): void {
    this.mostrarTodosLosConsultorios = true;
    this.filtroConsultorioSeleccionado = null;
  }

  /**
   * Aplica un filtro específico por consultorio
   */
  filtrarPorConsultorio(consultorioId: number): void {
    this.mostrarTodosLosConsultorios = false;
    this.filtroConsultorioSeleccionado = consultorioId;
  }

  /**
   * Obtiene el nombre del consultorio para mostrar en el filtro
   */
  getNombreConsultorioParaFiltro(consultorioId: number): string {
    const consultorio = this.consultorios.find(c => c.id === consultorioId);
    return consultorio ? `${consultorio.numero} - ${consultorio.nombre}` : `Consultorio ${consultorioId}`;
  }

  /**
   * Obtiene la lista de consultorios que tienen esquemas para el filtro
   */
  getConsultoriosConEsquemas(): Consultorio[] {
    const consultoriosConEsquemas = new Set<number>();
    
    // Obtener todos los consultorios que tienen esquemas
    this.esquemasSemana.forEach(esquema => {
      if (esquema.consultorioId) {
        consultoriosConEsquemas.add(esquema.consultorioId);
      }
    });

    // Filtrar solo los consultorios que tienen esquemas
    return this.consultorios.filter(consultorio => 
      consultorio.id && consultoriosConEsquemas.has(consultorio.id)
    );
  }

  /**
   * Cuenta el total de esquemas visibles con el filtro actual
   */
  contarEsquemasVisibles(): number {
    if (this.mostrarTodosLosConsultorios) {
      return this.esquemasSemana.length;
    }
    
    if (this.filtroConsultorioSeleccionado) {
      return this.esquemasSemana.filter(esquema => 
        esquema.consultorioId === this.filtroConsultorioSeleccionado
      ).length;
    }
    
    return 0;
  }

  /**
   * Verifica si hay esquemas visibles para mostrar la tabla
   */
  hayEsquemasVisibles(): boolean {
    return this.contarEsquemasVisibles() > 0;
  }

  // ==================== MÉTODOS AUXILIARES (SRP) ====================
  
  private extraerMensajeError(error: any): string {
    return error?.error?.message || error?.message || 'Error desconocido';
  }

  // ==================== MÉTODOS FALTANTES PARA TEMPLATE (SRP) ====================
  
  crearNuevoConsultorio(): void {
    // Delegate to the existing crearConsultorio method
    this.crearConsultorio();
  }

  editarHorariosConsultorio(consultorio: Consultorio): void {
    // Navigate to consultorio detail page for schedule editing
    // Pass context parameters so the consultorio knows to return to centro detail
    if (consultorio.id) {
      this.router.navigate(['/consultorios', consultorio.id], {
        queryParams: {
          fromCentro: this.centroAtencion.id,
          returnTab: 'consultorios'
        }
      });
    }
  }

  verDetalleEsquema(esquema: EsquemaTurno): void {
    // Navigate to esquema detail with return navigation parameters
    this.router.navigate(['/esquema-turno', esquema.id], {
      queryParams: {
        fromCentro: this.centroAtencion.id,
        returnTab: 'consultorios'
      }
    });
  }

  onMedicoSeleccionado(medico?: Medico, event?: any): void {
    if (event && event.target.checked) {
      this.medicoSeleccionado = medico || null;
    } else {
      this.medicoSeleccionado = null;
    }
  }

  asociarMedico(): void {
    if (!this.medicoSeleccionado || !this.centroAtencion?.id) return;

    // Create a new StaffMedico object
    const nuevoStaff: Partial<StaffMedico> = {
      medico: this.medicoSeleccionado,
      centroAtencionId: this.centroAtencion.id,
      medicoId: this.medicoSeleccionado.id,
      porcentaje: 0
    };

    this.staffMedicoService.create(nuevoStaff as StaffMedico).subscribe({
      next: (response: any) => {
        this.loadStaffMedico();
        this.medicoSeleccionado = null;
        this.mostrarMensajeStaff('Médico asociado correctamente', 'success');
      },
      error: (error: any) => {
        this.mostrarMensajeStaff('Error al asociar médico', 'danger');
      }
    });
  }

  agregarDisponibilidad(staff: StaffMedico): void {
    // Navigate to create disponibilidad with return navigation parameters
    this.router.navigate(['/disponibilidades-medico/new'], { 
      queryParams: { 
        staffMedicoId: staff.id,
        fromCentro: this.centroAtencion.id,
        returnTab: 'staff-medico'
      } 
    });
  }

  gestionarDisponibilidadAvanzada(staff: StaffMedico): void {
    // Navigate to advanced disponibilidad management with return navigation parameters
    this.router.navigate(['/disponibilidades-medico'], { 
      queryParams: { 
        staffMedicoId: staff.id,
        fromCentro: this.centroAtencion.id,
        returnTab: 'staff-medico'
      } 
    });
  }

  desasociarMedico(staff: StaffMedico): void {
    if (!staff.id) return;

    this.messageHandler.confirm(
      'Confirmar desasociación',
      `¿Está seguro que desea desasociar al médico ${this.getMedicoNombre(staff)}?`,
      'Esta acción no se puede deshacer.'
    ).then((result) => {
      if (result) {
        this.staffMedicoService.remove(staff.id!).subscribe({
          next: () => {
            this.loadStaffMedico();
            this.mostrarMensajeStaff('Médico desasociado correctamente', 'success');
          },
          error: (error: any) => {
            this.mostrarMensajeStaff('Error al desasociar médico', 'danger');
          }
        });
      }
    });
  }

  crearNuevaDisponibilidad(staff: StaffMedico): void {
    // Navigate to create new disponibilidad with return navigation parameters
    this.router.navigate(['/disponibilidades-medico/new'], { 
      queryParams: { 
        staffMedicoId: staff.id,
        fromCentro: this.centroAtencion.id,
        returnTab: 'staff-medico'
      } 
    });
  }

  verDisponibilidadesStaff(staff: StaffMedico): DisponibilidadMedico[] {
    // Return disponibilidades for this staff member
    return this.disponibilidadesMedico.filter(d => d.staffMedicoId === staff.id);
  }

  calcularDuracionHorario(horario: any): string {
    if (!horario.horaInicio || !horario.horaFin) return '';
    
    const inicio = new Date(`1970-01-01T${horario.horaInicio}`);
    const fin = new Date(`1970-01-01T${horario.horaFin}`);
    const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60); // En horas
    
    return `${duracion.toFixed(1)}h`;
  }

  editarDisponibilidad(disponibilidad: DisponibilidadMedico): void {
    // Navigate to edit disponibilidad with return navigation parameters
    this.router.navigate(['/disponibilidades-medico', disponibilidad.id], {
      queryParams: {
        fromCentro: this.centroAtencion.id,
        returnTab: 'staff-medico'
      }
    });
  }

  eliminarDisponibilidad(disponibilidadOrStaff: DisponibilidadMedico | StaffMedico, disponibilidad?: DisponibilidadMedico): void {
    // Handle both calling patterns
    const targetDisponibilidad = disponibilidad || disponibilidadOrStaff as DisponibilidadMedico;
    
    if (!targetDisponibilidad.id) return;

    this.messageHandler.confirm(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar esta disponibilidad?',
      'Esta acción no se puede deshacer.'
    ).then((result) => {
      if (result) {
        this.disponibilidadMedicoService.remove(targetDisponibilidad.id!).subscribe({
          next: () => {
            // Reload disponibilidades for the staff member
            const staff = this.staffMedicoCentro.find(s => s.id === targetDisponibilidad.staffMedicoId);
            if (staff) {
              this.cargarDisponibilidadesStaff(staff);
            }
            this.mostrarMensajeStaff('Disponibilidad eliminada correctamente', 'success');
          },
          error: (error: any) => {
            this.mostrarMensajeStaff('Error al eliminar disponibilidad', 'danger');
          }
        });
      }
    });
  }
}