import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consultorio } from '../../../consultorios/consultorio';
import { EsquemaTurno } from '../../../esquemaTurno/esquemaTurno';

@Component({
  selector: 'app-centro-atencion-consultorios-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centro-atencion-consultorios-tab.component.html',
  styleUrls: ['./centro-atencion-consultorios-tab.component.css']
})
export class CentroAtencionConsultoriosTabComponent implements OnInit {
  @Input() consultorios: Consultorio[] = [];
  @Input() modoCrearConsultorio: boolean = false;
  @Input() editConsultorioIndex: number | null = null;
  @Input() nuevoConsultorio: { numero: number | null, nombre: string } = { numero: null, nombre: '' };
  @Input() mensajeConsultorio: string = '';
  @Input() tipoMensajeConsultorio: string = '';
  @Input() consultorioExpandido: { [consultorioId: number]: boolean } = {};
  @Input() esquemasSemana: EsquemaTurno[] = [];
  @Input() esquemasConsultorio: { [consultorioId: number]: EsquemaTurno[] } = {};

  @Output() modoCrearConsultorioChange = new EventEmitter<boolean>();
  @Output() crearNuevoConsultorio = new EventEmitter<void>();
  @Output() crearConsultorio = new EventEmitter<void>();
  @Output() cancelarCrearConsultorio = new EventEmitter<void>();
  @Output() toggleConsultorioExpansion = new EventEmitter<Consultorio>();
  @Output() editarConsultorio = new EventEmitter<number>();
  @Output() editarHorariosConsultorio = new EventEmitter<Consultorio>();
  @Output() guardarEdicionConsultorio = new EventEmitter<number>();
  @Output() cancelarEdicionConsultorio = new EventEmitter<void>();
  @Output() eliminarConsultorio = new EventEmitter<Consultorio>();
  @Output() crearNuevoEsquema = new EventEmitter<Consultorio>();
  @Output() verDetalleEsquema = new EventEmitter<EsquemaTurno>();
  @Output() editarEsquema = new EventEmitter<EsquemaTurno>();

  ngOnInit(): void {
    // Inicialización si es necesaria
    console.log('Consultorios recibidos en tab:', this.consultorios);
    console.log('Consultorio expandido:', this.consultorioExpandido);
  }

  onModoCrearConsultorio(): void {
    this.modoCrearConsultorioChange.emit(true);
  }

  onCrearNuevoConsultorio(): void {
    this.crearNuevoConsultorio.emit();
  }

  onCrearConsultorio(): void {
    this.crearConsultorio.emit();
  }

  onCancelarCrearConsultorio(): void {
    this.modoCrearConsultorioChange.emit(false);
    this.cancelarCrearConsultorio.emit();
  }

  onToggleConsultorioExpansion(consultorio: Consultorio): void {
    console.log('Toggling consultorio:', consultorio);
    console.log('Consultorio numero:', consultorio.numero);
    console.log('Consultorio nombre:', consultorio.nombre);
    this.toggleConsultorioExpansion.emit(consultorio);
  }

  onEditarConsultorio(index: number): void {
    this.editarConsultorio.emit(index);
  }

  onEditarHorariosConsultorio(consultorio: Consultorio): void {
    this.editarHorariosConsultorio.emit(consultorio);
  }

  onGuardarEdicionConsultorio(index: number): void {
    this.guardarEdicionConsultorio.emit(index);
  }

  onCancelarEdicionConsultorio(): void {
    this.cancelarEdicionConsultorio.emit();
  }

  onEliminarConsultorio(consultorio: Consultorio): void {
    this.eliminarConsultorio.emit(consultorio);
  }

  onCrearNuevoEsquema(consultorio: Consultorio): void {
    this.crearNuevoEsquema.emit(consultorio);
  }

  getEsquemasDelConsultorio(consultorioId: number): EsquemaTurno[] {
    // Primero intentar usar esquemasConsultorio si está disponible
    if (this.esquemasConsultorio[consultorioId]) {
      return this.esquemasConsultorio[consultorioId];
    }
    // Fallback a filtrar esquemasSemana
    return this.esquemasSemana.filter(esquema => esquema.consultorioId === consultorioId);
  }

  getEsquemasDelConsultorioPorDia(consultorioId: number, dia: string): EsquemaTurno[] {
    return this.getEsquemasDelConsultorio(consultorioId)
      .filter(esquema => esquema.horarios?.some(horario => horario.dia?.toUpperCase() === dia.toUpperCase()));
  }

  getColorBorde(dia: string): string {
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

  getHorarioEspecifico(consultorio: Consultorio, dia: string): any {
    return consultorio.horariosSemanales?.find(
      horario => horario.diaSemana?.toUpperCase() === dia.toUpperCase()
    );
  }

  getHorariosPorDia(esquema: EsquemaTurno, dia: string): any[] {
    return esquema.horarios?.filter(horario => 
      horario.dia?.toUpperCase() === dia.toUpperCase()
    ) || [];
  }

  onVerDetalleEsquema(esquema: EsquemaTurno): void {
    this.verDetalleEsquema.emit(esquema);
  }

  onEditarEsquema(esquema: EsquemaTurno): void {
    this.editarEsquema.emit(esquema);
  }
}
