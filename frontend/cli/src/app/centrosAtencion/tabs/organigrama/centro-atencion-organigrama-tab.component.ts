import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EsquemaTurno } from '../../../esquemaTurno/esquemaTurno';
import { Consultorio } from '../../../consultorios/consultorio';
import { StaffMedico } from '../../../staffMedicos/staffMedico';

interface OrganigramaData {
  dia: string;
  diaLabel: string;
  consultorios: {
    consultorio: Consultorio;
    esquemas: EsquemaTurno[];
  }[];
}

interface EsquemaConDetalles extends EsquemaTurno {
  consultorioNombre?: string;
  consultorioNumero?: number;
  medicoNombre?: string;
  especialidad?: string;
}

@Component({
  selector: 'app-centro-atencion-organigrama-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centro-atencion-organigrama-tab.component.html',
  styleUrls: ['./centro-atencion-organigrama-tab.component.css']
})
export class CentroAtencionOrganigramaTabComponent implements OnInit, OnChanges {
  @Input() consultorios: Consultorio[] = [];
  @Input() esquemasSemana: EsquemaTurno[] = [];
  @Input() esquemasConsultorio: { [consultorioId: number]: EsquemaTurno[] } = {};
  @Input() staffMedicoCentro: StaffMedico[] = [];
  @Input() centroId!: number;

  // Datos organizados para la vista
  organigramaSemanal: OrganigramaData[] = [];
  esquemasPorConsultorio: { [consultorioId: number]: EsquemaConDetalles[] } = {};
  
  // Configuración de vista
  vistaActual: 'semanal' | 'porConsultorio' | 'matriz' = 'semanal';
  
  // Filtros
  filtroConsultorio: number | null = null;
  filtroDia: string | null = null;
  filtroMedico: number | null = null;

  // Estadísticas
  estadisticas = {
    totalEsquemas: 0,
    consultoriosConEsquemas: 0,
    medicosActivos: 0,
    esquemasPorDia: {} as { [dia: string]: number }
  };

  constructor() {}

  ngOnInit(): void {
    this.procesarDatos();
    this.calcularEstadisticas();
  }

  ngOnChanges(): void {
    this.procesarDatos();
    this.calcularEstadisticas();
  }

  /**
   * Procesa y organiza todos los esquemas de turno para diferentes vistas
   */
  private procesarDatos(): void {
    this.procesarVistaSemanal();
    this.procesarVistaPorConsultorio();
  }

  /**
   * Organiza los datos para la vista semanal
   */
  private procesarVistaSemanal(): void {
    const dias = [
      { key: 'LUNES', label: 'Lunes' },
      { key: 'MARTES', label: 'Martes' },
      { key: 'MIERCOLES', label: 'Miércoles' },
      { key: 'JUEVES', label: 'Jueves' },
      { key: 'VIERNES', label: 'Viernes' },
      { key: 'SABADO', label: 'Sábado' },
      { key: 'DOMINGO', label: 'Domingo' }
    ];

    this.organigramaSemanal = dias.map(dia => ({
      dia: dia.key,
      diaLabel: dia.label,
      consultorios: this.consultorios.map(consultorio => ({
        consultorio,
        esquemas: this.getEsquemasDelConsultorioPorDia(consultorio.id!, dia.key)
      }))
    }));
  }

  /**
   * Organiza los datos por consultorio
   */
  private procesarVistaPorConsultorio(): void {
    this.esquemasPorConsultorio = {};
    
    this.consultorios.forEach(consultorio => {
      const esquemas = this.getEsquemasDelConsultorio(consultorio.id!);
      this.esquemasPorConsultorio[consultorio.id!] = esquemas.map(esquema => 
        this.enriquecerEsquema(esquema, consultorio)
      );
    });
  }

