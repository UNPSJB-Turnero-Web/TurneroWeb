import { Component } from "@angular/core";
import { NgbCalendar, NgbDateStruct, NgbDatepickerModule, NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { Agenda } from "./agenda";
import { ActivatedRoute, Router } from "@angular/router";
import { AgendaService } from "./agenda.service";
import { PacienteService } from "../pacientes/paciente.service";
import { TurnoService } from "../turnos/turno.service";
import { CommonModule, Location } from "@angular/common";
import { ModalService } from "../modal/modal.service";
import { Paciente } from "../pacientes/paciente";
import { Performance } from "./performance";
import { CentroAtencion } from "../centrosAtencion/centroAtencion";

import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";

import { Turno } from "../turnos/turno";
import { FormsModule } from "@angular/forms";
import { DataPackage } from "../data.package";

@Component({
  selector: "app-agenda-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTypeaheadModule, NgbDatepickerModule],
  templateUrl: 'agenda-detail.component.html',
  styles: ``,
})
export class AgendaDetailComponent {
  agenda!: Agenda;
  agendaDate!: NgbDateStruct;
  searching: boolean = false;
  searchFailed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agendaService: AgendaService,
    private pacienteService: PacienteService,
    private turnoService: TurnoService,
    private location: Location,
    private calendar: NgbCalendar,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.get();
  }

  get() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.agenda = {
        id: 0, // <- valor temporal
        date: new Date(), // <- valor por defecto
        paciente: <Paciente>{},
        performances: [], // <- Asegurar que exista el array
        centroAtencion: <CentroAtencion>{} // <- Add missing property initialization
      };
      this.agendaDate = this.calendar.getToday();
    } else {
      this.agendaService.get(parseInt(id!)).subscribe((dataPackage) => {
        this.agenda = <Agenda>dataPackage.data;
        this.agenda.performances ??= []; // <- Si viene null, lo inicializamos
        const agendaDateAux = new Date(this.agenda.date);
        this.agendaDate = {
          year: agendaDateAux.getFullYear(),
          month: agendaDateAux.getMonth() + 1,
          day: agendaDateAux.getDate()
        };
      });
    }
  }

  goBack() {
    this.location.back();
  }

  save() {
    if (!this.agendaDate) {
      this.agendaDate = this.calendar.getToday();
    }

    this.agenda.date = new Date(
      this.agendaDate.year,
      this.agendaDate.month - 1,
      this.agendaDate.day
    );

    this.agenda.performances.forEach((perf) => {
      perf.audience = Number(perf.audience);
    });

    console.log(this.agenda);
    this.agendaService.save(this.agenda).subscribe({
      next: (dataPackage) => {
        const id = (dataPackage.data as Agenda).id;
        console.log("✅ Agenda guardada con ID", id);
        this.router
          .navigateByUrl("/", { skipLocationChange: true })
          .then(() => this.router.navigate(["/agendas/" + id]));
      },
      error: (err) => {
        console.error("❌ Error al guardar la agenda:", err);
        alert("Hubo un error al guardar la agenda");
      },
    });
  }

  searchPaciente = (text$: Observable<string>): Observable<any[]> =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        this.pacienteService.search(term).pipe(
          map((response) => {
            let pacientes = <Paciente[]>response.data;
            return pacientes;
          }),
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );

  searchTurno = (text$: Observable<string>): Observable<any[]> =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        this.turnoService.search(term).pipe(
          map((response) => {
            let turnos = <Turno[]>response.data;
            return turnos;
          }),
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );

  resultFormat(value: any) {
    return value.name;
  }

  inputFormat(value: any) {
    return value ? value.name : null;
  }

  addPerformance() {
    if (!this.agenda.performances) {
      this.agenda.performances = [];
    }

    this.agenda.performances.push({
      turno: <Turno>{},
      audience: 0
    });
  }

  removePerformance(performance: Performance) {
    this.modalService
      .confirm("Eliminar performance", "¿Está seguro de borrar esta performance?", "El cambio no se puede deshacer")
      .then(() => {
        let performances = this.agenda.performances;
        performances.splice(performances.indexOf(performance), 1);
      });
  }

  remove(id: number): void {
    const that = this;
    this.modalService
      .confirm("Eliminar agenda", "¿Está seguro de borrar la agenda?", "Esta acción no se puede deshacer")
      .then(() => {
        that.agendaService.remove(id).subscribe(() => that.goBack());
      });
  }
}