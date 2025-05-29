import { Component } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Turno } from './turno';
import { Especialidad } from '../especialidades/especialidad';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from './turno.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { PacienteService } from '../pacientes/paciente.service';
import { AgendaService } from '../agenda/agenda.service';
import { Observable, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs';
import { Paciente } from '../pacientes/paciente';
import { Agenda } from '../agenda/agenda';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DataPackage } from '../data.package'; // Add missing import

@Component({
  selector: 'app-turno-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
<div *ngIf="turno">
  <h2>{{ turno.name | uppercase }}</h2>
  <form #form="ngForm">
    <div class="form-group">
      <label for="name">Nombre del Turno:</label>
      <input name="name" required placeholder="Nombre" class="form-control" [(ngModel)]="turno.name" #name="ngModel">
      <div *ngIf="name.invalid && (name.dirty || name.touched)" class="alert">
        <div *ngIf="name.errors?.['required']">
          El nombre del turno es requerido.
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="code">Código:</label>
      <input name="code" placeholder="Código" class="form-control" [(ngModel)]="turno.code">
    </div>

    <div class="form-group">
      <label for="especialidad">Especialidad:</label>
      <input 
        class="form-control"
        [ngbTypeahead]="searchEspecialidades"
        [inputFormatter]="formatter"
        [resultFormatter]="formatter"
        [(ngModel)]="turno.especialidad"
        (selectItem)="onEspecialidadSelected($event.item)"
        name="especialidad"
        required
      />
    </div>

    <div class="form-group">
      <label for="paciente">Paciente:</label>
      <input 
        class="form-control"
        [ngbTypeahead]="searchPacientes"
        [inputFormatter]="formatterPaciente"
        [resultFormatter]="formatterPaciente"
        [(ngModel)]="turno.paciente"
        (selectItem)="onPacienteSelected($event.item)"
        name="paciente"
        required
      />
    </div>

    <div class="form-group">
      <label for="agenda">Agenda:</label>
      <input 
        class="form-control"
        [ngbTypeahead]="searchAgendas"

        [(ngModel)]="turno.agenda"
        (selectItem)="onAgendaSelected($event.item)"
        name="agenda"
        required
      />
    </div>

    <div class="form-group">
      <label for="estado">Estado:</label>
      <select name="estado" class="form-control" [(ngModel)]="turno.estado" required>
        <option value="pendiente">Pendiente</option>
        <option value="confirmado">Confirmado</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>

    <button (click)="goBack()" class="btn btn-danger">Atrás</button>
    <button (click)="save()" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
  </form>
</div>
  `,
  styles: ``
})
export class TurnoDetailComponent {
  turno!: Turno;
  especialidades: Especialidad[] = [];
  pacientes: Paciente[] = [];
  agendas: Agenda[] = [];
  selectedEspecialidad!: Especialidad;

  constructor(
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private especialidadService: EspecialidadService,
    private pacienteService: PacienteService,
    private agendaService: AgendaService,
    private location: Location
  ) {}

  goBack(): void {
    this.location.back();
  }

  save(): void {
    console.log(this.turno);
    this.turnoService.save(this.turno).subscribe((dataPackage) => {
      this.turno = dataPackage.data as Turno;
      this.goBack();
    });
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'turnos/new') {
      this.turno = <Turno>{ especialidad: {}, paciente: {}, agenda: {} };
    } else {
      const code = this.route.snapshot.paramMap.get('code')!;
      this.turnoService.get(code).subscribe((dataPackage) => {
        this.turno = dataPackage.data as Turno;
      });
    }
  }

  getEspecialidades(): void {
    this.especialidadService.all().subscribe((res) => {
      this.especialidades = res.data as Especialidad[];
    });
  }

  // 🔍 Autocompletado para especialidades
  searchEspecialidades = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.especialidadService.search(term).pipe(
          map((response: DataPackage<Especialidad[]>) => response.data) // Explicitly type the response
        )
      )
    );

  formatter = (x: Especialidad) => x.nombre;

  onEspecialidadSelected(especialidad: Especialidad): void {
    this.turno.especialidad = especialidad;
  }

  // 🔍 Autocompletado para pacientes
  searchPacientes = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.pacienteService.search(term).pipe(
          map((response) => {
            if (Array.isArray(response)) {
              return response as Paciente[]; // Handle plain array response
            }
            return response.data as Paciente[]; // Handle DataPackage response
          })
        )
      )
    );

  formatterPaciente = (x: Paciente) => `${x.name} ${x.apellido}`;

  onPacienteSelected(paciente: Paciente): void {
    this.turno.paciente = paciente;
  }

  // 🔍 Autocompletado para agendas
  searchAgendas = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.agendaService.search(term).pipe(
          map((response) => {
            if (Array.isArray(response)) {
              return response as Agenda[]; // Handle plain array response
            }
            return response.data as Agenda[]; // Handle DataPackage response
          })
        )
      )
    );


  onAgendaSelected(agenda: Agenda): void {
    this.turno.agenda = agenda;
  }

  ngOnInit(): void {
    this.getEspecialidades();
    this.get();
    this.selectedEspecialidad = this.turno.especialidad;
  }
}
