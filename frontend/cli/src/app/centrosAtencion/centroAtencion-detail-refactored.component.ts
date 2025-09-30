import { Component, AfterViewInit, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAtencion } from './centroAtencion';
import { ActivatedRoute, Router } from '@angular/router';
import { CentroAtencionService } from './centroAtencion.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import { ModalService } from '../modal/modal.service';
import { HttpClient } from '@angular/common/http';
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
import { DataPackage } from '../data.package';

// Importar los tabs separados
import { CentroAtencionDetalleTabComponent } from './tabs/detalle/centro-atencion-detalle-tab.component';
import { CentroAtencionConsultoriosTabComponent } from './tabs/consultorios/centro-atencion-consultorios-tab.component';
import { CentroAtencionEspecialidadesTabComponent } from './tabs/especialidades/centro-atencion-especialidades-tab.component';
import { CentroAtencionStaffMedicoTabComponent } from './tabs/staff-medico/centro-atencion-staff-medico-tab.component';
import { CentroAtencionOrganigramaTabComponent } from './tabs/organigrama/centro-atencion-organigrama-tab.component';

@Component({
  selector: 'app-centro-atencion-detail-refactored',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    NgbTypeaheadModule, 
    RouterModule,
    CentroAtencionDetalleTabComponent,
    CentroAtencionConsultoriosTabComponent,
    CentroAtencionEspecialidadesTabComponent,
    CentroAtencionStaffMedicoTabComponent,
    CentroAtencionOrganigramaTabComponent
  ],
  templateUrl: './centroAtencion-detail-refactored.component.html',
  styleUrls: ['./centroAtencion-detail.component.css'],
})
export class CentroAtencionDetailRefactoredComponent implements AfterViewInit, OnInit {
  // ==================== VIEWCHILD ====================
  @ViewChild(CentroAtencionEspecialidadesTabComponent) especialidadesTab!: CentroAtencionEspecialidadesTabComponent;

  // ==================== PROPIEDADES PRINCIPALES ====================
  centroAtencion!: CentroAtencion;
  form: any = { invalid: false, valid: true };
  activeTab: string = 'detalle';
  modoEdicion = false;

  // ==================== DATOS DE DOMINIO (SRP) ====================
  consultorios: Consultorio[] = [];
  staffMedicoCentro: StaffMedico[] = [];
  medicosDisponibles: Medico[] = [];
  medicosDisponiblesParaAsociar: Medico[] = [];
  especialidadesAsociadas: Especialidad[] = [];
  especialidadesDisponibles: Especialidad[] = [];
  esquemasSemana: EsquemaTurno[] = [];
  disponibilidadesMedico: DisponibilidadMedico[] = [];

  // ==================== ESTADO DE UI (SRP) ====================
  especialidadSeleccionada: Especialidad | null = null;
  especialidadesMedico: Especialidad[] = [];
  medicoSeleccionado: Medico | null = null;
  searchMedicoTerm: string = '';
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