  /**
   * Enriquece un esquema con información adicional
   */
  private enriquecerEsquema(esquema: EsquemaTurno, consultorio: Consultorio): EsquemaConDetalles {
    const staffMedico = this.staffMedicoCentro.find(staff => staff.id === esquema.staffMedicoId);
    
    return {
      ...esquema,
      consultorioNombre: consultorio.nombre,
      consultorioNumero: consultorio.numero,
      medicoNombre: staffMedico?.medico ? 
        `${staffMedico.medico.nombre} ${staffMedico.medico.apellido}` : 
        esquema.nombreStaffMedico || 'Médico no especificado',
      especialidad: staffMedico?.especialidad?.nombre || 'Sin especialidad'
    };
  }

  /**
   * Calcula estadísticas del organigrama
   */
  private calcularEstadisticas(): void {
    const todosLosEsquemas = this.getAllEsquemas();
    
    this.estadisticas.totalEsquemas = todosLosEsquemas.length;
    
    // Consultorios con esquemas
    const consultoriosConEsquemas = new Set<number>();
    todosLosEsquemas.forEach(esquema => {
      if (esquema.consultorioId) {
        consultoriosConEsquemas.add(esquema.consultorioId);
      }
    });
    this.estadisticas.consultoriosConEsquemas = consultoriosConEsquemas.size;
    
    // Médicos activos
    const medicosActivos = new Set<number>();
    todosLosEsquemas.forEach(esquema => {
      if (esquema.staffMedicoId) {
        medicosActivos.add(esquema.staffMedicoId);
      }
    });
    this.estadisticas.medicosActivos = medicosActivos.size;
    
    // Esquemas por día
    this.estadisticas.esquemasPorDia = {};
    todosLosEsquemas.forEach(esquema => {
      esquema.horarios?.forEach(horario => {
        const dia = horario.dia;
        this.estadisticas.esquemasPorDia[dia] = (this.estadisticas.esquemasPorDia[dia] || 0) + 1;
      });
    });
  }

  /**
   * Obtiene todos los esquemas de turno
   */
  private getAllEsquemas(): EsquemaTurno[] {
    const todosLosEsquemas: EsquemaTurno[] = [];
    
    // Primero intentar usar esquemasConsultorio
    Object.values(this.esquemasConsultorio).forEach(esquemas => {
      todosLosEsquemas.push(...esquemas);
    });
    
    // Si no hay datos en esquemasConsultorio, usar esquemasSemana
    if (todosLosEsquemas.length === 0) {
      todosLosEsquemas.push(...this.esquemasSemana);
    }
    
    return todosLosEsquemas;
  }

  /**
   * Obtiene esquemas de un consultorio específico
   */
  getEsquemasDelConsultorio(consultorioId: number): EsquemaTurno[] {
    // Primero intentar usar esquemasConsultorio si está disponible
    if (this.esquemasConsultorio[consultorioId]) {
      return this.esquemasConsultorio[consultorioId];
    }
    // Fallback a filtrar esquemasSemana
    return this.esquemasSemana.filter(esquema => esquema.consultorioId === consultorioId);
  }

  /**
   * Obtiene esquemas de un consultorio en un día específico
   */
  getEsquemasDelConsultorioPorDia(consultorioId: number, dia: string): EsquemaTurno[] {
    return this.getEsquemasDelConsultorio(consultorioId)
      .filter(esquema => esquema.horarios?.some(horario => 
        horario.dia?.toUpperCase() === dia.toUpperCase()));
  }

  /**
   * Obtiene la string de horario para un día específico de un esquema
   */
  getHorarioStringPorDia(esquema: EsquemaTurno, dia: string): string {
    const horarios = esquema.horarios?.filter(horario => 
      horario.dia?.toUpperCase() === dia.toUpperCase()) || [];
    
    if (horarios.length > 0) {
      const horario = horarios[0]; // Tomar el primer horario del día
      const inicio = horario.horaInicio ? horario.horaInicio.substring(0,5) : '';
      const fin = horario.horaFin ? horario.horaFin.substring(0,5) : '';
      return `${inicio}-${fin}`;
    }
    return '';
  }

  /**
   * Obtiene el nombre del médico para un esquema
   */
  getNombreMedico(esquema: EsquemaTurno): string {
    const staffMedico = this.staffMedicoCentro.find(staff => staff.id === esquema.staffMedicoId);
    if (staffMedico?.medico) {
      return `Dr. ${staffMedico.medico.nombre} ${staffMedico.medico.apellido}`;
    }
    return esquema.nombreStaffMedico || 'Médico no especificado';
  }