  // ==================== MENSAJES DE UI (SRP) ====================
  mensaje: string = '';
  tipoMensaje: string = '';
  mensajeConsultorio: string = '';
  tipoMensajeConsultorio: string = '';
  mensajeStaff: string = '';
  tipoMensajeStaff: string = '';

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    if (this.showMap) {
      this.initializeMap();
    }
  }

  ngOnInit(): void {
    this.get();
    this.cargarEsquemasParaSemana();
    
    // Manejar activación de tab desde query params (para navegación de retorno)
    this.route.queryParams.subscribe(params => {
      const activeTabParam = params['activeTab'];
      if (activeTabParam && ['detalle', 'consultorios', 'especialidades', 'staff'].includes(activeTabParam)) {
        this.activeTab = activeTabParam;
      }
    });
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  get(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.centroAtencion = this.newCentroAtencion();
      this.modoEdicion = true;
      return;
    }

    this.centroAtencionService.get(+id).subscribe({
      next: (dataPackage: DataPackage<CentroAtencion>) => {
        this.centroAtencion = dataPackage.data;
        this.coordenadas = this.centroAtencion.latitud && this.centroAtencion.longitud ? 
          `${this.centroAtencion.latitud}, ${this.centroAtencion.longitud}` : '';
        this.loadAllData();
      },
      error: (error: any) => {
        console.error('Error al cargar centro de atención:', error);
        this.showMessage('Error al cargar los datos del centro de atención', 'danger');
      }
    });
  }

  save(): void {
    if (!this.validateForm()) return;

    this.processCoordinates();

    this.centroAtencionService.save(this.centroAtencion).subscribe({
      next: (dataPackage: DataPackage<CentroAtencion>) => {
        this.centroAtencion = dataPackage.data;
        this.modoEdicion = false;
        this.showMessage(
          this.centroAtencion.id ? 'Centro actualizado correctamente' : 'Centro creado correctamente',
          'success'
        );
      },
      error: (error: any) => {
        console.error('Error al guardar:', error);
        this.showMessage('Error al guardar el centro de atención', 'danger');
      }
    });
  }

  // ==================== MÉTODOS DE TAB DETALLE ====================

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.get(); // Recargar datos originales
  }

  confirmDelete(centro: CentroAtencion): void {
    if (confirm(`¿Está seguro que desea eliminar el centro ${centro.nombre}?`)) {
      this.delete(centro);
    }
  }

  delete(centro: CentroAtencion): void {
    if (!centro.id) return;

    this.centroAtencionService.delete(centro.id).subscribe({
      next: () => {
        this.showMessage('Centro eliminado correctamente', 'success');
        this.goBack();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.showMessage('Error al eliminar el centro de atención', 'danger');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/centros-atencion']);
  }

  allFieldsEmpty(): boolean {
    return !this.centroAtencion?.nombre?.trim() &&
           !this.centroAtencion?.direccion?.trim() &&
           !this.centroAtencion?.localidad?.trim() &&
           !this.centroAtencion?.provincia?.trim() &&
           !this.centroAtencion?.telefono?.trim();
  }

  // ==================== MÉTODOS DE MAPA ====================

  toggleMap(): void {
    this.showMap = !this.showMap;
    if (this.showMap) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  searchLocation(): void {
    if (!this.searchQuery.trim()) return;

    // Implementar búsqueda de ubicación
    console.log('Buscar ubicación:', this.searchQuery);
  }

  onLocationSelected(location: any): void {
    if (location && location.lat && location.lng) {
      this.coordenadas = `${location.lat}, ${location.lng}`;
      this.centroAtencion.latitud = location.lat;
      this.centroAtencion.longitud = location.lng;
    }
  }

  private initializeMap(): void {
    // Implementar inicialización del mapa
    console.log('Inicializar mapa');
  }

  // ==================== MÉTODOS DE CONSULTORIOS ====================

  crearNuevoConsultorio(): void {
    this.router.navigate(['/consultorios/new'], {
      queryParams: { centroId: this.centroAtencion.id, returnUrl: '/centros-atencion/' + this.centroAtencion.id }
    });
  }

  crearConsultorio(): void {
    if (!this.nuevoConsultorio.numero || !this.nuevoConsultorio.nombre.trim()) {
      this.showConsultorioMessage('Debe completar todos los campos', 'danger');
      return;
    }

    const consultorio: Consultorio = {
      id: 0,
      numero: this.nuevoConsultorio.numero,
      nombre: this.nuevoConsultorio.nombre,
      centroId: this.centroAtencion.id!
    };

    this.consultorioService.create(consultorio).subscribe({
      next: (dataPackage: DataPackage<Consultorio>) => {
        this.consultorios.push(dataPackage.data);
        this.cancelarCrearConsultorio();
        this.showConsultorioMessage('Consultorio creado correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al crear consultorio:', error);
        this.showConsultorioMessage('Error al crear el consultorio', 'danger');
      }
    });
  }

  cancelarCrearConsultorio(): void {
    this.modoCrearConsultorio = false;
    this.nuevoConsultorio = { numero: null, nombre: '' };
  }

  toggleConsultorioExpansion(consultorio: Consultorio): void {
    const id = consultorio.id || 0;
    this.consultorioExpandido[id] = !this.consultorioExpandido[id];
  }

  editarConsultorio(index: number): void {
    this.editConsultorioIndex = index;
  }

  editarHorariosConsultorio(consultorio: Consultorio): void {
    // Si recibe el consultorio actualizado del modal, actualizar la lista
    if (consultorio && consultorio.id) {
      const index = this.consultorios.findIndex(c => c.id === consultorio.id);
      if (index !== -1) {
        this.consultorios[index] = consultorio;
        this.showConsultorioMessage('Horarios actualizados correctamente', 'success');
        this.getConsultorios(); // Recargar para obtener datos frescos del servidor
      }
    }
  }

  guardarEdicionConsultorio(index: number): void {
    const consultorio = this.consultorios[index];
    if (!consultorio.id) return;
    
    this.consultorioService.update(consultorio.id, consultorio).subscribe({
      next: (dataPackage: DataPackage<Consultorio>) => {
        this.consultorios[index] = dataPackage.data;
        this.editConsultorioIndex = null;
        this.showConsultorioMessage('Consultorio actualizado correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al actualizar consultorio:', error);
        this.showConsultorioMessage('Error al actualizar el consultorio', 'danger');
      }
    });
  }

  cancelarEdicionConsultorio(): void {
    this.editConsultorioIndex = null;
    this.getConsultorios(); // Recargar datos originales
  }

  eliminarConsultorio(consultorio: Consultorio): void {
    if (!consultorio.id) return;

    if (confirm(`¿Está seguro que desea eliminar el consultorio ${consultorio.nombre}?`)) {
      this.consultorioService.delete(consultorio.id).subscribe({
        next: () => {
          this.consultorios = this.consultorios.filter(c => c.id !== consultorio.id);
          this.showConsultorioMessage('Consultorio eliminado correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al eliminar consultorio:', error);
          this.showConsultorioMessage('Error al eliminar el consultorio', 'danger');
        }
      });
    }
  }

  crearNuevoEsquema(consultorio: Consultorio): void {
    this.router.navigate(['/esquemas-turno/new'], {
      queryParams: { 
        consultorioId: consultorio.id, 
        centroId: this.centroAtencion.id,
        returnUrl: '/centros-atencion/' + this.centroAtencion.id + '?activeTab=consultorios'
      }
    });
  }

  // ==================== MÉTODOS DE ESPECIALIDADES ====================

  asociarEspecialidad(): void {
    if (!this.especialidadSeleccionada || !this.centroAtencion.id) return;

    // Verificar si ya está asociada
    const yaAsociada = this.especialidadesAsociadas.some(esp => esp.id === this.especialidadSeleccionada!.id);
    if (yaAsociada) {
      this.showMessage('Esta especialidad ya está asociada al centro', 'danger');
      return;
    }

    // Llamar al servicio para asociar la especialidad
    this.especialidadService.asociar(this.centroAtencion.id, this.especialidadSeleccionada.id!).subscribe({
      next: () => {
        // Actualizar las listas locales después de la asociación exitosa
        this.especialidadesAsociadas.push(this.especialidadSeleccionada!);
        this.especialidadesDisponibles = this.especialidadesDisponibles.filter(
          esp => esp.id !== this.especialidadSeleccionada!.id
        );
        this.especialidadSeleccionada = null;
        // Resetear el estado del componente hijo
        if (this.especialidadesTab) {
          this.especialidadesTab.modoAsociarEspecialidad = false;
          this.especialidadesTab.especialidadSeleccionada = null;
        }
        this.showMessage('Especialidad asociada correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al asociar especialidad:', error);
        this.showMessage('Error al asociar la especialidad', 'danger');
      }
    });
  }

  desasociarEspecialidad(especialidad: Especialidad): void {
    if (!this.centroAtencion.id || !especialidad.id) return;

    if (confirm(`¿Está seguro que desea desasociar la especialidad ${especialidad.nombre}?`)) {
      this.especialidadService.desasociar(this.centroAtencion.id, especialidad.id).subscribe({
        next: () => {
          this.especialidadesAsociadas = this.especialidadesAsociadas.filter(esp => esp.id !== especialidad.id);
          this.especialidadesDisponibles.push(especialidad);
          this.showMessage('Especialidad desasociada correctamente', 'success');
        },
        error: (error: any) => {
          console.error('Error al desasociar especialidad:', error);
          this.showMessage('Error al desasociar la especialidad', 'danger');
        }
      });
    }
  }

  // ==================== MÉTODOS DE STAFF MÉDICO ====================

  onMedicoSeleccionado(): void {
    if (this.medicoSeleccionado) {
      // Obtener todas las especialidades del médico
      let todasLasEspecialidades: Especialidad[] = this.medicoSeleccionado.especialidades || [];
      
      // Si no tiene especialidades múltiples pero tiene la especialidad única (compatibilidad hacia atrás)
      if (todasLasEspecialidades.length === 0 && this.medicoSeleccionado.especialidad) {
        todasLasEspecialidades = [this.medicoSeleccionado.especialidad];
      }
      
      // Filtrar especialidades que ya están asignadas al centro para este médico
      const especialidadesAsignadas = this.staffMedicoCentro
        .filter(staff => staff.medico?.id === this.medicoSeleccionado!.id) // Comparar con staff.medico.id
        .map(staff => staff.especialidad?.id); // Obtener especialidad.id del staff
      
      // Solo mostrar especialidades que NO están asignadas
      this.especialidadesMedico = todasLasEspecialidades.filter(esp => 
        !especialidadesAsignadas.includes(esp.id)
      );
    } else {
      this.especialidadesMedico = [];
    }
    this.especialidadSeleccionada = null;
  }

  onEspecialidadSeleccionadaChange(especialidad: Especialidad | null): void {
    console.log('Especialidad changed in parent:', especialidad);
    this.especialidadSeleccionada = especialidad;
  }

  asociarMedico(): void {
    console.log('asociarMedico method called in parent component');
    console.log('medicoSeleccionado:', this.medicoSeleccionado);
    console.log('especialidadSeleccionada:', this.especialidadSeleccionada);
    console.log('centroAtencion.id:', this.centroAtencion.id);
    
    if (!this.medicoSeleccionado || !this.especialidadSeleccionada || !this.centroAtencion.id) {
      console.log('Missing required data, returning early');
      return;
    }

    const staffMedico: StaffMedico = {
      id: 0,
      medico: {
        id: this.medicoSeleccionado.id!,
        nombre: this.medicoSeleccionado.nombre,
        apellido: this.medicoSeleccionado.apellido,
        dni: this.medicoSeleccionado.dni,
        matricula: this.medicoSeleccionado.matricula
      },
      centro: {
        id: this.centroAtencion.id,
        nombre: this.centroAtencion.nombre
      },
      especialidad: {
        id: this.especialidadSeleccionada.id!,
        nombre: this.especialidadSeleccionada.nombre
      }
    };

    console.log('Sending staffMedico to service:', staffMedico);

    this.staffMedicoService.create(staffMedico).subscribe({
      next: (dataPackage: DataPackage<StaffMedico>) => {
        console.log('Staff medico created successfully:', dataPackage);
        this.staffMedicoCentro.push(dataPackage.data);
        this.medicoSeleccionado = null;
        this.especialidadSeleccionada = null;
        this.especialidadesMedico = [];
        this.cargarMedicosDisponibles();
        this.showStaffMessage('Médico asociado correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al asociar médico:', error);
        this.showStaffMessage('Error al asociar el médico', 'danger');
      }
    });
  }

  desasociarMedico(staff: StaffMedico): void {
    if (!staff.id) return;

    const nombreMedico = `Dr. ${staff.medico?.nombre} ${staff.medico?.apellido}`;
    if (confirm(`¿Está seguro que desea desasociar a ${nombreMedico}?`)) {
      this.staffMedicoService.remove(staff.id).subscribe({
        next: () => {
          this.staffMedicoCentro = this.staffMedicoCentro.filter(s => s.id !== staff.id);
          this.cargarMedicosDisponibles();
          this.showStaffMessage('Médico desasociado correctamente', 'success');
        },
        error: (error: any) => {
          console.error('Error al desasociar médico:', error);
          this.showStaffMessage('Error al desasociar el médico', 'danger');
        }
      });
    }
  }

  toggleStaffMedicoExpansion(staff: StaffMedico): void {
    const id = staff.id || 0;
    this.staffMedicoExpandido[id] = !this.staffMedicoExpandido[id];
    
    if (this.staffMedicoExpandido[id]) {
      this.cargarDisponibilidadesStaff(staff);
    }
  }

  agregarDisponibilidad(staff: StaffMedico): void {
    this.router.navigate(['/disponibilidad-medicos/new'], {
      queryParams: { 
        staffMedicoId: staff.id,
        returnUrl: '/centros-atencion/' + this.centroAtencion.id + '?activeTab=staff'
      }
    });
  }

  gestionarDisponibilidadAvanzada(staff: StaffMedico): void {
    this.router.navigate(['/disponibilidad-medicos'], {
      queryParams: { 
        staffMedicoId: staff.id,
        returnUrl: '/centros-atencion/' + this.centroAtencion.id + '?activeTab=staff'
      }
    });
  }

  crearNuevaDisponibilidad(staff: StaffMedico): void {
    this.agregarDisponibilidad(staff);
  }

  onDisponibilidadCreada(disponibilidad: DisponibilidadMedico): void {
    // Actualizar las disponibilidades del staff médico específico
    if (disponibilidad.staffMedicoId) {
      this.cargarDisponibilidadesStaff(this.staffMedicoCentro.find(s => s.id === disponibilidad.staffMedicoId)!);
      
      // Mostrar mensaje de éxito
      this.mensajeStaff = 'Disponibilidad creada exitosamente';
      this.tipoMensajeStaff = 'success';
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        this.mensajeStaff = '';
        this.tipoMensajeStaff = '';
      }, 3000);
    }
  }

  onEsquemaCreado(esquema: EsquemaTurno): void {
    // Recargar esquemas del centro
    this.cargarEsquemasParaSemana();
    
    // Mostrar mensaje de éxito
    this.mensajeConsultorio = 'Esquema de turno creado exitosamente';
    this.tipoMensajeConsultorio = 'success';
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.mensajeConsultorio = '';
      this.tipoMensajeConsultorio = '';
    }, 3000);
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private newCentroAtencion(): CentroAtencion {
    return {
      id: 0,
      nombre: '',
      code: '',
      direccion: '',
      localidad: '',
      provincia: '',
      telefono: '',
      latitud: 0,
      longitud: 0
    };
  }

  private validateForm(): boolean {
    if (!this.centroAtencion.nombre?.trim()) {
      this.showMessage('El nombre del centro es requerido', 'danger');
      return false;
    }
    if (!this.centroAtencion.direccion?.trim()) {
      this.showMessage('La dirección es requerida', 'danger');
      return false;
    }
    if (!this.centroAtencion.localidad?.trim()) {
      this.showMessage('La localidad es requerida', 'danger');
      return false;
    }
    if (!this.centroAtencion.provincia?.trim()) {
      this.showMessage('La provincia es requerida', 'danger');
      return false;
    }
    if (!this.centroAtencion.telefono?.trim()) {
      this.showMessage('El teléfono es requerido', 'danger');
      return false;
    }
    return true;
  }

  private processCoordinates(): void {
    if (this.coordenadas.trim()) {
      const parts = this.coordenadas.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        this.centroAtencion.latitud = parts[0];
        this.centroAtencion.longitud = parts[1];
      }
    }
  }

  private loadAllData(): void {
    this.getConsultorios();
    this.cargarEspecialidadesAsociadas();
    this.cargarEspecialidadesDisponibles();
    this.loadStaffMedico();
    this.cargarMedicosDisponibles();
    this.cargarEsquemasTurno();
    this.cargarDisponibilidadesMedicas();
  }

  private getConsultorios(): void {
    if (!this.centroAtencion.id) return;

    this.consultorioService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dataPackage: DataPackage<Consultorio[]>) => {
        this.consultorios = dataPackage.data;
        console.log('Consultorios cargados:', this.consultorios);
        this.consultorios.forEach((consultorio, index) => {
          console.log(`Consultorio ${index}:`, consultorio);
          console.log(`- ID: ${consultorio.id}`);
          console.log(`- Numero: ${consultorio.numero}`);
          console.log(`- Nombre: ${consultorio.nombre}`);
        });
      },
      error: (error: any) => {
        console.error('Error al cargar consultorios:', error);
      }
    });
  }

  private cargarEspecialidadesAsociadas(): void {
    if (!this.centroAtencion.id) return;

    this.especialidadService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidadesAsociadas = dataPackage.data;
      },
      error: (error: any) => {
        console.error('Error al cargar especialidades asociadas:', error);
      }
    });
  }

  private cargarEspecialidadesDisponibles(): void {
    this.especialidadService.all().subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidadesDisponibles = dataPackage.data.filter((esp: Especialidad) => 
          !this.especialidadesAsociadas.some(asoc => asoc.id === esp.id)
        );
      },
      error: (error: any) => {
        console.error('Error al cargar especialidades disponibles:', error);
      }
    });
  }

  private loadStaffMedico(): void {
    if (!this.centroAtencion.id) return;

    this.staffMedicoService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dataPackage: DataPackage<StaffMedico[]>) => {
        this.staffMedicoCentro = dataPackage.data;
        // Cargar disponibilidades para cada staff médico
        this.cargarTodasLasDisponibilidadesStaff();
      },
      error: (error: any) => {
        console.error('Error al cargar staff médico:', error);
      }
    });
  }

  private cargarMedicosDisponibles(): void {
    this.medicoService.getAll().subscribe({
      next: (dataPackage: DataPackage<Medico[]>) => {
        this.medicosDisponibles = dataPackage.data;
        
        // Filtrar médicos que tienen especialidades no asignadas al centro
        this.medicosDisponiblesParaAsociar = dataPackage.data.filter((medico: Medico) => {
          // Si el médico no tiene especialidades, no puede ser asignado
          if (!medico.especialidades || medico.especialidades.length === 0) {
            return false;
          }
          
          // Obtener especialidades ya asignadas de este médico en este centro
          const especialidadesAsignadas = this.staffMedicoCentro
            .filter(staff => staff.medico?.id === medico.id) // Comparar con staff.medico.id
            .map(staff => staff.especialidad?.id); // Obtener especialidad.id del staff
          
          // Verificar si el médico tiene especialidades que aún no están asignadas
          const tieneEspecialidadesDisponibles = medico.especialidades.some(esp => 
            !especialidadesAsignadas.includes(esp.id)
          );
          
          return tieneEspecialidadesDisponibles;
        });
      },
      error: (error: any) => {
        console.error('Error al cargar médicos disponibles:', error);
      }
    });
  }

  private cargarDisponibilidadesStaff(staff: StaffMedico): void {
    if (!staff.id) return;

    this.disponibilidadMedicoService.byStaffMedico(staff.id).subscribe({
      next: (dataPackage: DataPackage<DisponibilidadMedico[]>) => {
        this.disponibilidadesStaff[staff.id!] = dataPackage.data;
        // Forzar detección de cambios para asegurar que la UI se actualice
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar disponibilidades para staff', staff.id, ':', error);
      }
    });
  }

  private cargarTodasLasDisponibilidadesStaff(): void {
    // Cargar disponibilidades para todos los staff médicos del centro
    this.staffMedicoCentro.forEach(staff => {
      if (staff.id) {
        this.cargarDisponibilidadesStaff(staff);
      }
    });
  }

  private cargarEsquemasParaSemana(): void {
    if (!this.centroAtencion?.id) return;

    this.esquemaTurnoService.getByCentroAtencion(this.centroAtencion.id).subscribe({
      next: (dataPackage: DataPackage<EsquemaTurno[]>) => {
        this.esquemasSemana = dataPackage.data;
        // Agrupar esquemas por consultorio
        this.esquemasConsultorio = {};
        this.esquemasSemana.forEach(esquema => {
          if (esquema.consultorioId) {
            if (!this.esquemasConsultorio[esquema.consultorioId]) {
              this.esquemasConsultorio[esquema.consultorioId] = [];
            }
            this.esquemasConsultorio[esquema.consultorioId].push(esquema);
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar esquemas:', error);
      }
    });
  }

  private cargarEsquemasTurno(): void {
    this.cargarEsquemasParaSemana();
  }

  private cargarDisponibilidadesMedicas(): void {
    // Cargar todas las disponibilidades médicas
    this.disponibilidadMedicoService.all().subscribe({
      next: (dataPackage: DataPackage<DisponibilidadMedico[]>) => {
        const todasDisponibilidades = dataPackage.data || [];
        // Filtrar por staff médico del centro actual
        this.disponibilidadesMedico = todasDisponibilidades.filter(d => {
          // Verificar si el staff médico pertenece a este centro
          const staffEnCentro = this.staffMedicoCentro.find(staff => staff.id === d.staffMedicoId);
          return !!staffEnCentro;
        });
      },
      error: (error: any) => {
        console.error('Error al cargar disponibilidades médicas:', error);
      }
    });
  }

  // ==================== MÉTODOS DE MENSAJES ====================

  private showMessage(message: string, type: string): void {
    this.mensaje = message;
    this.tipoMensaje = type;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 5000);
  }

  private showConsultorioMessage(message: string, type: string): void {
    this.mensajeConsultorio = message;
    this.tipoMensajeConsultorio = type;
    setTimeout(() => {
      this.mensajeConsultorio = '';
      this.tipoMensajeConsultorio = '';
    }, 5000);
  }

  private showStaffMessage(message: string, type: string): void {
    this.mensajeStaff = message;
    this.tipoMensajeStaff = type;
    setTimeout(() => {
      this.mensajeStaff = '';
      this.tipoMensajeStaff = '';
    }, 5000);
  }

  // ==================== MÉTODOS DE ESQUEMAS ====================

  /**
   * Ver detalle de un esquema de turno
   */
  verDetalleEsquema(esquema: any): void {
    this.router.navigate(['/esquema-turno', esquema.id], {
      queryParams: {
        fromCentro: this.centroAtencion.id,
        returnTab: 'consultorios'
      }
    });
  }

  /**
   * Editar un esquema de turno existente
   */
  editarEsquema(esquema: any): void {
    this.router.navigate(['/esquema-turno', esquema.id], {
      queryParams: {
        fromCentro: this.centroAtencion.id,
        returnTab: 'consultorios'
      }
    });
  }
}