  /**
   * Obtiene la especialidad del médico para un esquema
   */
  getEspecialidadMedico(esquema: EsquemaTurno): string {
    const staffMedico = this.staffMedicoCentro.find(staff => staff.id === esquema.staffMedicoId);
    return staffMedico?.especialidad?.nombre || 'Sin especialidad';
  }

  /**
   * Obtiene el color para un día de la semana
   */
  getColorDia(dia: string): string {
    const colores: { [key: string]: string } = {
      'LUNES': '#007bff',
      'MARTES': '#28a745',
      'MIERCOLES': '#ffc107',
      'JUEVES': '#17a2b8',
      'VIERNES': '#fd7e14',
      'SABADO': '#6f42c1',
      'DOMINGO': '#dc3545'
    };
    return colores[dia.toUpperCase()] || '#6c757d';
  }

  /**
   * Cambia la vista actual
   */
  cambiarVista(vista: 'semanal' | 'porConsultorio' | 'matriz'): void {
    this.vistaActual = vista;
  }

  /**
   * Aplica filtros a los datos
   */
  aplicarFiltros(): void {
    // La lógica de filtrado se aplicará en las funciones getter del template
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroConsultorio = null;
    this.filtroDia = null;
    this.filtroMedico = null;
  }

  /**
   * Verifica si un esquema pasa los filtros activos
   */
  pasaFiltros(esquema: EsquemaTurno): boolean {
    if (this.filtroConsultorio && esquema.consultorioId !== this.filtroConsultorio) {
      return false;
    }
    
    if (this.filtroMedico && esquema.staffMedicoId !== this.filtroMedico) {
      return false;
    }
    
    if (this.filtroDia) {
      const tieneElDia = esquema.horarios?.some(horario => 
        horario.dia?.toUpperCase() === this.filtroDia?.toUpperCase());
      if (!tieneElDia) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Obtiene esquemas filtrados para un consultorio
   */
  getEsquemasFiltrados(consultorioId: number): EsquemaTurno[] {
    return this.getEsquemasDelConsultorio(consultorioId).filter(esquema => this.pasaFiltros(esquema));
  }

  /**
   * Obtiene la lista de días únicos con esquemas
   */
  getDiasConEsquemas(): string[] {
    const dias = new Set<string>();
    this.getAllEsquemas().forEach(esquema => {
      esquema.horarios?.forEach(horario => {
        if (horario.dia) {
          dias.add(horario.dia);
        }
      });
    });
    return Array.from(dias).sort();
  }

  /**
   * Obtiene la lista de médicos únicos con esquemas
   */
  getMedicosConEsquemas(): { id: number, nombre: string }[] {
    const medicos = new Map<number, string>();
    this.getAllEsquemas().forEach(esquema => {
      if (esquema.staffMedicoId) {
        const nombre = this.getNombreMedico(esquema);
        medicos.set(esquema.staffMedicoId, nombre);
      }
    });
    
    return Array.from(medicos.entries()).map(([id, nombre]) => ({ id, nombre }));
  }

  /**
   * Cuenta esquemas filtrados para un día específico
   */
  contarEsquemasPorDia(diaData: OrganigramaData): number {
    return diaData.consultorios.reduce((sum, c) => {
      return sum + c.esquemas.filter(e => this.pasaFiltros(e)).length;
    }, 0);
  }

  /**
   * Verifica si un consultorio tiene esquemas filtrados para un día
   */
  tieneEsquemasFiltrados(esquemas: EsquemaTurno[]): boolean {
    return esquemas.filter(e => this.pasaFiltros(e)).length > 0;
  }

  /**
   * Obtiene esquemas filtrados de una lista
   */
  obtenerEsquemasFiltrados(esquemas: EsquemaTurno[]): EsquemaTurno[] {
    return esquemas.filter(e => this.pasaFiltros(e));
  }
}
